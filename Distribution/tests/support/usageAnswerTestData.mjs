// @ts-check
// System settings → Usage's Token index answer as the dashboard serves it
// (../../../dashboard/src/usageTokenIndex.ts), for frontend specs that
// substitute it. No runtime dashboard import enters MakeMe.
/** @typedef {import("../../../dashboard/src/usageTokenIndex.ts").TokenIndexAnswer} TokenIndexAnswer */
/** @typedef {import("../../../dashboard/src/usageTokenIndex.ts").TokenIndexTask} TokenIndexTask */

const sol = { id: "gpt-6.1-sol", name: "GPT-6.1 Sol" };

// The Codex Execution cohort with All models and Any effort: one finished
// task of Open Dough with no known gaps per stated index, a day apart from
// November 1, and the mean of each ten in a row as the moving average.
export class TokenIndexAnswerBuilder {
  /** @param {{ indexes: readonly number[] }} facts */
  with({ indexes }) {
    return {
      /** @returns {TokenIndexAnswer} */
      please: () => {
        /** @type {TokenIndexTask[]} */
        const tasks = indexes.map((index, at) => ({
          id: `task-${String(at + 1)}`,
          project: { id: "open-dough", label: "Open Dough" },
          identity: null,
          title: `Task ${String(at + 1)}`,
          workflow: "execution",
          outcome: { kind: "reported-complete" },
          endedAt: new Date(Date.UTC(2026, 10, at + 1, 12)).toISOString(),
          requested: { model: null, effort: null },
          observed: { model: sol, effort: "xhigh" },
          index,
          coverage: { kind: "measured" },
        }));
        return {
          cohort: {
            tool: "codex",
            workflow: "execution",
            model: null,
            effort: null,
          },
          options: { models: [sol], efforts: ["xhigh"] },
          tariff: { version: "codex-test", label: "Test rate card" },
          checkedAt: "2026-11-15T00:00:00.000Z",
          tasks,
          unpriced: 0,
          average: tasks.flatMap((task, at) =>
            at < 9
              ? []
              : [
                  {
                    at: task.endedAt,
                    value:
                      tasks
                        .slice(at - 9, at + 1)
                        .reduce((sum, each) => sum + each.index, 0) / 10,
                  },
                ],
          ),
        };
      },
    };
  }
}
