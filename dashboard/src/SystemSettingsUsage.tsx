// System settings → Usage: the Token index of finished dashboard-launched
// tasks for each selected tool (`./usageComparison.ts`), read per tool
// (`./useUsageAnswers.ts`) and compared on one trend
// (`./TokenIndexTrend.tsx`) within recent local calendar days, and when the
// usage was last checked. Days remain separate from cohort identity. Refresh
// brings in the Codex and Claude Code usage written since then; meanwhile the
// trend stays with a checking note, and a failed Refresh keeps it and its
// check time beside the error. The trend is an observation; it claims neither
// an improvement, a common cost nor a tool's efficiency.
import { useState } from "react";
import { CheckedAt } from "./CheckedAt.tsx";
import { TokenIndexTrend } from "./TokenIndexTrend.tsx";
import { UsageFilters } from "./UsageFilters.tsx";
import { UsageDays } from "./UsageDays.tsx";
import { UsageToolChoice } from "./UsageToolChoice.tsx";
import {
  defaultSelection,
  withTool,
  type UsageSelection,
} from "./usageComparison.ts";
import type { UsageSource } from "./usageSource.ts";
import type { TokenIndexAnswer } from "./usageTokenIndex.ts";
import { useUsageAnswers } from "./useUsageAnswers.ts";
import "./system-settings-usage.css";

// One store answers every tool; the latest check time any answer gives.
const checkedAt = (answers: readonly TokenIndexAnswer[]) =>
  answers
    .map((answer) => answer.checkedAt)
    .reduce<string | null>(
      (latest, each) =>
        each !== null && (latest === null || each > latest) ? each : latest,
      null,
    );

export function SystemSettingsUsage({
  source,
}: {
  readonly source: UsageSource;
}) {
  const [selection, setSelection] = useState(defaultSelection);
  const [days, setDays] = useState(30);
  // Equal task spacing stays through Refresh and every cohort or day change.
  const [spaced, setSpaced] = useState(false);
  const [refreshProblem, setRefreshProblem] = useState<string>();
  // Each Refresh that brought usage in reads the selection again.
  const [refreshed, setRefreshed] = useState(0);
  const [refreshPending, setRefreshPending] = useState(false);
  const read = useUsageAnswers({
    source,
    selection,
    days,
    refreshed,
    onReset: setSelection,
  });
  const answers = read.answers;
  const problem = refreshProblem ?? read.problem;
  const checking = refreshPending || read.readAfterRefresh !== refreshed;
  const none = selection.tools.length === 0;
  const refresh = () => {
    setRefreshPending(true);
    setRefreshProblem(undefined);
    void source.refresh().then(
      () => {
        setRefreshed((count) => count + 1);
        setRefreshPending(false);
      },
      (error: unknown) => {
        setRefreshProblem(
          error instanceof Error ? error.message : String(error),
        );
        setRefreshPending(false);
      },
    );
  };
  const choose = (next: UsageSelection) => {
    setSelection(next);
    setRefreshProblem(undefined);
  };
  return (
    <section
      className="settings-section usage-view"
      aria-labelledby="usage-heading"
    >
      <div className="usage-heading">
        <div>
          <h2 id="usage-heading">Token index</h2>
          <p className="settings-note">All projects on this dashboard</p>
        </div>
        <button
          type="button"
          className="frame-button"
          disabled={checking}
          onClick={refresh}
        >
          Refresh
        </button>
      </div>
      <div className="usage-filters">
        <UsageDays
          days={days}
          onChoose={(next) => {
            if (next === days) return;
            setDays(next);
            setRefreshProblem(undefined);
          }}
        />
        <UsageToolChoice
          tools={selection.tools}
          onChoose={(tool, shown) => {
            choose(withTool(selection, tool, shown));
          }}
        />
        <UsageFilters
          selection={selection}
          options={read.options}
          onChoose={choose}
        />
      </div>
      {problem !== undefined && (
        <div role="alert" className="settings-problem">
          {problem}
        </div>
      )}
      {none ? (
        <p className="settings-empty">
          Select Codex or Claude Code to show its token index.
        </p>
      ) : answers === undefined ? (
        problem === undefined && (
          <p role="status" className="settings-note">
            Loading usage…
          </p>
        )
      ) : (
        <>
          <TokenIndexTrend
            answers={answers}
            days={days}
            spaced={spaced}
            onSpace={setSpaced}
          />
          <p className="settings-note">
            <CheckedAt at={checkedAt(answers)} />
          </p>
        </>
      )}
      {checking && (
        <p role="status" className="settings-note">
          Checking for new usage…
        </p>
      )}
    </section>
  );
}
