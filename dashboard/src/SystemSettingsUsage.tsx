// System settings → Usage: the Token index of finished dashboard-launched
// tasks for the cohort its filters choose (`./usageTokenIndex.ts`), one point
// per task over its end time on the shared history chart
// (`./HistoryChart.tsx`) with the trailing moving average as its trend, the
// tariff version that weighed them and when the usage was last checked.
// Selecting a point by pointer or keyboard shows that task's detail
// (`./UsageTaskDetail.tsx`) from the same answer. The trend is an
// observation; it claims neither an improvement nor a bill.
import { useEffect, useState } from "react";
import { countAxis, countWords } from "./chartValueAxis.ts";
import type { HistoryChartSeries } from "./historyChartSeries.ts";
import { HistoryChart } from "./HistoryChart.tsx";
import { Moment } from "./Moment.tsx";
import { refusalMessage } from "./refusalMessage.ts";
import { UsageFilters } from "./UsageFilters.tsx";
import { UsageTaskDetail } from "./UsageTaskDetail.tsx";
import {
  defaultCohort,
  movingAverageTasks,
  tokenIndexUrl,
  type TokenIndexAnswer,
  type TokenIndexCohort,
} from "./usageTokenIndex.ts";
import "./system-settings-usage.css";

function series(
  answer: TokenIndexAnswer,
  selected: string | undefined,
): HistoryChartSeries {
  return {
    label: "Token index per finished task by end date",
    axis: countAxis,
    selectedLabel: "Selected task",
    entries: answer.tasks.map((task) => ({
      kind: "point",
      key: task.id,
      date: task.endedAt,
      value: task.index,
      description: `${task.title ?? task.identity ?? "Untitled task"} · ${countWords(task.index)}`,
      selected: task.id === selected,
    })),
    trend: answer.average.map(({ at, value }) => ({ date: at, value })),
  };
}

function TokenIndexTrend({ answer }: { readonly answer: TokenIndexAnswer }) {
  // The selected task and its point's button, which Close focuses again.
  const [chosen, setChosen] = useState<{
    readonly key: string;
    readonly mark: HTMLButtonElement;
  }>();
  const selected = answer.tasks.find((task) => task.id === chosen?.key);
  const latest = answer.average.at(-1);
  const count = answer.tasks.length;
  return (
    <>
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

export function SystemSettingsUsage() {
  const [cohort, setCohort] = useState(defaultCohort);
  const [answer, setAnswer] = useState<TokenIndexAnswer>();
  // The latest answer's Model and Effort options stay on offer while the
  // next cohort loads.
  const [options, setOptions] = useState<TokenIndexAnswer["options"]>();
  const [problem, setProblem] = useState<string>();
  useEffect(() => {
    const controller = new AbortController();
    void fetch(tokenIndexUrl(cohort), { signal: controller.signal })
      .then(async (response) => {
        const body: unknown = await response.json();
        if (!response.ok)
          throw new Error(refusalMessage(body, "Usage could not be read."));
        return body as TokenIndexAnswer;
      })
      .then(
        (body) => {
          setAnswer(body);
          setOptions(body.options);
        },
        (error: unknown) => {
          if (!controller.signal.aborted)
            setProblem(error instanceof Error ? error.message : String(error));
        },
      );
    return () => {
      controller.abort();
    };
  }, [cohort]);
  const choose = (next: TokenIndexCohort) => {
    setCohort(next);
    setAnswer(undefined);
    setProblem(undefined);
  };
  return (
    <section
      className="settings-section usage-view"
      aria-labelledby="usage-heading"
    >
      <div>
        <h2 id="usage-heading">Token index</h2>
        <p className="settings-note">All projects on this dashboard</p>
      </div>
      <UsageFilters cohort={cohort} options={options} onChoose={choose} />
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
