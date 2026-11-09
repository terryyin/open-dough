// Project Intent's CI wall time history in CI status
// (`./IntentCiJudgedBranch.tsx`), after the trunk's judgment and Proof and
// before Check again, as its CI evidence owner reads it
// (`./useIntentCiHistory.ts`). Under a heading with how many builds are
// measured and over which dates, it says the history is collected from
// dashboard-recorded landings, gives the latest measured build's CI wall
// time, draws the measured builds as one line of CI wall time by build date
// (`./IntentCiHistoryChart.tsx`), and lists each under Builds and evidence
// with its date, CI wall time, how it measures its landing and the run
// attempt it was measured from, linked to its run, so a keyboard, a screen
// reader and a phone get the same evidence without colour
// (`./ciHistoryWords.ts`). With no measured build it says so in words and
// draws nothing. Until its first read answers it says it is reading; a
// failed read says why, beside any history already shown. The judgment and
// Proof keep their own reading; nothing here changes them. Its look is
// `./intent-ci-history.css`'s.

import { useId } from "react";
import { shortSha } from "./baseCiWording.ts";
import {
  buildDateWords,
  measuredAttemptWords,
  measuredBuildsWords,
  pointWallTimeWords,
  provenanceWords,
} from "./ciHistoryWords.ts";
import { IntentCiHistoryChart } from "./IntentCiHistoryChart.tsx";
import {
  landedCiPointKey,
  type LandedCiPoint,
  type MeasuredPoint,
} from "./landedCiHistory.ts";
import type { HistoryReading } from "./useIntentCiHistory.ts";
import "./intent-ci-history.css";

// How many builds are measured, and from the first one's date to the last's.
function Extent({ points }: { readonly points: readonly LandedCiPoint[] }) {
  const first = points[0];
  const last = points.at(-1);
  if (first === undefined || last === undefined) return null;
  const from = buildDateWords(first.startedAt);
  const to = buildDateWords(last.startedAt);
  return (
    <>
      {`${measuredBuildsWords(points.length)} · `}
      <time dateTime={first.startedAt}>{from}</time>
      {to !== from && (
        <>
          –<time dateTime={last.startedAt}>{to}</time>
        </>
      )}
    </>
  );
}

// One measured build in words: "Nov 5 · 6 min 5 s · exact revision a1b2c3d ·
// Run 41 · attempt 1", the run attempt linked to its run.
function BuildEvidence({ point }: { readonly point: MeasuredPoint }) {
  const run = measuredAttemptWords(point);
  return (
    <li>
      <time dateTime={point.startedAt}>{buildDateWords(point.startedAt)}</time>
      {` · ${pointWallTimeWords(point)} · ${provenanceWords(point)} `}
      <code>{shortSha(point.revision)}</code>
      {run !== undefined && (
        <>
          {" · "}
          {point.runUrl === undefined ? (
            run
          ) : (
            <a href={point.runUrl} target="_blank" rel="noreferrer">
              {run}
            </a>
          )}
        </>
      )}
    </li>
  );
}

export function IntentCiHistory({
  history,
}: {
  readonly history: HistoryReading;
}) {
  const heading = useId();
  const { shown, failed } = history;
  const points = shown?.points ?? [];
  const latest = points.at(-1);
  return (
    <section className="intent-ci-history" aria-labelledby={heading}>
      <h4 className="intent-ci-history-head">
        <span id={heading}>CI wall time history</span>
        {latest !== undefined && (
          <>
            {" "}
            <span className="intent-ci-history-extent">
              <Extent points={points} />
            </span>
          </>
        )}
      </h4>
      {shown === undefined ? (
        <p className="intent-ci-history-note">
          {failed ?? "Reading the collected CI wall time history…"}
        </p>
      ) : latest === undefined ? (
        <p className="intent-ci-history-note">
          No dashboard-recorded landings have been measured yet.
        </p>
      ) : (
        <>
          <p className="intent-ci-history-note">
            Collected from dashboard-recorded landings
          </p>
          <dl className="intent-ci-history-latest">
            <dt>Latest measured build</dt>
            <dd>{pointWallTimeWords(latest)}</dd>
          </dl>
          <IntentCiHistoryChart points={points} />
          <details className="intent-ci-history-evidence">
            <summary>Builds and evidence</summary>
            <ul aria-label="Builds and evidence">
              {points.map((point) => (
                <BuildEvidence key={landedCiPointKey(point)} point={point} />
              ))}
            </ul>
          </details>
        </>
      )}
      {shown !== undefined && failed !== undefined && (
        <p className="intent-ci-history-note">{failed}</p>
      )}
    </section>
  );
}
