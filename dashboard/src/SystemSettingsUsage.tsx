// System settings → Usage: the Token index of finished dashboard-launched
// tasks for one cohort (`./usageTokenIndex.ts`), one point per task over its
// end time on the shared history chart (`./HistoryChart.tsx`) with
// the trailing moving average as its trend, the tariff version that weighed
// them and when the usage was last checked. The trend is an observation; it
// claims neither an improvement nor a bill.
import { useEffect, useState } from "react";
import { countAxis, countWords } from "./chartValueAxis.ts";
import type { HistoryChartSeries } from "./historyChartSeries.ts";
import { HistoryChart } from "./HistoryChart.tsx";
import { Moment } from "./Moment.tsx";
import { refusalMessage } from "./refusalMessage.ts";
import {
  movingAverageTasks,
  usageTokenIndexEndpoint,
  type TokenIndexAnswer,
} from "./usageTokenIndex.ts";
import "./system-settings-usage.css";

const filters = [
  ["Tool", "Codex"],
  ["Launch workflow", "Execution"],
  ["Model", "All models"],
  ["Effort", "Any effort"],
] as const;

function series(answer: TokenIndexAnswer): HistoryChartSeries {
  return {
    label: "Token index per finished task by end date",
    axis: countAxis,
    entries: answer.tasks.map((task) => ({
      kind: "point",
      key: task.id,
      date: task.endedAt,
      value: task.index,
      description: `${task.title ?? task.identity ?? "Untitled task"} · ${countWords(task.index)}`,
    })),
    trend: answer.average.map(({ at, value }) => ({ date: at, value })),
  };
}

function TokenIndexTrend({ answer }: { readonly answer: TokenIndexAnswer }) {
  const latest = answer.average.at(-1);
  const count = answer.tasks.length;
  return (
    <section className="usage-chart" aria-label="Token index trend">
      <div className="usage-chart-head">
        <div>
          <h3>Token index per task</h3>
          <p className="settings-note">
            {count} task{count === 1 ? "" : "s"}
          </p>
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
      {count === 0 ? (
        <p className="settings-empty">No finished task matches.</p>
      ) : (
        <HistoryChart series={series(answer)} />
      )}
      <div className="usage-chart-foot">
        <p className="usage-legend">
          <span>
            <i className="usage-swatch" /> Task
          </span>
          <span>
            <i className="usage-swatch usage-swatch-average" /> Moving average
          </span>
        </p>
        <p className="settings-note">{answer.tariff.label}</p>
      </div>
    </section>
  );
}

export function SystemSettingsUsage() {
  const [answer, setAnswer] = useState<TokenIndexAnswer>();
  const [problem, setProblem] = useState<string>();
  useEffect(() => {
    const controller = new AbortController();
    void fetch(usageTokenIndexEndpoint, { signal: controller.signal })
      .then(async (response) => {
        const body: unknown = await response.json();
        if (!response.ok)
          throw new Error(refusalMessage(body, "Usage could not be read."));
        return body as TokenIndexAnswer;
      })
      .then(setAnswer, (error: unknown) => {
        if (!controller.signal.aborted)
          setProblem(error instanceof Error ? error.message : String(error));
      });
    return () => {
      controller.abort();
    };
  }, []);
  return (
    <section
      className="settings-section usage-view"
      aria-labelledby="usage-heading"
    >
      <div>
        <h2 id="usage-heading">Token index</h2>
        <p className="settings-note">All projects on this dashboard</p>
      </div>
      <div className="usage-filters">
        {filters.map(([name, choice]) => (
          <label key={name}>
            {name}
            <select className="frame-input">
              <option>{choice}</option>
            </select>
          </label>
        ))}
      </div>
      {problem !== undefined && (
        <div role="alert" className="settings-problem">
          {problem}
        </div>
      )}
      {answer === undefined ? (
        problem === undefined && (
          <p role="status" className="settings-note">
            Loading usage…
          </p>
        )
      ) : (
        <>
          <TokenIndexTrend answer={answer} />
          <p className="settings-note">
            Checked <Moment at={new Date(answer.checkedAt)} />
          </p>
        </>
      )}
    </section>
  );
}
