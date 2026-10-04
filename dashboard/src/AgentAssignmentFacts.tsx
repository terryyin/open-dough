// Card-facing assignments: who holds Taken work and who is preparing queued
// work, from the recorded agent profile facts, or the explicit gap when none
// is recorded or readable. A card's scan view shows each developer's portrait
// (which opens the roster) and name with its credited human, host and model,
// and every gap; the mode, branch context and why a human is unknown are in
// the story's inspected detail (`./AssignmentRecords.tsx`). Preparing is an
// annotation on the queued card, never a stage or a claim that an agent is
// running.

import type {
  AgentAssignment,
  Preparing,
  TakenOwner,
  UnreadableProfile,
} from "./agentAssignments.ts";
import { AgentPortrait } from "./AgentPortrait.tsx";
import { RecordedFacts } from "./AssignmentRecords.tsx";
import { HumanCreditBrief } from "./HumanCredit.tsx";
import { useFrameDescription } from "./protectedFrame.ts";
import "./agent-assignment.css";

// Opens the agent roster at the named agent, from the control that asked, so
// that closing the roster can return focus to it.
export type OpenRoster = (name: string, opener: HTMLElement) => void;

// A card's portrait opens the agent roster at its agent: a control named for
// what it does, holding the decorative portrait.
function PortraitOpener({
  developer,
  onOpenRoster,
}: {
  developer: AgentAssignment;
  onOpenRoster: OpenRoster;
}) {
  const described = useFrameDescription();
  return (
    <button
      type="button"
      className="portrait-opener"
      aria-label={`Show ${developer.agent} in the agent roster`}
      aria-describedby={described}
      onClick={(event) => {
        onOpenRoster(developer.name, event.currentTarget);
      }}
    >
      <AgentPortrait name={developer.name} />
    </button>
  );
}

// The scan view of a developer, for example
// "Akiho-chan · Terry Yin · Claude Code · claude-opus": the agent's portrait,
// which opens the roster, its name, its credited human or the short warning
// that it is unknown, and its host and model or their gaps.
function DeveloperName({
  developer,
  onOpenRoster,
}: {
  developer: AgentAssignment;
  onOpenRoster: OpenRoster;
}) {
  const human =
    developer.human.status === "loading" ? null : (
      <>
        {" · "}
        <HumanCreditBrief developer={developer} />
      </>
    );
  return (
    <span className="owner-line">
      <span className="owner-fact owner-agent">
        <PortraitOpener developer={developer} onOpenRoster={onOpenRoster} />
        {developer.agent}
      </span>
      {human}
      {" · "}
      <RecordedFacts developer={developer} withMode={false} />
    </span>
  );
}

// Who holds Taken work, as the card's scan view shows it: each developer's
// scan line, or the gap that leaves the owner unknown.
export function TakenOwnerFacts({
  owner,
  onOpenRoster,
}: {
  owner: TakenOwner | undefined;
  onOpenRoster: OpenRoster;
}) {
  if (owner === undefined) {
    return null;
  }
  if (owner.status === "loading") {
    return <p className="card-owner quiet">Reading agent profile…</p>;
  }
  if (owner.status === "unavailable") {
    return <p className="card-owner assignment-gap">{owner.problem}</p>;
  }
  if (owner.status === "not-recorded") {
    return <p className="card-owner">Owner not recorded</p>;
  }
  return (
    <p className="card-owner">
      {owner.assignments.map((each) => (
        <DeveloperName
          key={each.agent}
          developer={each}
          onOpenRoster={onOpenRoster}
        />
      ))}
    </p>
  );
}

// A queued entry's published preparation assignment, as the card's scan view
// shows it: Preparing and the assigned developer. Nothing is shown when none
// is recorded, since Preparing is not a stage every entry passes through;
// unread profiles and more than one assignment for the entry are shown as
// uncertainty.
export function PreparingFacts({
  preparing,
  onOpenRoster,
}: {
  preparing: Preparing | undefined;
  onOpenRoster: OpenRoster;
}) {
  if (preparing === undefined || preparing.status === "not-recorded") {
    return null;
  }
  if (preparing.status === "unavailable") {
    return (
      <p className="card-owner assignment-gap">
        Preparation assignment unknown. {preparing.problem}
      </p>
    );
  }
  const { assignments: preparers } = preparing;
  return (
    <>
      <p className="card-owner card-preparing">
        <span className="preparing-activity">Preparing</span>
        {preparers.map((each) => (
          <DeveloperName
            key={each.agent}
            developer={each}
            onOpenRoster={onOpenRoster}
          />
        ))}
      </p>
      {preparers.length > 1 && (
        <p className="assignment-gap">
          Conflicting records: {preparers.length} preparation assignments name
          this entry.
        </p>
      )}
    </>
  );
}

// Profiles the shared reader could not read name no entry, so they are
// listed with the stage rather than guessed onto a card.
export function UnreadableProfiles({
  profiles,
}: {
  profiles: readonly UnreadableProfile[] | undefined;
}) {
  if (profiles === undefined || profiles.length === 0) {
    return null;
  }
  return (
    <ul className="unreadable-profiles" aria-label="Unreadable agent profiles">
      {profiles.map(({ file, problem }) => (
        <li key={file} className="assignment-gap">
          Agent profile {file} is unreadable: {problem}. It is not matched to
          any entry.
        </li>
      ))}
    </ul>
  );
}
