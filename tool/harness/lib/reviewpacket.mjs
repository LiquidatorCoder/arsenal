// Builds the text packet handed to the independent reviewer, and the two fingerprints
// the completion gate compares it against.
//
// Repo-local on purpose: the shared runtime deliberately does not ship a packet builder
// (arch_wallet's carried a Dart-generated-file regex — see runtime/README.md's "Left
// out"). This one is arsenal-aware in the two ways that matter.
//
// arsenal-specific rule: **binary assets never enter the diff body.** This repo's
// changed-file set routinely includes 21 golden PNGs, .ttf font binaries and pub.dev
// screenshots. `git diff` renders those as "Binary files differ" at best and as
// megabytes of noise at worst, and a reviewer can do nothing useful with either. They
// are listed by name and byte-size-delta instead, which is the reviewable fact
// ("mission_control's golden changed") without the unreviewable bytes.
//
// Determinism is the whole contract here: `buildPacket` must produce byte-identical
// output for an unchanged workspace, or every review goes stale on the next gate check.
// Nothing time-, path-, or environment-dependent may enter the packet text.

import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";

// Binary assets this repo tracks. Listed, never diffed. (Dart codegen output is
// deliberately absent from this list: arsenal has no build_runner and no *.g.dart.)
const BINARY_RE = /\.(png|jpg|jpeg|gif|webp|ttf|otf|woff2?|ico)$/i;

const MAX_DIFF_BYTES = 400 * 1024;

export function sha256Hex(s) {
  return createHash("sha256").update(s).digest("hex");
}

export function fingerprintOf(text) {
  return `sha256:${sha256Hex(text)}`;
}

function readOr(path, fallback) {
  try {
    return readFileSync(path, "utf8");
  } catch {
    return fallback;
  }
}

/**
 * The brief/plan content the review was produced against. Kept separate from the packet
 * fingerprint so the gate can tell "the code changed" from "the task's own definition of
 * done changed" — both invalidate a review, for different reasons.
 */
export function reviewInputContentFingerprint({ cwd, taskId }) {
  const dir = join(cwd, ".claude", "tasks", taskId);
  const brief = readOr(join(dir, "brief.md"), "<absent>");
  const plan = readOr(join(dir, "plan.md"), "<absent>");
  return fingerprintOf(`v1\nbrief\n${brief}\nplan\n${plan}\n`);
}

/**
 * The reviewer's input. Returns the packet text; `fingerprintOf(text)` is what lands in
 * review.json's `review_input_fingerprint`.
 */
export function buildPacket({ cwd, taskId, base, changedEntries, mode, tier }) {
  const dir = join(cwd, ".claude", "tasks", taskId);
  const textual = changedEntries.filter((e) => !BINARY_RE.test(e.path));
  const binary = changedEntries.filter((e) => BINARY_RE.test(e.path));

  let diff = "";
  if (textual.length > 0) {
    try {
      diff = execFileSync("git", ["diff", "-M", base, "--", ...textual.map((e) => e.path)], {
        cwd,
        encoding: "utf8",
        maxBuffer: 64 * 1024 * 1024,
        stdio: ["ignore", "pipe", "pipe"],
      });
    } catch (e) {
      diff = `<diff unavailable: ${String(e.message ?? e).split("\n")[0]}>`;
    }
    if (diff.length > MAX_DIFF_BYTES) {
      diff = `${diff.slice(0, MAX_DIFF_BYTES)}\n...[diff truncated at ${MAX_DIFF_BYTES} bytes]`;
    }
  } else {
    diff = "<no textual changes in this change set>";
  }

  const lines = [
    "# Independent review packet — arsenal",
    "",
    "arsenal is a cyberpunk Flutter **design system**, published to pub.dev as the",
    "`arsenal` package. Review the diff below for correctness and for anything that",
    "would harm a downstream consumer:",
    "",
    "- a changed or removed export in `lib/arsenal.dart` (breaking for every consumer)",
    "- a changed widget constructor signature or default",
    "- a design-token change (`colors`/`spacing`/`typography`/`theme`) — these are",
    "  inherited by every app that depends on arsenal, and this repo's goldens can only",
    "  prove arsenal still renders as intended, never that the intent was right",
    "- `pubspec.yaml` version / SDK constraint / bundled-font manifest consistency, and",
    "  whether CHANGELOG.md records the change",
    "- font binaries added or replaced under `lib/fonts/` (these are redistributed)",
    "",
    "The `example/` app is a demo, not a product. Golden PNGs under `test/goldens/` are",
    "generated evidence — judge whether a visual change was intended, not the bytes.",
    "",
    `task_id: ${taskId}`,
    `mode: ${mode}`,
    `tier: ${tier}`,
    `base: ${base}`,
    "",
    "## Brief",
    "",
    readOr(join(dir, "brief.md"), "<no brief.md>").trimEnd(),
    "",
    "## Plan",
    "",
    readOr(join(dir, "plan.md"), "<no plan.md>").trimEnd(),
    "",
    "## Changed files",
    "",
    ...textual.map((e) => `- ${e.status} ${e.path}${e.oldPath ? ` (from ${e.oldPath})` : ""}`),
  ];
  if (binary.length > 0) {
    lines.push(
      "",
      "## Changed binary assets (listed, not diffed)",
      "",
      ...binary.map((e) => `- ${e.status} ${e.path}${e.oldPath ? ` (from ${e.oldPath})` : ""}`),
    );
  }
  lines.push("", "## Diff", "", "```diff", diff.trimEnd(), "```", "");
  return lines.join("\n");
}
