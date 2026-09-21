// arsenal's declared-asset check.
//
// Every font this package ships is declared in pubspec.yaml's `flutter: fonts:` block,
// and every pub.dev carousel image in its top-level `screenshots:` block. Both are
// paths into the working tree that nothing else validates until something breaks
// somewhere expensive:
//
//   - a missing/renamed font asset makes `flutter pub publish` reject the package and
//     makes every golden render Ahem blocks instead of glyphs;
//   - a missing/renamed screenshot path makes `flutter pub publish` fail outright.
//     (This repo has already been bitten by the image path/caching class of problem —
//     see CHANGELOG 0.1.0+1, 0.1.1 and 0.1.2.)
//
// This is a structural check, not a linter: it reads the paths the pubspec actually
// declares and asserts each file exists. It runs in milliseconds and needs no toolchain,
// which is why it sits in the `fast` tier alongside analyze.
//
// Parsing note: pubspec.yaml is read line-wise for `- asset: <path>`, `path: <path>`
// under `screenshots:`, and nothing else. This is not a YAML parser and does not pretend
// to be one — Node ships no YAML parser and this repo, being a Dart package, has no
// dependency that provides one. If the pubspec is ever restructured so these forms stop
// appearing, this check reports "declared 0 assets", which `verify` treats as a failure
// rather than a silent pass.

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Declared asset paths, in file order.
 * Returns { fonts: [{path, line}], screenshots: [{path, line}] }.
 */
export function declaredAssets({ cwd, pubspec = "pubspec.yaml" }) {
  const text = readFileSync(join(cwd, pubspec), "utf8");
  const lines = text.split("\n");
  const fonts = [];
  const screenshots = [];
  let inScreenshots = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/^\s*#/.test(line)) continue;

    // A top-level key (column 0, not a list item) ends the screenshots block.
    if (/^[A-Za-z_]/.test(line)) inScreenshots = /^screenshots\s*:/.test(line);

    const asset = line.match(/^\s*-\s*asset\s*:\s*(\S+)\s*$/);
    if (asset) {
      fonts.push({ path: asset[1], line: i + 1 });
      continue;
    }
    if (inScreenshots) {
      const shot = line.match(/^\s*-?\s*path\s*:\s*(\S+)\s*$/);
      if (shot) screenshots.push({ path: shot[1], line: i + 1 });
    }
  }
  return { fonts, screenshots };
}

/**
 * { ok, declared, missing: [{kind, path, line}], detail }
 *
 * `ok` is false when any declared path is absent, and also when the pubspec declares no
 * assets at all — for this package that means the parse found nothing, not that the
 * package legitimately ships none.
 */
export function checkDeclaredAssets({ cwd }) {
  let declared;
  try {
    declared = declaredAssets({ cwd });
  } catch (e) {
    return { ok: false, declared: 0, missing: [], detail: `could not read pubspec.yaml: ${String(e.message ?? e)}` };
  }

  const missing = [];
  for (const f of declared.fonts) if (!existsSync(join(cwd, f.path))) missing.push({ kind: "font", ...f });
  for (const s of declared.screenshots) if (!existsSync(join(cwd, s.path))) missing.push({ kind: "screenshot", ...s });

  const total = declared.fonts.length + declared.screenshots.length;
  if (total === 0) {
    return {
      ok: false,
      declared: 0,
      missing: [],
      detail: "pubspec.yaml declared no font assets and no screenshots. arsenal bundles both, so this means the check could not read them — not that they are absent.",
    };
  }
  if (missing.length > 0) {
    const lines = missing.map((m) => `  missing ${m.kind}: ${m.path} (pubspec.yaml:${m.line})`);
    return { ok: false, declared: total, missing, detail: `${missing.length} declared asset(s) do not exist on disk:\n${lines.join("\n")}` };
  }
  return { ok: true, declared: total, missing: [], detail: `${declared.fonts.length} font asset(s) and ${declared.screenshots.length} screenshot(s) declared in pubspec.yaml all exist` };
}
