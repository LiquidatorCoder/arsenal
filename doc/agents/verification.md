# Verification — arsenal

`tool/harness/verify` is the only thing that decides whether a change is verified. Not
judgement, not "it looked right", not a passing run someone remembers. This document
describes what each tier actually runs in **this** repo.

```
tool/harness/verify <fast|normal|full> [--base <ref>] [--files a b ...]
                                       [--json-out <path>] [--quiet]
```

Exit `0` only when `result == "passed"`. Exit `1` for failed or incomplete. Exit `2` when
the verifier itself could not run.

## Tiers

| Tier | Checks | Roughly |
|---|---|---|
| `fast` | `assets`, `analyze` | ~6s |
| `normal` | `assets`, `analyze`, `test`, `example_analyze` | ~30s |
| `full` | `assets`, `analyze`, `test`, `example_analyze`, `publish_dry_run`\* | ~60s |

\* `publish_dry_run` is **advisory** — it runs and is reported, but does not gate. See below.

### The checks, and where each came from

| Check | Command | Source in this repo |
|---|---|---|
| `assets` | in-process (no toolchain) | **Harness-added** — asserts every `- asset:` font path and every `screenshots:` path declared in `pubspec.yaml` exists on disk. Milliseconds, which is why it sits in `fast`. |
| `analyze` | `flutter analyze` | `Makefile` `analyze:`; CI "Static analysis" |
| `test` | `flutter test` | `Makefile` `test:` / `verify-goldens:`; CI "Verify golden snapshots" |
| `example_analyze` | `flutter analyze` in `example/` | `Makefile` `get:` fetches `example/` deps; CI runs `make get` |
| `publish_dry_run` | `flutter pub publish --dry-run` | **Harness-added, not in CI, and advisory only.** Read-only. |

`assets` is cheap insurance against a class of failure this repo has actually hit: a
missing font asset makes every golden render Ahem blocks instead of glyphs, and a missing
screenshot path fails `pub publish` outright (see CHANGELOG 0.1.0+1, 0.1.1 and 0.1.2). It
reads `pubspec.yaml` line-wise for the two declaration forms — it is not a YAML parser and
does not pretend to be one; if it finds no declarations at all it reports a failure rather
than a silent pass.

`test` is the golden suite: 21 committed PNGs under `test/goldens/`, compared with the
0.5% pixel tolerance installed by `test/flutter_test_config.dart`. It is the check that
proves a visual change was the intended one.

### Not checked: `dart format`

Deliberate. This repo has never adopted it — absent from the `Makefile` and from CI, and
running it today rewrites 23 of 28 Dart files. Gating on it would manufacture a failure
that says nothing about the change under test. See `AGENTS.md` → Formatting.

### Why `publish_dry_run` is advisory

`pub publish --dry-run` exits non-zero on any *warning*, and one of its standard warnings
is "checked-in files are modified in git" — true of essentially every working tree
mid-task. Making it a required gate would block task completion for a reason that has
nothing to do with the change under test.

So it runs, its full output is printed, and it is recorded in `verify.json` (`required:
false`, plus an `advisory_failures` entry) — but it does not decide `result`. **Read it
yourself before publishing, with everything committed.** That is the only moment its
"checked-in files are modified" warning is meaningful.

Note for future edits: a top-level `docs/` directory makes this check warn
("Rename the top-level \"docs\" directory to \"doc\"") — pub's package layout wants the
singular `doc/`, which is why this document lives at `doc/agents/verification.md`.

## Toolchain resolution

`.fvmrc` pins Flutter **3.41.4**, and golden renders are engine-sensitive. The verifier
therefore:

1. uses `fvm flutter` when `.fvmrc` names a version FVM has cached;
2. otherwise falls back to plain `flutter` on PATH;
3. records which it used in `verify.json` under `toolchain`, and **warns** (stdout and
   `toolchain.matches_pin: false`) when the running Flutter is not the pinned one.

A mismatch is not treated as a failure — it is surfaced so a golden failure can be read
correctly as possible toolchain drift rather than a real regression.

## Required tier

Three independent sources decide the tier a change must reach; the **highest wins**:

1. the tier the task declared (`tool/harness/task start --tier ...`),
2. the deterministic classifier's opinion of the changed files
   (`tool/harness/lib/classify.mjs`, mirrored in `.claude/docs/routing.yaml`),
3. the tier the verify run itself recorded as required.

The classifier's headline rules for this repo: design tokens, fonts, the export barrel,
the golden comparator/helpers, and anything in the published archive require `full`;
components, tests, goldens, the example app and tooling require `normal`; docs are
`fast`.

## Honesty rules

These are properties of the implementation, not aspirations:

- A check is `passed` **only** if its command actually ran and actually exited zero.
- A check that could not run is `skipped`, is listed in `unsatisfied_required`, and makes
  the whole run `incomplete` — never `passed`.
- An **advisory** check (currently only `publish_dry_run`) is reported exactly as it
  happened but is excluded from `result` and from `unsatisfied_required`. Advisory status
  is declared in the check spec, never inferred from whether it happened to pass.
- Missing dependencies are reported as "could not run … run `make get`", not as a
  failure. The verifier never mutates the workspace, so it will not run `pub get` for you.
- A timeout or spawn failure is `skipped`, not `failed`: it is not evidence the code is
  wrong, and it must not be recorded as a pass either.

## The artifact

`--json-out` writes `verify.json`. It is **generated evidence — never hand-write or edit
one.** The completion gate (`tool/harness/gate`) reads it and refuses to complete a task
when it is missing, malformed, stale against the workspace or the verification policy,
failed, incomplete, or produced at too low a tier.

Key fields: `result`, `completion_tier_satisfied`, `unsatisfied_required`,
`required_tier`, `verification_policy_fingerprint`, `workspace_fingerprint`,
`verification_scope`, `toolchain`, `checks`.

## Independent review

Optional here, and required only on the publish path and the design-token path — see
`review:` in `.claude/docs/routing.yaml` and the reasoning in
`tool/harness/lib/reviewpolicy.mjs`. Reviewer model is pinned to `gpt-5.6-sol`;
`tool/harness/review run` writes an `incomplete` artifact and exits non-zero rather than
ever recording a review it did not obtain.
