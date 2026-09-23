// arsenal's verification checks: toolchain resolution (fvm vs plain flutter) and the
// CHECKS/TIER_CHECKS table. Moved out of the v1 tool/harness/verify shim with behavior
// unchanged. Not expressible as plain config.json because:
//
//   - `assets` is an in-process structural check with no cmd (see assetcheck.mjs).
//   - the flutter binary itself is chosen dynamically per host: prefer `fvm flutter`
//     when .fvmrc's pinned version is cached under ~/fvm/versions, else fall back to
//     plain `flutter` — not a fixed [bin, args] pair a config check can express.
//   - `publish_dry_run` is advisory (required: false) and only present at the full tier.
//
// See tool/harness/verify (v1, removed by this migration) for the original inline
// version of this table.

import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { homedir } from "node:os";
import { spawnSync } from "node:child_process";
import { join } from "node:path";

import { checkDeclaredAssets } from "./assetcheck.mjs";

function toolOnPath(bin) {
  return spawnSync("command", ["-v", bin], { shell: true, encoding: "utf8" }).status === 0;
}

function pinnedFlutterVersion(cwd) {
  try {
    const v = JSON.parse(readFileSync(join(cwd, ".fvmrc"), "utf8")).flutter;
    return typeof v === "string" && v.length > 0 ? v : null;
  } catch {
    return null;
  }
}

function plainFlutterVersion() {
  const r = spawnSync("flutter", ["--version"], { encoding: "utf8", timeout: 120_000 });
  if (r.status !== 0) return null;
  const m = /Flutter (\S+)/.exec(`${r.stdout ?? ""}`);
  return m ? m[1] : null;
}

/**
 * { ok:true, bin, prefix, label, pinned, resolved, matchesPin } | { ok:false, reason }
 * `prefix` is prepended to every flutter arg list (["flutter"] for fvm, [] for plain).
 */
export function resolveFlutter(cwd) {
  const pinned = pinnedFlutterVersion(cwd);
  if (pinned && toolOnPath("fvm")) {
    const cached = join(homedir(), "fvm", "versions", pinned);
    if (existsSync(cached)) {
      return { ok: true, bin: "fvm", prefix: ["flutter"], label: `fvm flutter (${pinned})`, pinned, resolved: pinned, matchesPin: true };
    }
  }
  if (toolOnPath("flutter")) {
    const resolved = plainFlutterVersion();
    return {
      ok: true,
      bin: "flutter",
      prefix: [],
      label: `flutter (${resolved ?? "unknown version"})`,
      pinned,
      resolved,
      matchesPin: pinned === null || resolved === null ? null : resolved === pinned,
    };
  }
  const detail = pinned ? `neither \`fvm\` (with ${pinned} cached; run \`fvm install ${pinned}\`) nor \`flutter\` is on PATH` : "the `flutter` CLI is not on PATH";
  return { ok: false, reason: detail };
}

function hasDartTestFiles(cwd) {
  const root = join(cwd, "test");
  if (!existsSync(root)) return false;
  const stack = [root];
  while (stack.length > 0) {
    const dir = stack.pop();
    let entries;
    try {
      entries = readdirSync(dir);
    } catch {
      continue;
    }
    for (const name of entries) {
      const abs = join(dir, name);
      let st;
      try {
        st = statSync(abs);
      } catch {
        continue;
      }
      if (st.isDirectory()) stack.push(abs);
      else if (name.endsWith("_test.dart")) return true;
    }
  }
  return false;
}

// Dependencies are a precondition, not a check: the verifier never mutates the
// workspace. Missing deps are reported honestly as "could not run" (skipped).
function depsFetched(cwd, subdir) {
  const root = subdir ? join(cwd, subdir) : cwd;
  return existsSync(join(root, ".dart_tool", "package_config.json"));
}

/**
 * Builds the CHECKS table for repo root `root`, resolving the flutter/fvm toolchain
 * once. Returns { all: {name: Check}, flutter }. `flutter`'s resolution happens once
 * per buildVerificationPlan call, same as v1's once-per-process resolution.
 */
export function buildChecks(root) {
  const flutter = resolveFlutter(root);
  const flutterCmd = (...args) => (flutter.ok ? [flutter.bin, [...flutter.prefix, ...args]] : ["flutter", args]);

  const all = {
    assets: {
      name: "assets",
      description: "declared font/screenshot assets exist (pubspec.yaml)",
      required: true,
      available: () => null,
      run: async (ctx) => {
        const r = checkDeclaredAssets({ cwd: ctx.root });
        return { status: r.ok ? "passed" : "failed", detail: r.detail ?? "", exit_code: r.ok ? 0 : 1 };
      },
    },
    analyze: {
      name: "analyze",
      description: "flutter analyze",
      required: true,
      cmd: flutterCmd("analyze"),
      available: (ctx) => {
        if (!flutter.ok) return flutter.reason;
        if (!depsFetched(ctx.root)) return "dependencies are not fetched (.dart_tool/package_config.json is absent) — run `make get`";
        return null;
      },
    },
    test: {
      name: "test",
      description: "flutter test (widget + 21 golden snapshots)",
      required: true,
      cmd: flutterCmd("test"),
      available: (ctx) => {
        if (!flutter.ok) return flutter.reason;
        if (!depsFetched(ctx.root)) return "dependencies are not fetched (.dart_tool/package_config.json is absent) — run `make get`";
        if (!hasDartTestFiles(ctx.root)) return "no test files: test/ contains no *_test.dart";
        return null;
      },
    },
    example_analyze: {
      name: "example_analyze",
      description: "flutter analyze (in example/)",
      required: true,
      cmd: flutterCmd("analyze"),
      subdir: "example",
      available: (ctx) => {
        if (!flutter.ok) return flutter.reason;
        if (!existsSync(join(ctx.root, "example", "pubspec.yaml"))) return "example/pubspec.yaml is absent";
        if (!depsFetched(ctx.root, "example")) return "example/ dependencies are not fetched — run `make get`";
        return null;
      },
    },
    publish_dry_run: {
      name: "publish_dry_run",
      description: "flutter pub publish --dry-run",
      // Advisory, not gating: `pub publish --dry-run` exits non-zero on any warning,
      // including "checked-in files are modified in git", true of any mid-task tree.
      required: false,
      cmd: flutterCmd("pub", "publish", "--dry-run"),
      available: (ctx) => {
        if (!flutter.ok) return flutter.reason;
        if (!existsSync(join(ctx.root, "pubspec.yaml"))) return "pubspec.yaml is absent";
        return null;
      },
    },
  };

  return { all, flutter };
}

export const TIER_CHECKS = {
  fast: ["assets", "analyze"],
  normal: ["assets", "analyze", "test", "example_analyze"],
  full: ["assets", "analyze", "test", "example_analyze", "publish_dry_run"],
};
