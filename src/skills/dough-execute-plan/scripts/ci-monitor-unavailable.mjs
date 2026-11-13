// Structured loss causes for CI_MONITOR_UNAVAILABLE. Budget expiry and
// transport/provider observation errors stay distinguishable (ODF-121).
export const observationCause = Object.freeze({
  budgetExpired: "budget_expired",
  observationError: "observation_error",
});

export function monitorUnavailableEvent({
  repo,
  branch,
  workflow,
  reason,
  cause,
  ...rest
}) {
  return {
    type: "CI_MONITOR_UNAVAILABLE",
    repo,
    ...(branch === undefined ? {} : { branch }),
    ...(workflow === undefined ? {} : { workflow }),
    reason: String(reason).slice(0, 600),
    ...(cause === undefined ? {} : { cause }),
    ...rest,
  };
}
