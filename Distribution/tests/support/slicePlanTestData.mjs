// @ts-check
// A slice plan's progress as the shared plan reader returns it: its slices and
// their execution completion. `./published-plan.mjs` encodes these facts as
// the plan's Markdown.

/** @typedef {import("./published-plan.mjs").PlanSlice} PlanSlice */
/** @typedef {import("./published-plan.mjs").PlanCompletion} PlanCompletion */
/** @typedef {import("./published-plan.mjs").PlanProgress} PlanProgress */

/**
 * A planned Behavior slice unless the case states its type or status.
 * @param {Omit<PlanSlice, "type" | "status"> & Partial<Pick<PlanSlice, "type" | "status">>} facts
 * @returns {PlanSlice}
 */
function planSlice({ type = "Behavior", status = "planned", ...facts }) {
  return { ...facts, type, status };
}

export class PlanSliceBuilder {
  /** @param {Parameters<typeof planSlice>[0]} facts */
  with(facts) {
    return { please: () => planSlice(facts) };
  }
}

export class SlicePlanBuilder {
  /** @param {PlanProgress} facts */
  with({ slices, completion }) {
    return {
      please: () => ({
        slices: slices.map((slice) => ({ ...slice })),
        ...(completion === undefined ? {} : { completion: { ...completion } }),
      }),
    };
  }

  /**
   * For progress cases where the slice names and proof recipes are incidental.
   * @param {readonly PlanSlice["status"][]} statuses
   * @param {PlanCompletion} [completion]
   */
  withStatuses(statuses, completion) {
    return this.with({
      slices: statuses.map((status, at) =>
        planSlice({
          index: at + 1,
          name: `Slice ${at + 1}`,
          status,
          proof: `A journey observes slice ${at + 1}.`,
        }),
      ),
      ...(completion === undefined ? {} : { completion }),
    });
  }
}
