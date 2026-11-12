// Recently done as the Board's Columns show it (`./recentlyDoneView.ts`
// decides what it lists): the requested first entries newest first, each
// done story's card holding its sessions, the gaps in what could be read, the
// one action that shows the next ten older entries, and, beside the heading
// while more than ten show, the one that shows only the latest ten again
// (`./RecentlyDoneRangeActions.tsx`). Each entry is a session or a done
// story's card (`./RecentlyDoneEntry.tsx`); the cards share the project's CI
// follow-ups and story review states, each read once per project. The
// keyboard in the list keeps a useful place across a refresh
// (`./recentlyDoneFocus.ts`).

import { useCiFollowUps } from "./CiFollowUpViews.tsx";
import { useRef } from "react";
import { launchRetentionDays } from "./agentLaunch.ts";
import { entryCount } from "./columnSummary.ts";
import { CreationEntry } from "./CreationEntry.tsx";
import { columnMark } from "./columnPaging.ts";
import { ShowLatest, ShownRange } from "./RecentlyDoneRangeActions.tsx";
import { unreadableDoneRecord } from "./doneRecord.ts";
import type { MachineSessions } from "./agentLaunches.ts";
import { useStorySelection } from "./pageStorySelection.tsx";
import { useHeldEntryFocus } from "./recentlyDoneFocus.ts";
import { recentlyDoneName, type RecentlyDoneView } from "./recentlyDoneView.ts";
import { ListedEntry } from "./RecentlyDoneEntry.tsx";
import { SessionList } from "./SessionLists.tsx";
import { sessionKey } from "./sessionReference.ts";
import { useStoryReviewStates } from "./storyReviewStates.ts";
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
                ? unreadableDoneRecord(file, detail.problem)
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

export function RecentlyDone({
  view,
  sourceId,
  project,
  launches,
}: {
  readonly view: RecentlyDoneView;
  readonly sourceId: string;
  // The project's name.
  readonly project: string;
  readonly launches: MachineSessions;
}) {
  const ciFollowUps = useCiFollowUps(sourceId);
  const reviewStates = useStoryReviewStates(sourceId);
  const section = useRef<HTMLElement>(null);
  const { selectedIdentity, toggle } = useStorySelection(sourceId);
  const {
    creations: listedCreations,
    records,
    none,
    shown,
    details,
    column,
  } = view;
  const focus = useHeldEntryFocus(view, section);
  return (
    <section
      ref={section}
      className="recently-done"
      aria-labelledby="recently-done-heading"
      tabIndex={-1}
      {...columnMark}
    >
      <header className="column-header">
        <h2 id="recently-done-heading">{recentlyDoneName}</h2>
        <div className="column-header-actions">
          <p className="column-count">{entryCount(column.entries)}</p>
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
        <ol {...focus}>
          {shown.map((each) => (
            <li
              key={
                "record" in each
                  ? `done ${each.record.identity}`
                  : sessionKey(each.session.session)
              }
            >
              <ListedEntry
                each={each}
                ciFollowUps={ciFollowUps}
                reviewStates={reviewStates}
                detailOf={details.detailOf}
                revision={view.revision}
                sourceId={sourceId}
                project={project}
                launches={launches}
                selectedIdentity={selectedIdentity}
                onSelect={toggle}
              />
            </li>
          ))}
        </ol>
      )}
      <ShownRange view={view} />
    </section>
  );
}
