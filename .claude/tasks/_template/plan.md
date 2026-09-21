# Plan: <task-id>

## Tier

<fast|normal|full> — <why; see .claude/docs/routing.yaml>

## Changes, file by file

| File | Change |
|---|---|
| | |

## Goldens

<Which `test/goldens/*.png` are expected to change. If a design token or font is
touched, the answer is "all 21" — say so explicitly. If none, say "none".>

## Verification

```
tool/harness/verify <tier> --json-out .claude/tasks/<task-id>/verify.json
```

## Risks

<what could go wrong, and how it would show up>
