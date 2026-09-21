// arsenal's own file classifier: changed files -> required verification tier.
//
// Repo-specific by design. The shared harness runtime (~/.claude/harness/runtime/lib)
// deliberately ships no classifier, because "what does this change risk" is a question
// only one repo can answer. This one answers it for a **golden-snapshot-backed Flutter
// design system published to pub.dev**.
//
// The two facts that drive almost every rule below, both discovered from this repo and
// not assumed:
//
//   1. `test/goldens/*.png` — 21 committed golden PNGs. Every visual change is proved
//      against them by `flutter test`. This repo's own `tool/update_goldens.sh` already
//      encodes the escalation rule: a change to one of the four TOKEN files
//      (colors/spacing/typography/theme) regenerates ALL goldens, a change to one
//      component regenerates only its own. That is a verification-tier rule, so it is
//      mirrored here rather than reinvented.
//   2. `arsenal` is published (pubspec `version:`, `repository:`, a CHANGELOG, a
//      pub.dev screenshot carousel). Anything that lands in the published archive can
//      not be taken back, so it verifies at `full`, which is the only tier that runs
//      `flutter pub publish --dry-run`.
//
// LOCKSTEP: `.claude/docs/routing.yaml` is the human-readable statement of this same
// policy and `RULES` below is its executable form. Node has no built-in YAML parser and
// this repo has no YAML dependency (it is a Dart package), so the policy is NOT parsed
// from that YAML at runtime. Change both files together. Both are in POLICY_FILES, so
// editing either invalidates every existing verify.json — drift is loud, not silent.

export const TIERS = ["fast", "normal", "full"];
export const TIER_RANK = { fast: 0, normal: 1, full: 2 };

// Files whose content defines what verification MEANS here. Hashed into every
// verify.json's verification_policy_fingerprint, so changing any of them forces a
// re-verify.
//
// Two entries are arsenal-specific and easy to miss:
//   - `.fvmrc` pins the Flutter SDK (3.41.4). Golden PNGs are rendered by the engine;
//     a different engine revision can change anti-aliasing and therefore what "the
//     tests pass" means. The pin is part of the verification contract.
//   - `test/flutter_test_config.dart` installs a tolerant golden comparator with a
//     0.5% pixel tolerance. That constant decides which renders count as passing, so
//     it is verification policy, not a test detail.
export const POLICY_FILES = [
  "tool/harness/verify",
  "tool/harness/lib/classify.mjs",
  "tool/harness/lib/assetcheck.mjs",
  "tool/harness/lib/reviewpolicy.mjs",
  ".claude/docs/routing.yaml",
  "analysis_options.yaml",
  ".fvmrc",
  "test/flutter_test_config.dart",
  "Makefile",
];

// Never part of a workspace fingerprint: task bookkeeping, managed worktrees, and
// Dart/Flutter build output for both the package and the example app. All of these are
// gitignored here anyway; listing them is belt-and-braces for an explicit --files scope.
// `screenshots/` is deliberately NOT excluded — those PNGs ship to pub.dev.
export const FINGERPRINT_EXCLUDE_PREFIXES = [
  ".claude/tasks/",
  ".claude/worktrees/",
  ".dart_tool/",
  "build/",
  "example/.dart_tool/",
  "example/build/",
  "coverage/",
];

// Shared resources a worker may serialize on. This repo has no build_runner/codegen and
// no device pool, so there is no `codegen` resource. `goldens` IS one: regenerating
// goldens (`tool/update_goldens.sh`, or the pre-commit hook, both `--update-goldens`)
// rewrites PNGs across `test/goldens/` tree-wide, so two workers must never do it at
// once.
export const LOCK_RESOURCES = ["dependency-resolution", "goldens", "repo-format", "release"];

// First match wins, in order. Mirrors routing.yaml's `classification:` block.
export const RULES = [
  // --- Design tokens: one edit re-renders every golden in the repo ------------------
  { match: "lib/colors.dart", tier: "full", why: "design token — tool/update_goldens.sh regenerates ALL goldens when it changes, and every downstream app inherits it" },
  { match: "lib/spacing.dart", tier: "full", why: "design token — regenerates ALL goldens; changes layout in every consumer" },
  { match: "lib/typography.dart", tier: "full", why: "design token — regenerates ALL goldens; changes text metrics in every consumer" },
  { match: "lib/theme.dart", tier: "full", why: "design token — regenerates ALL goldens; the ThemeData every consumer applies" },
  { match: "lib/fonts/**", tier: "full", why: "bundled font bytes are rendered into every golden AND shipped inside the published archive" },

  // --- Published API surface --------------------------------------------------------
  { match: "lib/arsenal.dart", tier: "full", why: "the single export barrel is this package's public API; a changed export is a breaking change downstream" },
  { match: "lib/**", tier: "normal", why: "components and example screens, each backed by a committed golden" },

  // --- What golden verification itself means ----------------------------------------
  { match: "test/flutter_test_config.dart", tier: "full", why: "installs the golden comparator and its 0.5% pixel tolerance — it defines what a passing render is" },
  { match: "test/arsenal_test_helpers.dart", tier: "full", why: "loads the fonts and fixes the 390x844@3x surface every golden is rendered on" },
  { match: "test/goldens/**", tier: "normal", why: "an accepted visual change must be re-proved by an actual test run, not by the PNG alone" },
  { match: "test/**", tier: "normal", why: "the widget + golden suite" },

  // --- The published artifact -------------------------------------------------------
  { match: "pubspec.yaml", tier: "full", why: "version, SDK constraints, the bundled-font manifest and the pub.dev screenshot list" },
  { match: "CHANGELOG.md", tier: "full", why: "part of the pub.dev release artifact" },
  { match: "LICENSE", tier: "full", why: "distribution terms of a published artifact; pub publish validates its presence" },
  { match: "screenshots/**", tier: "full", why: "referenced by pubspec `screenshots:` — a missing or renamed file fails pub publish validation" },
  { match: ".fvmrc", tier: "full", why: "the pinned Flutter SDK renders the goldens; changing it can invalidate all 21 at once" },

  // --- Tooling and policy -----------------------------------------------------------
  { match: "analysis_options.yaml", tier: "normal", why: "lint config re-scopes every analyze run" },
  { match: "Makefile", tier: "normal", why: "the repo's own command surface (get/test/analyze/verify-goldens)" },
  { match: ".github/workflows/**", tier: "normal", why: "CI definition — what 'passing' means on a PR" },
  { match: "tool/harness/**", tier: "normal", why: "verifier, gate and review logic" },
  { match: "tool/**", tier: "normal", why: "golden generation and the pre-commit hook that stages regenerated PNGs" },
  { match: ".claude/docs/routing.yaml", tier: "normal", why: "verification policy" },
  { match: "AGENTS.md", tier: "normal", why: "the rules agents work from" },

  // --- Demo app ---------------------------------------------------------------------
  // Not `fast`: example/ is analyzed by the `example_analyze` check, which only runs at
  // normal and above. Classifying it lower would let an example-only change complete
  // without ever analyzing the thing that changed.
  { match: "example/**", tier: "normal", why: "gated by the example_analyze check, which does not run at fast" },

  // --- Documentation ----------------------------------------------------------------
  { match: "README.md", tier: "fast", why: "documentation" },
  { match: "doc/**", tier: "fast", why: "documentation — `doc/`, singular, is the pub package-layout convention" },
  { match: ".claude/tasks/**", tier: "fast", why: "task bookkeeping" },
  { match: ".claude/**", tier: "fast", why: "agent configuration" },
  { match: "*", tier: "fast", why: "default floor — nothing here is verification-exempt" },
];

const DOUBLESTAR = "__HARNESS_DOUBLESTAR__";

/**
 * Minimal glob matcher for the forms RULES actually uses: an exact path, a `dir/**`
 * prefix, a single `*` segment wildcard, and the bare `*` catch-all. Deliberately not a
 * general glob implementation — a rule form not listed above is a policy authoring
 * mistake, and a silently-mismatching clever matcher would be worse than an obvious one.
 */
export function matchesPattern(path, pattern) {
  if (pattern === "*") return true;
  if (!pattern.includes("*")) return path === pattern;
  if (pattern.endsWith("/**")) {
    const prefix = pattern.slice(0, -2); // keep the trailing slash
    return path.startsWith(prefix);
  }
  const escaped = pattern.replace(/[.+^${}()|[\]\\]/g, "\\$&");
  const body = escaped.split("**").join(DOUBLESTAR).split("*").join("[^/]*").split(DOUBLESTAR).join(".*");
  return new RegExp(`^${body}$`).test(path);
}

/** The tier one path demands, plus the rule that decided it. */
export function classifyFile(path) {
  for (const rule of RULES) {
    if (matchesPattern(path, rule.match)) return { tier: rule.tier, rule: rule.match, why: rule.why };
  }
  // Unreachable while the `*` catch-all is present. Fail closed rather than return
  // undefined if someone ever removes it.
  return { tier: "full", rule: "(no rule matched)", why: "fail closed: no classification rule matched" };
}

/**
 * The highest tier any changed file demands. An EMPTY change set returns "fast" — the
 * floor, not "full": a verify run with nothing changed has nothing to escalate for.
 * Returns { requiredTier, reasons: [{path, tier, rule, why}] } with reasons listing only
 * the files that drove the maximum.
 */
export function classifyChanges(changedFiles) {
  let requiredTier = "fast";
  const all = [];
  for (const path of changedFiles) {
    const c = classifyFile(path);
    all.push({ path, ...c });
    if (TIER_RANK[c.tier] > TIER_RANK[requiredTier]) requiredTier = c.tier;
  }
  return { requiredTier, reasons: all.filter((r) => r.tier === requiredTier) };
}
