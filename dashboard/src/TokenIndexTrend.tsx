// System settings → Usage's Token index trend for one cohort's answer
// (`./usageTokenIndex.ts`): one point per task over its end time on the
// shared history chart (`./HistoryChart.tsx`), partial ones hollow, the
// true trailing moving average above dots, independent of their scale; ↑ labels
// and dated values identify average overflow. The cohort note counts partial
// tasks and the unpriced ones, which have no point, and the tariff version
// that weighed them; a tool whose usage leaves known work out names that work
// once for its cohort. Selecting a point by pointer or keyboard shows that
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
  type UsageTool,
} from "./usageTokenIndex.ts";

const largeTaskThreshold = 50_000_000;
const largeTaskWords = "Large task above 50 million";
const movingAverageWords = `${String(movingAverageTasks)}-task moving average`;
// Claude Code's background work never reaches its transcripts.
const excludedWork: Partial<Record<UsageTool, string>> = {
  claude:
    "Not included: background agent-view row summaries, recaps and idle compaction",
};

function series(
  answer: TokenIndexAnswer,
  selected: string | undefined,
): HistoryChartSeries {
  return {
    label: "Token index per finished task by end date",
    axis: countAxis,
    selectedLabel: "Selected task",
    emptyScaleMaximum: largeTaskThreshold,
    independentTrend: { label: movingAverageWords },
    entries: answer.tasks.map((task) => {
      const partial = task.coverage.kind === "partial";
      return {
        kind: "point",
        key: task.id,
        date: task.endedAt,
        value: task.index,
        ...(task.index > largeTaskThreshold
          ? { overflow: largeTaskWords }
          : {}),
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
  days,
}: {
  readonly answer: TokenIndexAnswer;
  readonly days: number;
}) {
  // The selected task and its point's button, which Close focuses again.
  const [chosen, setChosen] = useState<{
    readonly key: string;
    readonly mark: HTMLButtonElement;
  }>();
  const selected = answer.tasks.find((task) => task.id === chosen?.key);
  const latest = answer.average.at(-1);
  const excluded = excludedWork[answer.cohort.tool];
  const periodWords = `${days} ${days === 1 ? "day" : "days"}`;
  return (
    <>
      <section className="usage-chart" aria-label="Token index trend">
        <div className="usage-chart-head">
          <div>
            <h3>Token index per task</h3>
            <p className="settings-note">
              {cohortNote(answer)} · Last {periodWords}
            </p>
          </div>
          <p className="usage-average">
            <strong>
              {latest === undefined ? "—" : countWords(latest.value)}
            </strong>
            <span className="settings-note">
              {latest === undefined
                ? `An average needs ${String(movingAverageTasks)} eligible tasks; none is available in this period`
                : movingAverageWords}
            </span>
          </p>
        </div>
        {answer.tasks.length === 0 ? (
          <p className="settings-empty">
            {answer.unpriced === 0
              ? `No finished task matches in the last ${periodWords}.`
              : `No priced finished task matches in the last ${periodWords}.`}
          </p>
        ) : (
          <HistoryChart
            series={series(answer, selected?.id)}
            onChoose={(key, mark) => {
              setChosen({ key, mark });
            }}
          />
        )}
        {answer.tasks.length > 0 &&
          answer.tasks.every((task) => task.index > largeTaskThreshold) && (
            <p className="settings-note">
              No ordinary task points in this period; every priced task is above
              50 million.
            </p>
          )}
        <p className="settings-note">
          × {largeTaskWords}; labels show actual values. Partial coverage
          remains marked.
        </p>
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
              (↑ above scale)
            </span>
          </p>
          <p className="settings-note">{answer.tariff.label}</p>
          {excluded !== undefined && (
            <p className="settings-note">{excluded}</p>
          )}
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
