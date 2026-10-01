// Card-facing assignments: who holds Taken work and who is preparing queued
// work, from the recorded agent profile facts, or the explicit gap when none
// is recorded or readable. Branch context is shown as context only; it never
// says that branch work has reached trunk. Preparing is an annotation on the
// queued card, never a stage or a claim that an agent is running. The human
// developer credited for an assignment is shown beside it (`./HumanCredit.tsx`).

import type {
  AgentAssignment,
  AgentHost,
  AgentMode,
  AgentOwner,
  Preparing,
  TakenOwner,
  UnreadableProfile,
} from "./agentAssignments.ts";
import { AgentPortrait } from "./AgentPortrait.tsx";
import { HumanCredit } from "./HumanCredit.tsx";
import { useFrameDescription } from "./protectedFrame.ts";
import "./agent-assignment.css";

// How each recorded mode and host is presented: its label, and the local mark
// shown beside it (an original symbol for each mode and each host's official
// mark). See dashboard/public/AVATARS.md for provenance.
const modes: Readonly<Record<AgentMode, { label: string; mark: string }>> = {
  trunk: { label: "Trunk Mode", mark: "mode-icons/trunk.svg" },
  "story-branch": {
    label: "Story Branch Mode",
    mark: "mode-icons/story-branch.svg",
  },
};

const hosts: Readonly<Record<AgentHost, { label: string; mark: string }>> = {
  claude: { label: "Claude Code", mark: "tool-avatars/claude.png" },
  codex: { label: "Codex", mark: "tool-avatars/codex.png" },
  cursor: { label: "Cursor", mark: "tool-avatars/cursor.png" },
};

// A decorative mark: the label beside it carries the meaning.
function OwnerMark({ file }: { file: string | undefined }) {
  if (file === undefined) {
    return null;
  }
  return (
    <img
      className="owner-mark"
      src={`${import.meta.env.BASE_URL}${file}`}
      alt=""
      width={16}
      height={16}
    />
  );
}

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

// What an assignment records beyond its agent, for example
// "Trunk Mode · Claude Code · claude-opus"; a preparation assignment records
// no mode. Each fact is its own group so a visual mark stays beside the label
// it belongs to; an unrecorded host keeps its text gap and gets no mark.
export function RecordedFacts({
  developer,
}: {
  developer: AgentAssignment & { readonly mode?: AgentMode };
}) {
  const facts = [
    ...(developer.mode === undefined
      ? []
      : [{ kind: "mode", ...modes[developer.mode] }]),
    {
      kind: "host",
      ...(developer.host === undefined
        ? { label: "host not recorded", mark: undefined }
        : hosts[developer.host]),
    },
    {
      kind: "model",
      label: developer.model ?? "model not recorded",
      mark: undefined,
    },
  ];
  return facts.map(({ kind, label, mark }, index) => (
    <span key={kind}>
      {index > 0 && " · "}
      <span className={`owner-fact owner-${kind}`}>
        <OwnerMark file={mark} />
        {label}
      </span>
    </span>
  ));
}

// The one-line developer summary, for example
// "Akiho-chan · Trunk Mode · Claude Code · claude-opus", led by the agent's
// portrait.
function DeveloperSummary({
  developer,
  onOpenRoster,
}: {
  developer: AgentAssignment & { readonly mode?: AgentMode };
  onOpenRoster: OpenRoster;
}) {
  return (
    <p className="owner-summary">
      <span className="owner-fact owner-agent">
        <PortraitOpener developer={developer} onOpenRoster={onOpenRoster} />
        {developer.agent}
      </span>
      {" · "}
      <RecordedFacts developer={developer} />
    </p>
  );
}

function BranchContext({ owner }: { owner: AgentOwner }) {
  if (owner.mode === "trunk") {
    return <p className="owner-branch">Trunk: {owner.branch}</p>;
  }
  return (
    <p className="owner-branch">
      Branch context: {owner.branch} (story branch work; not on trunk)
    </p>
  );
}

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
    <div className="card-owner">
      {owner.assignments.map((each) => (
        <div key={each.agent}>
          <DeveloperSummary developer={each} onOpenRoster={onOpenRoster} />
          <HumanCredit developer={each} />
          <BranchContext owner={each} />
        </div>
      ))}
    </div>
  );
}

// A queued entry's published preparation assignment: Preparing and the
// assigned developer. Nothing is shown when none is recorded, since Preparing
// is not a stage every entry passes through; unread profiles and more than
// one assignment for the entry are shown as uncertainty.
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
    <div className="card-owner card-preparing">
      <p className="preparing-activity">Preparing</p>
      {preparers.map((each) => (
        <div key={each.agent}>
          <DeveloperSummary developer={each} onOpenRoster={onOpenRoster} />
          <HumanCredit developer={each} />
        </div>
      ))}
      {preparers.length > 1 && (
        <p className="assignment-gap">
          Conflicting records: {preparers.length} preparation assignments name
          this entry.
        </p>
      )}
    </div>
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
