// System settings → Usage's Token index trend for each selected tool's answer
// (`./usageTokenIndex.ts`): one point per task over its end time on the
// shared history chart (`./HistoryChart.tsx`), every tool a named trace on
// one numeric scale and one time axis, partial ones hollow, estimated ones
// with ≈ beside them, each tool's own
// rolling median above dots, independent of their scale; ↑ labels and dated
// values identify median overflow. Each tool's summary
// (`./UsageToolSummary.tsx`) counts its tasks and names the reference unit
// its values are in; the values stay tool-relative, never one cost unit. The
// key (`./UsageLegend.tsx`) shows each shown tool's marks under its name.
// Selecting a point by pointer or keyboard shows that task's detail
// (`./UsageTaskDetail.tsx`), its tool kept with it since task IDs may repeat
// across tools; a new answer, as a Refresh brings, keeps it while the task's
// point remains. Equal spacing, which the view keeps (`spaced`), gives each
// shown task one slot in completion order across tools, a tie by tool then
// task ID, and each median observation its own task's slot; readouts and
// detail keep the actual completion time.
import { useState } from "react";
import { countAxis, countWords } from "./chartValueAxis.ts";
import type {
  HistoryChartPoint,
  HistoryChartSeries,
} from "./historyChartSeries.ts";
import { HistoryChart } from "./HistoryChart.tsx";
import { usageToolName } from "./usageComparison.ts";
import { UsageLegend } from "./UsageLegend.tsx";
import {
  estimatedWords,
  partialWords,
  UsageTaskDetail,
} from "./UsageTaskDetail.tsx";
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
  const estimated = task.substitutions !== undefined;
  const key = markKey(tool, task);
  return {
    kind: "point",
    key,
    trace: usageToolName(tool),
    date: task.endedAt,
    value: task.index,
    ...(task.index > largeTaskThreshold ? { overflow: largeTaskWords } : {}),
    description: [
      usageToolName(tool),
      task.title ?? task.identity ?? "Untitled task",
      countWords(task.index),
      ...(partial ? [partialWords] : []),
      ...(estimated ? [estimatedWords] : []),
    ].join(" · "),
    selected: key === selected,
    ...(partial ? { partial: partialWords } : {}),
    ...(estimated ? { estimate: estimatedWords } : {}),
  };
}

// Completion order across tools; a tie by tool, then task ID.
const completionOrder = (
  a: { readonly tool: UsageTool; readonly task: TokenIndexTask },
  b: { readonly tool: UsageTool; readonly task: TokenIndexTask },
) =>
  Date.parse(a.task.endedAt) - Date.parse(b.task.endedAt) ||
  usageTools.indexOf(a.tool) - usageTools.indexOf(b.tool) ||
  a.task.id.localeCompare(b.task.id);

function series(
  answers: readonly TokenIndexAnswer[],
  selected: string | undefined,
  spaced: boolean,
): HistoryChartSeries {
  const entries = answers
    .flatMap(({ cohort, tasks }) =>
      tasks.map((task) => ({ tool: cohort.tool, task })),
    )
    .sort(completionOrder)
    .map(({ tool, task }) => point(tool, task, selected));
  return {
    label: spaced
      ? "Token index per finished task in task order, equally spaced"
      : "Token index per finished task by end date",
    ...(spaced ? { order: { axisWords: "Task order, earliest first" } } : {}),
    axis: countAxis,
    selectedLabel: "Selected task",
    emptyScaleMaximum: largeTaskThreshold,
    independentTrend: { label: rollingMedianWords, shortLabel: "Median" },
    // Every tool keeps its own trace style whichever tools are selected.
    traces: usageTools.map(usageToolName),
    entries,
    trends: answers.map(({ cohort, average }) => ({
      trace: usageToolName(cohort.tool),
      points: average.map(({ at, task, value }) => ({
        date: at,
        value,
        key: `${cohort.tool}:${task}`,
      })),
    })),
  };
}

export function TokenIndexTrend({
  answers,
  days,
  spaced,
  onSpace,
}: {
  readonly answers: readonly TokenIndexAnswer[];
  readonly days: number;
  readonly spaced: boolean;
  readonly onSpace: (spaced: boolean) => void;
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
        <label className="usage-spacing">
          <input
            type="checkbox"
            checked={spaced}
            onChange={(event) => {
              onSpace(event.currentTarget.checked);
            }}
          />
          Equal spacing
        </label>
        {tasks.length > 0 && (
          <HistoryChart
            series={series(
              answers,
              selected && markKey(selected.tool, selected.task),
              spaced,
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
          {tasks.some((task) => task.substitutions !== undefined) &&
            " ≈ marks an estimated rate."}
        </p>
        <UsageLegend tools={answers.map(({ cohort }) => cohort.tool)} />
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
