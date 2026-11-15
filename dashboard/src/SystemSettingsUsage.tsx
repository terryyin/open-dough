// System settings → Usage: the Token index of finished dashboard-launched
// tasks for the cohort its filters choose (`./usageTokenIndex.ts`) as its
// trend (`./TokenIndexTrend.tsx`) within recent local calendar days, and when
// the usage was last checked. Days remain separate from cohort identity.
// Refresh brings in the Codex and Claude Code usage written since then;
// meanwhile the trend stays with a checking note, and a failed Refresh keeps
// it and its check time beside the error. The trend is an observation; it claims neither an
// improvement nor a bill.
import { useEffect, useState } from "react";
import { localSettingRequest } from "./localSettingRequest.ts";
import { Moment } from "./Moment.tsx";
import { refusalMessage } from "./refusalMessage.ts";
import { TokenIndexTrend } from "./TokenIndexTrend.tsx";
import { UsageFilters } from "./UsageFilters.tsx";
import { UsageDays } from "./UsageDays.tsx";
import { recentUsagePeriod } from "./usagePeriod.ts";
import {
  defaultCohort,
  offeredCohort,
  tokenIndexUrl,
  usageRefreshEndpoint,
  type TokenIndexAnswer,
  type TokenIndexCohort,
} from "./usageTokenIndex.ts";
import "./system-settings-usage.css";

export function SystemSettingsUsage() {
  const [cohort, setCohort] = useState(defaultCohort);
  const [days, setDays] = useState(30);
  const [answer, setAnswer] = useState<TokenIndexAnswer>();
  // The latest answer's Model and Effort options stay on offer while the
  // next cohort loads.
  const [options, setOptions] = useState<TokenIndexAnswer["options"]>();
  const [problem, setProblem] = useState<string>();
  // Each Refresh that brought usage in reads the cohort again.
  const [refreshed, setRefreshed] = useState(0);
  // Only a settled read of that Refresh's current cohort can finish checking.
  const [readAfterRefresh, setReadAfterRefresh] = useState(0);
  const [refreshPending, setRefreshPending] = useState(false);
  const checking = refreshPending || readAfterRefresh !== refreshed;
  useEffect(() => {
    const controller = new AbortController();
    void fetch(tokenIndexUrl(cohort, recentUsagePeriod(days)), {
      signal: controller.signal,
    })
      .then(async (response) => {
        const body: unknown = await response.json();
        if (!response.ok)
          throw new Error(refusalMessage(body, "Usage could not be read."));
        return body as TokenIndexAnswer;
      })
      .then(
        (body) => {
          // Switching tool keeps a model or effort only where it still runs.
          const offered = offeredCohort(cohort, body.options);
          if (offered !== cohort) {
            setCohort(offered);
            return;
          }
          setAnswer(body);
          setOptions(body.options);
        },
        (error: unknown) => {
          if (!controller.signal.aborted)
            setProblem(error instanceof Error ? error.message : String(error));
        },
      )
      .finally(() => {
        if (!controller.signal.aborted) setReadAfterRefresh(refreshed);
      });
    return () => {
      controller.abort();
    };
  }, [cohort, days, refreshed]);
  const refresh = () => {
    setRefreshPending(true);
    setProblem(undefined);
    void localSettingRequest(
      usageRefreshEndpoint,
      {},
      "Usage could not be refreshed.",
    ).then(
      () => {
        setRefreshed((count) => count + 1);
        setRefreshPending(false);
      },
      (error: unknown) => {
        setProblem(error instanceof Error ? error.message : String(error));
        setRefreshPending(false);
      },
    );
  };
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
            setAnswer(undefined);
            setProblem(undefined);
          }}
        />
        <UsageFilters cohort={cohort} options={options} onChoose={choose} />
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
          <TokenIndexTrend answer={answer} days={days} />
          <p className="settings-note">
            {answer.checkedAt === null ? (
              "Not checked yet"
            ) : (
              <>
                Checked <Moment at={new Date(answer.checkedAt)} />
              </>
            )}
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
