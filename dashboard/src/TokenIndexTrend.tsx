// System settings → Usage's Token index trend for one cohort's answer
// (`./usageTokenIndex.ts`): one point per task over its end time on the
// shared history chart (`./HistoryChart.tsx`), partial ones hollow, the
// trailing moving average as its trend, the cohort note counting the partial
// tasks and the unpriced ones, which have no point, and the tariff version
// that weighed them. Selecting a point by pointer or keyboard shows that
// task's detail (`./UsageTaskDetail.tsx`); a new answer for the same cohort,
// as a Refresh brings, keeps it while the task's point remains.
import { useState } from "react";
import { countAxis, countWords } from "./chartValueAxis.ts";
import type { HistoryChartSeries } from "./historyChartSeries.ts";
import { HistoryChart } from "./HistoryChart.tsx";
import { partialWords, UsageTaskDetail } from "./UsageTaskDetail.tsx";
import {
  movingAverageTasks,
  type TokenIndexAnswer,
} from "./usageTokenIndex.ts";

function series(
  answer: TokenIndexAnswer,
  selected: string | undefined,
): HistoryChartSeries {
  return {
    label: "Token index per finished task by end date",
    axis: countAxis,
    selectedLabel: "Selected task",
    entries: answer.tasks.map((task) => {
      const partial = task.coverage.kind === "partial";
      return {
        kind: "point",
        key: task.id,
        date: task.endedAt,
        value: task.index,
        description: `${task.title ?? task.identity ?? "Untitled task"} · ${countWords(task.index)}${partial ? ` · ${partialWords}` : ""}`,
        selected: task.id === selected,
        ...(partial ? { partial: partialWords } : {}),
      };
    }),
    trend: answer.average.map(({ at, value }) => ({ date: at, value })),
  };
}

// How many tasks the cohort finished, then how many of them are partial and
// how many unpriced, when any are.
function cohortNote({ tasks, unpriced }: TokenIndexAnswer): string {
  const total = tasks.length + unpriced;
  const partial = tasks.filter(
    (task) => task.coverage.kind === "partial",
  ).length;
  return [
    `${String(total)} task${total === 1 ? "" : "s"}`,
    partial === 0 ? undefined : `${String(partial)} partial`,
    unpriced === 0 ? undefined : `${String(unpriced)} unpriced`,
  ]
    .filter((each) => each !== undefined)
    .join(" · ");
}

export function TokenIndexTrend({
  answer,
}: {
  readonly answer: TokenIndexAnswer;
}) {
  // The selected task and its point's button, which Close focuses again.
  const [chosen, setChosen] = useState<{
    readonly key: string;
    readonly mark: HTMLButtonElement;
  }>();
  const selected = answer.tasks.find((task) => task.id === chosen?.key);
  const latest = answer.average.at(-1);
  return (
    <>
      <section className="usage-chart" aria-label="Token index trend">
        <div className="usage-chart-head">
          <div>
            <h3>Token index per task</h3>
            <p className="settings-note">{cohortNote(answer)}</p>
          </div>
          <p className="usage-average">
            <strong>
              {latest === undefined ? "—" : countWords(latest.value)}
            </strong>
            <span className="settings-note">
              {latest === undefined
                ? `Fewer than ${String(movingAverageTasks)} eligible tasks`
                : `${String(movingAverageTasks)}-task moving average`}
            </span>
          </p>
        </div>
        {answer.tasks.length === 0 ? (
          <p className="settings-empty">
            {answer.unpriced === 0
              ? "No finished task matches."
              : "No priced finished task matches."}
          </p>
        ) : (
          <HistoryChart
            series={series(answer, selected?.id)}
            onChoose={(key, mark) => {
              setChosen({ key, mark });
            }}
          />
        )}
        <div className="usage-chart-foot">
          <p className="usage-legend">
            <span>
              <i className="usage-swatch" /> Task
            </span>
            <span>
              <i className="usage-swatch usage-swatch-partial" /> {partialWords}
            </span>
            <span>
              <i className="usage-swatch usage-swatch-average" /> Moving average
            </span>
          </p>
          <p className="settings-note">{answer.tariff.label}</p>
        </div>
      </section>
      {selected !== undefined && (
        <UsageTaskDetail
          task={selected}
          tool={answer.cohort.tool}
          onClose={() => {
            chosen?.mark.focus();
            setChosen(undefined);
          }}
        />
      )}
    </>
  );
}
