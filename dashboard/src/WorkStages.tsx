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

// How many entries a column holds, in the words its stage heading and the
// edge control that shows it (./ColumnEdge.tsx) both use.
export function entryCount(entries: number): string {
  return entries === 1 ? "1 entry" : `${entries} entries`;
}

// The two stages, left to right, each named and holding its recorded
// entries, as they show and as the dashboard columns name them.
export function stagesOf(work: PublishedWork) {
  return [
    { name: "Backlog", entries: work.backlog },
    { name: "Taken", entries: work.taken },
  ] as const;
}

function Stage({
  sourceId,
  name,
  entries,
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
  name: string;
  entries: readonly WorkEntry[];
  prioritized: boolean;
  showsSliceProgress: boolean;
  launches: MachineSessions;
  offersStart: boolean;
  selectedIdentity: string | undefined;
  onSelect: (identity: string) => void;
  onOpenRoster: OpenRoster;
  unreadableProfiles?: readonly UnreadableProfile[] | undefined;
}) {
  const headingId = `stage-${name.toLowerCase()}`;
  return (
    <section className="stage" aria-labelledby={headingId}>
      <header className="stage-header">
        <h2 id={headingId}>{name}</h2>
        <p className="stage-count">{entryCount(entries.length)}</p>
      </header>
      <UnreadableProfiles profiles={unreadableProfiles} />
      {entries.length === 0 ? (
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
        </ol>
      )}
    </section>
  );
}

// Two recorded groups and the one relationship between them. Membership and
// order come straight from the snapshot; nothing here sorts, infers further
// stages, or marks work as active. Cards are keyed by work identity so the same
// work is one card across snapshots, and carry the marks `workFocus` defines so
// keyboard focus can follow that work.
export function WorkStages({
  work,
  launches,
  onOpenRoster,
}: {
  work: PublishedWork;
  launches: MachineSessions;
  onOpenRoster: OpenRoster;
}) {
  const [backlog, taken] = stagesOf(work);
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
          name={backlog.name}
          entries={backlog.entries}
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
          name={taken.name}
          entries={taken.entries}
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
