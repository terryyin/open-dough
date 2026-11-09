// Project Intent's CI wall time history in CI status
// (`./IntentCiJudgedBranch.tsx`), after the trunk's judgment and Proof and
// before Check again, as its CI evidence owner reads it
// (`./useIntentCiHistory.ts`). Under a heading with how many builds are
// measured and over which dates, it says the history is collected from
// dashboard-recorded landings, gives the latest measured build's CI wall
// time, draws the measured builds as a line of CI wall time by date that each
// gap breaks (`./IntentCiHistoryChart.tsx`), and lists each point and gap
// under Builds and evidence in the history's order: a point with its date, CI
// wall time, each landing it stands for and how -- the landed revision's own
// build, a reused equivalent or a later trunk build, with the build's
// revision -- and the run attempt it was measured from, linked to its run; a
// gap with the date its landing was recorded, why it has no CI wall time --
// pending and what it waits for, or why it never will -- its landed revision,
// or the build it names and how that build stands for the landing -- the
// build that failed or named no CI wall time, the build whose CI proof could
// not be used, or the landing's own cancelled build -- and the run attempt it
// names, linked to its run when there is one. So a keyboard, a screen reader
// and a phone get the same evidence without colour (`./ciHistoryWords.ts`).
// With no measured build it says so in words and draws nothing, still
// listing any gap. Until its first read answers it says it is reading; a
// failed read says why, beside any history already shown. The judgment and
// Proof keep their own reading; nothing here changes them. Its look is
// `./intent-ci-history.css`'s.

import { useId } from "react";
import { shortSha } from "./baseCiWording.ts";
import {
  buildDateWords,
  gapReasonWords,
  landingWords,
  measuredBuildsWords,
  pointLandingsWords,
  pointWallTimeWords,
  standsForWords,
  type HistoryWords,
} from "./ciHistoryWords.ts";
import { HistoryRunAttempt } from "./HistoryRunAttempt.tsx";
import { IntentCiHistoryChart } from "./IntentCiHistoryChart.tsx";
import {
  isPoint,
  landedCiEntryKey,
  type LandedCiGap,
  type LandedCiPoint,
  type MeasuredPoint,
} from "./landedCiHistory.ts";
import type { HistoryReading } from "./useIntentCiHistory.ts";
import "./intent-ci-history.css";

// How many builds are measured, and from the first one's date to the last's.
function Extent({ points }: { readonly points: readonly LandedCiPoint[] }) {
  const dated = [...points].sort(
    (a, b) => Date.parse(a.startedAt) - Date.parse(b.startedAt),
  );
  const first = dated[0];
  const last = dated.at(-1);
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

// Words with each revision set as code.
function Words({ words }: { readonly words: HistoryWords }) {
  return (
    <>
      {words.map((part, index) =>
        typeof part === "string" ? (
          part
        ) : (
          <code key={index}>{shortSha(part.revision)}</code>
        ),
      )}
    </>
  );
}

// One measured build in words: "Nov 5 · 6 min 5 s · exact revision a1b2c3d
// (SEED-9#e) · reused equivalent a1b2c3d for b2c3d4e (SEED-9#r1) · Run 41 ·
// attempt 1", the run attempt linked to its run.
function BuildEvidence({ point }: { readonly point: MeasuredPoint }) {
  return (
    <li>
      <time dateTime={point.startedAt}>{buildDateWords(point.startedAt)}</time>
      {` · ${pointWallTimeWords(point)} · `}
      <Words words={pointLandingsWords(point)} />
      <HistoryRunAttempt run={point} />
    </li>
  );
}

// One landing with no CI wall time in words: "Nov 9 · Pending · CI queued or
// running · landed revision b2c3d4e · Run 42 · attempt 1", "Nov 9 · Failed ·
// exact revision e5f6a7b (SEED-9#g) · Run 45 · attempt 1", or "Nov 9 · CI
// proof expired · reused equivalent a1b2c3d for b2c3d4e (SEED-9#r1) · Run 41
// · attempt 1", the run attempt it names linked to its run.
function GapEvidence({ gap }: { readonly gap: LandedCiGap }) {
  const build = gap.reason === "pending" ? undefined : gap.build;
  return (
    <li>
      <time dateTime={gap.receivedAt}>{buildDateWords(gap.receivedAt)}</time>
      {` · ${gapReasonWords(gap)} · `}
      {build === undefined ? (
        <>
          {"landed revision "}
          <Words words={landingWords(gap)} />
          {gap.reason === "pending" && <HistoryRunAttempt run={gap} />}
        </>
      ) : (
        <>
          <Words
            words={standsForWords(build.provenance, build.revision, [gap])}
          />
          <HistoryRunAttempt run={build} />
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
  const entries = shown?.entries ?? [];
  const points = entries.filter(isPoint);
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
      ) : (
        <>
          {latest === undefined ? (
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
              <IntentCiHistoryChart entries={entries} />
            </>
          )}
          {entries.length > 0 && (
            <details className="intent-ci-history-evidence">
              <summary>Builds and evidence</summary>
              <ul aria-label="Builds and evidence">
                {entries.map((entry) =>
                  entry.kind === "point" ? (
                    <BuildEvidence
                      key={landedCiEntryKey(entry)}
                      point={entry}
                    />
                  ) : (
                    <GapEvidence key={landedCiEntryKey(entry)} gap={entry} />
                  ),
                )}
              </ul>
            </details>
          )}
        </>
      )}
      {shown !== undefined && failed !== undefined && (
        <p className="intent-ci-history-note">{failed}</p>
      )}
    </section>
  );
}
