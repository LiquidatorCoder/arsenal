# AGENTS.md — arsenal

Rules for agents working in this repository. Everything here was read off this repo —
`pubspec.yaml`, `Makefile`, `.github/workflows/ci.yml`, `analysis_options.yaml`,
`.fvmrc`, `tool/*.sh`, `.claude/commands/arsenal-flow.md` and the `test/` layout. Nothing
is inherited from another project. Where a rule has a source, the source is named so a
later reader can re-check it instead of trusting this file.

## What this repo is

**arsenal** is a cyberpunk / tech-noir **Flutter design system**, published to pub.dev as
the `arsenal` package (currently `0.1.2`). It is a library, not an app. It ships
components, design tokens, a theme, and three bundled font families.

- Dart SDK `>=3.8.0 <4.0.0`, Flutter `>=3.19.0` (`pubspec.yaml`)
- **Flutter is pinned to 3.41.4 by `.fvmrc`** — see "Toolchain" below, this matters
- Lints: `package:lint/analysis_options.yaml` plus `strict-casts`, `strict-inference`,
  `strict-raw-types` (`analysis_options.yaml`). Static analysis currently reports no
  issues; keep it that way.
- No codegen: no `build_runner`, no `*.g.dart`, no `freezed`
- No network, credential, persistence or platform-channel code anywhere in `lib/`

## Layout

```
lib/arsenal.dart        the single export barrel — the public API surface
lib/colors.dart         \
lib/spacing.dart         |  design tokens: changing one of these four restyles
lib/typography.dart      |  every consumer app and re-renders every golden
lib/theme.dart          /
lib/components/ar_*.dart  the components (ArButton, ArChip, ArScaffold, ...)
lib/examples/ar_example_*.dart  full example screens, also exported
lib/fonts/*.ttf         bundled font binaries, declared in pubspec `flutter: fonts:`
test/*_test.dart        one test file per component
test/goldens/*.png      21 committed golden snapshots — the main regression evidence
test/flutter_test_config.dart   installs a golden comparator with 0.5% pixel tolerance
test/arsenal_test_helpers.dart  loads fonts; pumps at a fixed 390x844 @3x surface
example/                demo app with its own pubspec
tool/update_goldens.sh  regenerate goldens for changed components only
tool/pre_commit_goldens.sh  the same, as a pre-commit hook (`make install-hooks`)
```

Naming convention, observable throughout: components are `Ar`-prefixed widgets in
`lib/components/ar_<name>.dart`, each with `test/ar_<name>_test.dart` and one or more
`test/goldens/ar_<name>_<variant>.png`. Follow it.

## Commands

These are the repo's real commands, from the `Makefile` and CI. Prefer `make`.

| Command | What it does |
|---|---|
| `make get` | `flutter pub get` for the package **and** `example/` |
| `make analyze` | `flutter analyze` |
| `make test` | `flutter test` — widget + golden suite |
| `make verify-goldens` | same as `make test`; fails if any golden mismatches |
| `make update-goldens` | `./tool/update_goldens.sh` — regenerates only affected goldens |
| `make install-hooks` | installs the pre-commit golden hook (run once per clone) |

CI (`.github/workflows/ci.yml`, macOS) reads the version from `.fvmrc`, installs it,
then runs `make get` → `flutter analyze` → `make verify-goldens`.

## Toolchain — use `fvm flutter`

`.fvmrc` pins **Flutter 3.41.4**, and this repo's own golden scripts
(`tool/update_goldens.sh`, `tool/pre_commit_goldens.sh`) invoke **`fvm flutter`**. The
`Makefile` says plain `flutter`; CI gets away with that only because the workflow
installs the pinned version first.

Locally the two are **not** interchangeable. Golden PNGs are rendered by the Flutter
engine, so running the suite on a different Flutter can fail goldens for reasons that
have nothing to do with your change. Use `fvm flutter ...` (or `fvm exec make ...`).
`tool/harness/verify` resolves this automatically, prefers the pinned SDK, and warns in
its output and in `verify.json` if it had to fall back.

## Goldens — the one thing to get right here

21 golden PNGs are committed. They are **generated evidence**: never hand-edit one, and
never `git add` a changed PNG you have not explained.

- Changing a **component** → regenerate only its goldens.
- Changing a **design token** (`colors`/`spacing`/`typography`/`theme`) or a **font** →
  regenerates **all** goldens. `tool/update_goldens.sh` already encodes this rule.
- `make update-goldens` does the right thing for the current diff.
- A golden diff you did not intend is a **bug report**, not a file to accept.

## Style — what the repo actually does

- **There is no formatter gate.** No format target in the `Makefile`, no format step in
  CI, and most Dart files here do not satisfy `dart format` — the source is written to a
  wider line than dart format's 80-column default. Do **not** run `dart format` across
  the repo: it would rewrite most of the tree for no reviewed reason. Match the
  surrounding file's width instead. The harness verifier deliberately does not gate on
  it (`.claude/docs/routing.yaml` → `not_checked`).
- Opacity is written `.withValues(alpha: x)`, never `.withOpacity()`
  (`.claude/commands/arsenal-flow.md`, and the components themselves).
- Component design conventions — the colour/typography/spacing tokens and how the
  cyberpunk look is assembled — are documented in `.claude/commands/arsenal-flow.md`.
  Read it before adding a component; it is the design reference, and this file does not
  duplicate it.

## Release path

`pubspec.yaml` (version, SDK constraints, font manifest, screenshot list),
`CHANGELOG.md`, `LICENSE`, `lib/arsenal.dart` (exports), the design tokens,
`lib/fonts/` and `screenshots/` are the release path. Changes there:

- verify at `full`, which adds an advisory `pub publish --dry-run` — read that one
  yourself, with everything committed, before actually publishing;
- get a `CHANGELOG.md` entry in the same change when the version moves;
- and for `pubspec.yaml`, `lib/arsenal.dart`, `LICENSE`, the design tokens or
  `lib/fonts/`, require an independent review (`tool/harness/review run`) — see
  `review:` in `.claude/docs/routing.yaml`.

`pubspec.lock` is gitignored here; do not commit it.

## Verification

Run the deterministic verifier; do not judge "done" by eye.

```
tool/harness/verify fast     # declared-asset check + analyze
tool/harness/verify normal   # + goldens + example analyze
tool/harness/verify full     # + publish dry-run (advisory, does not gate)
```

- Verification tiers and what each check is: `doc/agents/verification.md`.
- File → tier and file → review-mode policy: `.claude/docs/routing.yaml` (human form)
  and `tool/harness/lib/{classify,reviewpolicy}.mjs` (executable form). **Change both
  together** — they are kept in lockstep by hand, and both are policy files, so editing
  either invalidates existing `verify.json` artifacts on purpose.
- Task lifecycle: `.claude/tasks/README.md`. Drive it with `tool/harness/task`, never by
  editing `state.json`.
- `verify.json`, `review.json` and `adjudication.json` are generated evidence. Never
  hand-write one; the gate compares fingerprints and will catch it.
- Installed harness version: `.claude/harness-version`. The shared runtime lives at
  `~/.claude/harness/runtime/lib/` and is imported, not vendored.

## Known wart

`tool/harness/**` is not excluded from the published package, so its `.mjs` files are
part of the pub.dev archive (as `tool/*.sh` already were). The archive is ~3 MB and
`publish --dry-run` reports 0 warnings, so this was left alone rather than changing the
repo's publish semantics during the harness install. Adding a `.pubignore` is the fix if
it ever matters.
