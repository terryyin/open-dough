// System settings → Usage's Token index trend for each selected tool's answer
// (`./usageTokenIndex.ts`): one point per task over its end time on the
// shared history chart (`./HistoryChart.tsx`), every tool a named trace on
// one numeric scale and one time axis, partial ones hollow, each tool's own
// rolling median above dots, independent of their scale; ↑ labels and dated
// values identify median overflow. Each tool's summary
// (`./UsageToolSummary.tsx`) counts its tasks and names the reference unit
// its values are in; the values stay tool-relative, never one cost unit.
// Selecting a point by pointer or keyboard shows that task's detail
// (`./UsageTaskDetail.tsx`), its tool kept with it since task IDs may repeat
// across tools; a new answer, as a Refresh brings, keeps it while the task's
// point remains.
import { useState } from "react";
import { countAxis, countWords } from "./chartValueAxis.ts";
import type {
  HistoryChartPoint,
  HistoryChartSeries,
} from "./historyChartSeries.ts";
import { HistoryChart } from "./HistoryChart.tsx";
import { usageToolName } from "./usageComparison.ts";
import { partialWords, UsageTaskDetail } from "./UsageTaskDetail.tsx";
import { rollingMedianWords, UsageToolSummary } from "./UsageToolSummary.tsx";
import {
  usageTools,
  type TokenIndexAnswer,
  type TokenIndexTask,
  type UsageTool,
} from "./usageTokenIndex.ts";

const largeTaskThreshold = 50_000_000;
const largeTaskWords = "Large task above 50 million";

// A task's mark key: its tool and its ID.
const markKey = (tool: UsageTool, task: TokenIndexTask) => `${tool}:${task.id}`;

function point(
  tool: UsageTool,
  task: TokenIndexTask,
  selected: string | undefined,
): HistoryChartPoint {
  const partial = task.coverage.kind === "partial";
  const key = markKey(tool, task);
  return {
    kind: "point",
    key,
    trace: usageToolName(tool),
    date: task.endedAt,
    value: task.index,
    ...(task.index > largeTaskThreshold ? { overflow: largeTaskWords } : {}),
    description: `${usageToolName(tool)} · ${task.title ?? task.identity ?? "Untitled task"} · ${countWords(task.index)}${partial ? ` · ${partialWords}` : ""}`,
    selected: key === selected,
    ...(partial ? { partial: partialWords } : {}),
  };
}

function series(
  answers: readonly TokenIndexAnswer[],
  selected: string | undefined,
): HistoryChartSeries {
  const entries = answers
    .flatMap(({ cohort, tasks }) =>
      tasks.map((task) => point(cohort.tool, task, selected)),
    )
    // In history order across tools; a tie keeps tool order.
    .sort((a, b) => Date.parse(a.date) - Date.parse(b.date));
  return {
    label: "Token index per finished task by end date",
    axis: countAxis,
    selectedLabel: "Selected task",
    emptyScaleMaximum: largeTaskThreshold,
    independentTrend: { label: rollingMedianWords, shortLabel: "Median" },
    // Every tool keeps its own trace style whichever tools are selected.
    traces: usageTools.map(usageToolName),
    entries,
    trends: answers.map(({ cohort, average }) => ({
      trace: usageToolName(cohort.tool),
      points: average.map(({ at, value }) => ({ date: at, value })),
    })),
  };
}

export function TokenIndexTrend({
  answers,
  days,
}: {
  readonly answers: readonly TokenIndexAnswer[];
  readonly days: number;
}) {
  // The selected task and its point's button, which Close focuses again.
  const [chosen, setChosen] = useState<{
    readonly key: string;
    readonly mark: HTMLButtonElement;
  }>();
  const selected = answers
    .flatMap(({ cohort, tasks }) =>
      tasks.map((task) => ({ tool: cohort.tool, task })),
    )
    .find(({ tool, task }) => markKey(tool, task) === chosen?.key);
  const tasks = answers.flatMap((answer) => answer.tasks);
  const periodWords = `${days} ${days === 1 ? "day" : "days"}`;
  return (
    <>
      <section className="usage-chart" aria-label="Token index trend">
        <h3>Token index per task</h3>
        <ul className="usage-tools" aria-label="Selected tools">
          {answers.map((answer) => (
            <UsageToolSummary
              key={answer.cohort.tool}
              answer={answer}
              periodWords={periodWords}
            />
          ))}
        </ul>
        {answers.length > 1 && (
          <p className="settings-note">
            One numeric scale; each tool's values stay in its own reference
            unit, not a common cost or a measure of tool efficiency.
          </p>
        )}
        {tasks.length > 0 && (
          <HistoryChart
            series={series(
              answers,
              selected && markKey(selected.tool, selected.task),
            )}
            onChoose={(key, mark) => {
              setChosen({ key, mark });
            }}
          />
        )}
        {tasks.length > 0 &&
          tasks.every((task) => task.index > largeTaskThreshold) && (
            <p className="settings-note">
              No ordinary task points in this period; every priced task is above
              50 million.
            </p>
          )}
        <p className="settings-note">
          × {largeTaskWords}; labels show actual values. Partial coverage
          remains marked.
        </p>
        <p className="usage-legend">
          <span>
            <i className="usage-swatch" /> Task
          </span>
          <span>
            <i className="usage-swatch usage-swatch-partial" /> {partialWords}
          </span>
          <span>
            <i className="usage-swatch usage-swatch-median" /> Rolling median (↑
            above scale)
          </span>
        </p>
      </section>
      {selected !== undefined && (
        <UsageTaskDetail
          task={selected.task}
          tool={selected.tool}
          onClose={() => {
            chosen?.mark.focus();
            setChosen(undefined);
          }}
        />
      )}
    </>
  );
}
