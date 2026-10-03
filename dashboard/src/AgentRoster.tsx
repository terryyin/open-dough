// The selected project's agent roster: every agent of the collection it
// selected, and the assignments its published profiles record at the shown
// revision. It is
// one more view of the snapshot the stages show, never a separate read, and an
// assignment says what a profile records, never that its agent is working now.
// Back returns to the stories the roster was opened from.

import { useLayoutEffect, useRef, type ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import type { RosterMember } from "./assignmentRoster.ts";
import { RecordedFacts } from "./AssignmentRecords.tsx";
import { HumanCredit } from "./HumanCredit.tsx";
import { AgentPortrait } from "./AgentPortrait.tsx";
import { Icon } from "./Icon.tsx";
import type { PublishedSource } from "./publishedSource.ts";
import { shortRevision, type PublishedWork } from "./publishedWork.ts";
import {
  agentIdentity,
  agentNames,
} from "../../src/skills/dough-product-backlog/scripts/product-backlog-agent-profile.mjs";
import "./frame-controls.css";
import "./agent-roster.css";

const activities = { execution: "Taken", preparation: "Preparing" } as const;

// Why no agent's assignment is known: the profiles are still being read, or
// could not be, or no snapshot was read to hold them. Only a profile directory
// that was read can show an agent has none.
function AssignmentUnknown({ reason }: { reason: string | undefined }) {
  if (reason !== undefined) {
    return <p className="assignment-gap">Assignment unknown. {reason}</p>;
  }
  return <p className="quiet">Reading agent profile…</p>;
}

// What a read member's published profile assigns it to.
function MemberAssignment({ member: { profile } }: { member: RosterMember }) {
  if (profile === undefined) {
    return <p className="quiet">No assignment recorded</p>;
  }
  if ("problem" in profile) {
    return (
      <p className="assignment-gap">
        Assignment uncertain: agent profile {profile.file} is unreadable:{" "}
        {profile.problem}.
      </p>
    );
  }
  return (
    <div className="roster-assignment">
      <p className="roster-activity">{activities[profile.activity]}</p>
      {profile.title === undefined ? (
        <p className="assignment-gap">
          Task title not found: the published backlog at this revision lists no
          entry with this identity.
        </p>
      ) : (
        <p className="roster-title">{profile.title}</p>
      )}
      <p className="card-identity">{profile.identity}</p>
      <p className="owner-summary">
        <RecordedFacts developer={profile} />
      </p>
      <HumanCredit developer={profile} />
    </div>
  );
}

export function AgentRoster({
  source,
  work,
  problem,
  agent,
  onBack,
}: {
  source: PublishedSource;
  work: PublishedWork | undefined;
  // Why the selected project's latest read failed, if it did.
  problem: string | undefined;
  // The rotation name whose portrait opened the roster, while its project is
  // still the selected one.
  agent: string | undefined;
  onBack: () => void;
}) {
  const opened = useRef<HTMLLIElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  // Opening the roster brings the keyboard to the agent it was opened from,
  // or the heading on direct visits.
  useLayoutEffect(() => {
    if (agent !== undefined) {
      opened.current?.focus();
    } else {
      heading.current?.focus();
    }
  }, [agent]);
  const roster = work?.roster;
  // Without a snapshot, no profile read is under way: the read failed, or the
  // project's published work is still being read.
  const unknownReason =
    work === undefined
      ? (problem ?? "Published work is still being read.")
      : roster?.status === "unavailable"
        ? roster.problem
        : undefined;
  // The project's setting could not say which collection it selected.
  const collectionProblem =
    roster?.status === "collection-unknown" ? roster.problem : undefined;
  // One agent of the rotation, marked when its portrait opened the roster.
  const row = (name: string, assignment: ReactNode) => {
    const current = name === agent;
    return (
      <li
        key={name}
        ref={current ? opened : undefined}
        tabIndex={current ? -1 : undefined}
        aria-current={current ? "true" : undefined}
        className={current ? "roster-member roster-opened" : "roster-member"}
      >
        <h3 className="roster-agent">
          <AgentPortrait name={name} />
          {agentIdentity(name).agent}
        </h3>
        {current && (
          <p className="roster-opened-note">Opened from its portrait</p>
        )}
        {assignment}
      </li>
    );
  };
  return (
    <section className="agent-roster" aria-labelledby="agent-roster-heading">
      <p>
        <button type="button" className="frame-button" onClick={onBack}>
          <Icon icon={ArrowLeft} />
          Back to stories
        </button>
      </p>
      <h2 id="agent-roster-heading" ref={heading} tabIndex={-1}>
        Agent roster
      </h2>
      <p className="roster-source">
        {work === undefined
          ? `${source.label}: no published work has been read, so no assignment is known.`
          : `${source.label}: agent profiles published at revision ${shortRevision(work.revision)}.`}{" "}
        An assignment is what a published profile records, not whether its agent
        is working now.
      </p>
      {collectionProblem !== undefined ? (
        <p className="assignment-gap">
          Agent collection unknown. {collectionProblem}.
        </p>
      ) : (
        <ol className="roster-members">
          {roster?.status === "read"
            ? roster.members.map((member) =>
                row(member.name, <MemberAssignment member={member} />),
              )
            : agentNames.map((name) =>
                row(name, <AssignmentUnknown reason={unknownReason} />),
              )}
        </ol>
      )}
    </section>
  );
}
