// arsenal's own review policy: changed files -> required independent-review mode.
//
// Repo-specific by design (the shared runtime ships no review policy — see
// ~/.claude/harness/runtime/README.md's "Left out" section).
//
// The judgement encoded here is narrow and deliberate. arsenal has no network calls, no
// credential handling, no persistence, no platform-channel code and no native signing
// configuration, so none of the usual trust-boundary categories apply. It has exactly
// two ways to affect anyone outside this checkout, and review gates those two only:
//
//   1. **Being published to pub.dev.** The version, the export barrel, the licence and
//      the bundled fonts all leave this machine inside an archive that downstream apps
//      install. A mistake there is public and permanent.
//   2. **The design tokens.** arsenal is a design system: `colors.dart`,
//      `spacing.dart`, `typography.dart` and `theme.dart` are inherited by every app
//      that depends on it. A token edit restyles consumer UI that no golden in THIS
//      repo can see. Goldens prove arsenal still renders as intended; they cannot prove
//      the intent was right. That is what a human/independent reviewer is for.
//
// Everything else — a component body, the example app, tests, docs — is fully covered
// by the deterministic verifier and needs no review.
//
// LOCKSTEP with `.claude/docs/routing.yaml`'s `review:` block — see the same note in
// classify.mjs.

import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { matchesPattern } from "./classify.mjs";

export const REVIEW_MODES = ["none", "standard", "adversarial"];
export const MODE_RANK = { none: 0, standard: 1, adversarial: 2 };

// Files whose content defines what review means here. Hashed into a review.json's
// review_policy_fingerprint.
export const REVIEW_POLICY_FILES = ["tool/harness/lib/reviewpolicy.mjs", "tool/harness/review", ".claude/docs/routing.yaml"];

// The publish path and the token path. Nothing else.
export const REVIEWED_PATH_PATTERNS = [
  { match: "pubspec.yaml", mode: "standard", why: "version, SDK constraints, the bundled-font manifest and publish metadata" },
  { match: "lib/arsenal.dart", mode: "standard", why: "a changed export is a breaking change for every consumer of the package" },
  { match: "LICENSE", mode: "standard", why: "distribution terms of a published artifact" },
  { match: "lib/colors.dart", mode: "standard", why: "a token change silently restyles every downstream app; no golden here can catch that" },
  { match: "lib/spacing.dart", mode: "standard", why: "a token change silently re-lays-out every downstream app" },
  { match: "lib/typography.dart", mode: "standard", why: "a token change silently changes text metrics in every downstream app" },
  { match: "lib/theme.dart", mode: "standard", why: "the ThemeData every consumer applies" },
  { match: "lib/fonts/**", mode: "standard", why: "font binaries are redistributed inside the published archive — rendering and licensing both matter" },
];

export const DEFAULT_MODE = "none";

export function maxMode(a, b) {
  return MODE_RANK[a] >= MODE_RANK[b] ? a : b;
}

/** { mode, reasons:[{path, mode, why}] } — reasons lists only files at the max mode. */
export function requiredReviewMode(changedFiles) {
  let mode = DEFAULT_MODE;
  const hits = [];
  for (const path of changedFiles) {
    for (const rule of REVIEWED_PATH_PATTERNS) {
      if (matchesPattern(path, rule.match)) {
        hits.push({ path, mode: rule.mode, why: rule.why });
        mode = maxMode(mode, rule.mode);
        break;
      }
    }
  }
  return { mode, reasons: hits.filter((h) => h.mode === mode) };
}

/** sha256 over REVIEW_POLICY_FILES' bytes. A missing file hashes as absent, not zero. */
export function reviewPolicyFingerprint({ cwd, policyFiles = REVIEW_POLICY_FILES }) {
  const h = createHash("sha256");
  const sep = Buffer.from([0]);
  for (const rel of [...policyFiles].sort()) {
    h.update(rel);
    h.update(sep);
    try {
      h.update(readFileSync(join(cwd, rel)));
    } catch {
      h.update("<absent>");
    }
    h.update(sep);
  }
  return `sha256:${h.digest("hex")}`;
}
