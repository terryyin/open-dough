// System settings → Usage's answer: one Token index point per finished
// dashboard-launched task of the chosen cohort, in end-time order, with the
// trailing moving average, the tariff version that weighed them and when the
// usage was last checked (`../server/usageBoundary.ts`).

export const usageTokenIndexEndpoint = "/__usage/token-index";

// How many of the latest eligible tasks the moving average spans.
export const movingAverageTasks = 10;

export type TokenIndexTask = {
  readonly id: string;
  readonly project: string;
  readonly identity: string | null;
  readonly title: string | null;
  // The reported outcome time, or else the last recorded activity.
  readonly endedAt: string;
  readonly index: number;
};

export type TokenIndexAnswer = {
  readonly cohort: { readonly tool: "codex"; readonly workflow: "execution" };
  readonly tariff: { readonly version: string; readonly label: string };
  readonly checkedAt: string;
  readonly tasks: readonly TokenIndexTask[];
  // From the tenth task on, the mean of each task's latest ten.
  readonly average: readonly { readonly at: string; readonly value: number }[];
};
