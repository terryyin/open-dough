import { SessionEntry } from "./SessionEntry.tsx";
import { sessionKey } from "./sessionReference.ts";
import type { LaunchWithState } from "./agentLaunch.ts";
import { useState } from "react";
import { type PublishedWork, type WorkEntry } from "./publishedWork.ts";
import {
  UnreadableProfiles,
  type OpenRoster,
} from "./AgentAssignmentFacts.tsx";
import type { UnreadableProfile } from "./agentAssignments.ts";
import { stagesMarks } from "./workFocus.ts";
import type { MachineSessions } from "./agentLaunches.ts";
import { WorkCard } from "./WorkCard.tsx";
import { entryCount, type ColumnSummary } from "./columnSummary.ts";

type StageView = {
  readonly column: ColumnSummary;
  readonly entries: readonly WorkEntry[];
  readonly localSessions: readonly LaunchWithState[] | undefined;
};

// Each stage's stories, standalone sessions, and completeness feed both its
// rendered list and the heading/edge summary. Published order stays intact.
export function stagesOf(
  work: PublishedWork,
  localTaken: readonly LaunchWithState[] | undefined,
) {
  const stage = (
    name: string,
    entries: readonly WorkEntry[],
    localSessions: readonly LaunchWithState[] | undefined,
  ): StageView => ({
    column: {
      name,
      entries:
        localSessions === undefined
          ? undefined
          : entries.length + localSessions.length,
    },
    entries,
    localSessions,
  });
  return [
    stage("Backlog", work.backlog, []),
    stage("Taken", work.taken, localTaken),
  ] as const;
}

function Stage({
  sourceId,
  view,
  prioritized,
  showsSliceProgress,
  launches,
  offersStart,
  selectedIdentity,
  onSelect,
  onOpenRoster,
  unreadableProfiles,
}: {
  sourceId: string;
  view: StageView;
  prioritized: boolean;
  showsSliceProgress: boolean;
  launches: MachineSessions;
  offersStart: boolean;
  selectedIdentity: string | undefined;
  onSelect: (identity: string) => void;
  onOpenRoster: OpenRoster;
  unreadableProfiles?: readonly UnreadableProfile[] | undefined;
}) {
  const {
    column: { name, entries: count },
    entries,
    localSessions,
  } = view;
  const headingId = `stage-${name.toLowerCase()}`;
  return (
    <section className="stage" aria-labelledby={headingId} tabIndex={-1}>
      <header className="stage-header">
        <h2 id={headingId}>{name}</h2>
        <p className="stage-count">{entryCount(count)}</p>
      </header>
      <UnreadableProfiles profiles={unreadableProfiles} />
      {localSessions === undefined && (
        <p className="quiet">Reading sessions…</p>
      )}
      {count === 0 ? (
        <p className="quiet stage-empty">No {name} entries are recorded.</p>
      ) : (
        <ol className="cards">
          {entries.map((entry, index) => (
            <li key={entry.identity}>
              <WorkCard
                sourceId={sourceId}
                entry={entry}
                priority={prioritized ? index + 1 : undefined}
                showsSliceProgress={showsSliceProgress}
                launches={launches}
                offersStart={offersStart}
                selected={selectedIdentity === entry.identity}
                onSelect={onSelect}
                onOpenRoster={onOpenRoster}
              />
            </li>
          ))}
          {localSessions?.map((record) => (
            <li key={sessionKey(record.session)}>
              <SessionEntry record={record} onCard={false} />
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

// The projected stages keep published story membership/order separate from
// machine-local sessions. Cards retain work identity and workFocus marks.
export function WorkStages({
  work,
  stages,
  launches,
  onOpenRoster,
}: {
  work: PublishedWork;
  stages: ReturnType<typeof stagesOf>;
  launches: MachineSessions;
  onOpenRoster: OpenRoster;
}) {
  const [backlog, taken] = stages;
  const [selectedIdentity, setSelectedIdentity] = useState<string | undefined>(
    undefined,
  );
  const select = (identity: string) => {
    setSelectedIdentity((current) =>
      current === identity ? undefined : identity,
    );
  };
  return (
    <>
      <section className="stages" aria-label="Work stages" {...stagesMarks}>
        <Stage
          sourceId={work.source.id}
          view={backlog}
          prioritized
          showsSliceProgress={false}
          launches={launches}
          offersStart
          selectedIdentity={selectedIdentity}
          onSelect={select}
          onOpenRoster={onOpenRoster}
        />
        <Stage
          sourceId={work.source.id}
          view={taken}
          prioritized={false}
          showsSliceProgress
          launches={launches}
          offersStart={false}
          selectedIdentity={selectedIdentity}
          onSelect={select}
          onOpenRoster={onOpenRoster}
          unreadableProfiles={work.unreadableProfiles}
        />
      </section>
    </>
  );
}
