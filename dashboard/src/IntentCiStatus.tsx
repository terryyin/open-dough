// Intent's CI status tab (`./IntentModeTabs.tsx`): the selected check's
// judgment of the project's trunk (`./authenticatedIntentCiStatusRead.ts`),
// across the content area without the location tree. It always names the
// branch, states Passed, Failed, Running or Could not be read (with the
// reason), the judged revision, later commits without their own result, the
// run link, a running judgment's nearest completed ancestor, and when it was
// checked. It is read each time it is shown and again on Check again; a
// re-read keeps the shown judgment until its answer replaces it. Wording is
// shared with the launch's base-CI confirmation (`./baseCiWording.ts`).

import { useEffect, useState } from "react";
import {
  readIntentCiStatus,
  type IntentCiStatus as Judgment,
} from "./authenticatedIntentCiStatusRead.ts";
import {
  completedAncestorLine,
  judgedStateName,
  laterWithoutResultLine,
  noCompletedAncestorLine,
  shortSha,
} from "./baseCiWording.ts";
import {
  intentModePanelId,
  intentModeTabId,
  type IntentMode,
} from "./IntentModeTabs.tsx";
import type { PublishedSource } from "./publishedSource.ts";
import "./intent-ci-status.css";

// A judgment the boundary could not answer at all still names the trunk and
// says why, never reading as passed.
function boundaryUnread(source: PublishedSource, error: unknown): Judgment {
  return {
    branch: source.ref,
    checkedAt: new Date().toISOString(),
    state: "unread",
    revision: "unavailable",
    subject: "(unavailable)",
    laterWithoutResult: 0,
    reason:
      error instanceof Error && error.message !== ""
        ? error.message
        : "The CI status could not be read",
  };
}

function RunLink({ url }: { readonly url: string | undefined }) {
  if (url === undefined) return null;
  return (
    <p>
      Run:{" "}
      <a href={url} target="_blank" rel="noreferrer">
        {url}
      </a>
    </p>
  );
}

function Shown({ judgment }: { readonly judgment: Judgment }) {
  const { completedAncestor } = judgment;
  const later = laterWithoutResultLine(judgment.laterWithoutResult);
  return (
    <>
      <p className="intent-ci-state" data-state={judgment.state}>
        {judgedStateName(judgment.state)}
        {judgment.revision === "unavailable" ? (
          ""
        ) : (
          <>
            {" at "}
            <code>{shortSha(judgment.revision)}</code> ({judgment.subject})
          </>
        )}
      </p>
      {later !== "" && <p>{later}</p>}
      {judgment.reason !== undefined && (
        <p className="intent-ci-reason">{judgment.reason}</p>
      )}
      <RunLink url={judgment.runUrl} />
      {judgment.state === "running" &&
        (completedAncestor === undefined ? (
          <p>{noCompletedAncestorLine}</p>
        ) : (
          <>
            <p>{completedAncestorLine(completedAncestor)}</p>
            <RunLink url={completedAncestor.runUrl} />
          </>
        ))}
    </>
  );
}

export function IntentCiStatus({
  source,
}: {
  readonly source: PublishedSource;
}) {
  const [judgment, setJudgment] = useState<Judgment | undefined>(undefined);
  const [reading, setReading] = useState(true);
  const [check, setCheck] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setReading(true);
    void readIntentCiStatus(source, controller.signal)
      .then((answer) => {
        if (!controller.signal.aborted) setJudgment(answer);
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted)
          setJudgment(boundaryUnread(source, error));
      })
      .finally(() => {
        if (!controller.signal.aborted) setReading(false);
      });
    return () => {
      controller.abort();
    };
  }, [source, check]);

  const checkedAt =
    judgment === undefined ? undefined : new Date(judgment.checkedAt);
  return (
    <section className="intent-ci-status" aria-label="CI status">
      <h3>
        CI status of <code>{source.ref}</code>
      </h3>
      <p role="status" className="quiet">
        {reading ? (
          `Checking the CI of ${source.ref}…`
        ) : checkedAt === undefined || judgment === undefined ? (
          ""
        ) : (
          <>
            Checked at{" "}
            <time dateTime={judgment.checkedAt}>
              {checkedAt.toLocaleTimeString()}
            </time>
            .
          </>
        )}
      </p>
      {judgment !== undefined && <Shown judgment={judgment} />}
      <p>
        <button
          type="button"
          disabled={reading}
          onClick={() => {
            setCheck((n) => n + 1);
          }}
        >
          Check again
        </button>
      </p>
    </section>
  );
}

// The CI status tab's panel, read only while that tab is chosen.
export function IntentCiStatusPanel({
  source,
  mode,
  modeIdPrefix,
}: {
  readonly source: PublishedSource;
  readonly mode: IntentMode;
  readonly modeIdPrefix: string;
}) {
  return (
    <div
      className="intent-ci-status-panel"
      role="tabpanel"
      id={intentModePanelId(modeIdPrefix, "ci-status")}
      aria-labelledby={intentModeTabId(modeIdPrefix, "ci-status")}
      hidden={mode !== "ci-status"}
      tabIndex={-1}
    >
      {mode === "ci-status" ? <IntentCiStatus source={source} /> : null}
    </div>
  );
}
