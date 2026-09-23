// arsenal's adapter: the only answer that config.json cannot express is the
// verification plan (in-process asset check + dynamic fvm/flutter binary choice —
// see adapter/checks.mjs). Classification, review mode, policy files, locks, review
// preamble and generated-file rules are all plain config.json data and use the v2
// core's config-driven defaults.

import { buildChecks, TIER_CHECKS } from "./adapter/checks.mjs";

export const adapterApi = 1;

export function buildVerificationPlan(ctx) {
  const { all } = buildChecks(ctx.root);
  const names = TIER_CHECKS[ctx.tier] ?? [];
  return names.map((name) => all[name]);
}
