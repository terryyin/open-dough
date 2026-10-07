// Recently done as the dashboard columns show it (`./recentlyDoneView.ts`
// decides what it lists): the requested first entries newest first, each
// done story's card holding its sessions, the gaps in what could be read, the
// one action that shows the next ten older entries, and, beside the heading
// while more than ten show, the one that shows only the latest ten again
// (`./RecentlyDoneRangeActions.tsx`).

import { useRef } from "react";
import type { CataloguedDoneRecord } from "../../src/skills/dough-product-backlog/scripts/product-backlog-done-catalog.mjs";
import { launchRetentionDays } from "./agentLaunch.ts";
import { entryCount } from "./columnSummary.ts";
import { CreationEntry } from "./CreationEntry.tsx";
import { DoneStoryCard } from "./DoneStoryCard.tsx";
import { ShowLatest, ShownRange } from "./RecentlyDoneRangeActions.tsx";
import type { DoneDetail } from "./doneDetails.ts";
import {
  recentlyDoneName,
  type Listed,
  type RecentlyDoneView,
} from "./recentlyDoneView.ts";
import { SessionEntry, SessionList } from "./SessionEntry.tsx";
import { sessionKey } from "./sessionReference.ts";
import "./agent-launch.css";
import "./recently-done.css";

function DoneReadGaps({ view }: { readonly view: RecentlyDoneView }) {
  const { problem, unreadable, details } = view;
  return (
    <>
      {problem !== undefined && <p className="assignment-gap">{problem}</p>}
      {unreadable.length > 0 && (
        <ul aria-label="Unreadable done records">
          {unreadable.map(({ file, detail }) => (
            <li key={file} className="assignment-gap">
              {detail.status === "unreadable"
                ? `Done record ${file} is unreadable: ${detail.problem}.`
                : `Done record ${file} is unreadable.`}
            </li>
          ))}
        </ul>
      )}
      {details.failed !== undefined && (
        <div className="done-read-gap">
          <p className="assignment-gap">{details.failed.problem}</p>
          <button
            type="button"
            className="frame-button"
            onClick={details.retry}
          >
            Retry done stories
          </button>
        </div>
      )}
    </>
  );
}

// What an entry's story card says until its record is read.
function unreadWords(
  detail: DoneDetail,
  file: string,
): { readonly words: string; readonly gap: boolean } | undefined {
  switch (detail.status) {
    case "read":
      return undefined;
    case "reading":
      return { words: "Reading done story…", gap: false };
    case "failed":
      return { words: "This done story could not be read.", gap: true };
    case "unreadable":
      return {
        words: `Done record ${file} is unreadable: ${detail.problem}.`,
        gap: true,
      };
  }
}

function ListedEntry({
  each,
  detailOf,
}: {
  readonly each: Listed;
  readonly detailOf: (record: CataloguedDoneRecord) => DoneDetail;
}) {
  if (!("record" in each)) {
    return <SessionEntry record={each.session} onCard={false} />;
  }
  const { record, sessions } = each;
  const detail = detailOf(record);
  return (
    <DoneStoryCard
      identity={record.identity}
      completedAt={record.completedAt}
      story={detail.status === "read" ? detail.story : undefined}
      said={unreadWords(detail, record.fileName)}
      sessions={sessions}
    />
  );
}

export function RecentlyDone({ view }: { readonly view: RecentlyDoneView }) {
  const section = useRef<HTMLElement>(null);
  const {
    creations: listedCreations,
    records,
    none,
    shown,
    details,
    column,
  } = view;
  return (
    <section
      ref={section}
      className="recently-done"
      aria-labelledby="recently-done-heading"
      tabIndex={-1}
    >
      <header className="stage-header">
        <h2 id="recently-done-heading">{recentlyDoneName}</h2>
        <div className="stage-header-actions">
          <p className="stage-count">{entryCount(column.entries)}</p>
          <ShowLatest view={view} section={section} />
        </div>
      </header>
      <p className="quiet">
        Recently done stories and sessions launched from this dashboard for this
        project, newest first. Sessions are kept on this machine.
      </p>
      <DoneReadGaps view={view} />
      {listedCreations.map((record) => (
        <CreationEntry key={record.launchedAt} record={record} />
      ))}
      <SessionList sessions={records} none={none}>
        {() => (
          <p className="quiet">
            Sessions marked done are kept for {launchRetentionDays} days after
            marking.
          </p>
        )}
      </SessionList>
      {shown.length > 0 && (
        <ol>
          {shown.map((each) => (
            <li
              key={
                "record" in each
                  ? `done ${each.record.identity}`
                  : sessionKey(each.session.session)
              }
            >
              <ListedEntry each={each} detailOf={details.detailOf} />
            </li>
          ))}
        </ol>
      )}
      <ShownRange view={view} />
    </section>
  );
}
