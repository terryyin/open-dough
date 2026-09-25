// Card-facing assignments: who holds Taken work and who is preparing queued
// work, from the recorded agent profile facts, or the explicit gap when none
// is recorded or readable. Branch context is shown as context only; it never
// says that branch work has reached trunk. Preparing is an annotation on the
// queued card, never a stage or a claim that an agent is running.

import type {
  AgentAssignment,
  AgentHost,
  AgentMode,
  AgentOwner,
  Preparing,
  TakenOwner,
  UnreadableProfile,
} from "./agentAssignments.ts";
import { agentNames } from "../../src/skills/dough-product-backlog/scripts/product-backlog-agent-profile.mjs";
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

const portraitsPerAtlas = 6;

// The approved portrait for a recorded agent, by its rotation name. Portraits
// follow the shared agent rotation, six to an atlas in a three-column, two-row
// grid of taller cells; the square shown is each cell's center. The portrait
// is decorative: the agent name beside it carries the meaning.
function AgentPortrait({ name }: { name: string }) {
  const index = agentNames.indexOf(name);
  if (index < 0) {
    return null;
  }
  const atlas = Math.floor(index / portraitsPerAtlas) + 1;
  const tile = index % portraitsPerAtlas;
  const column = tile % 3;
  const row = Math.floor(tile / 3);
  return (
    <span
      className="agent-portrait"
      aria-hidden="true"
      style={{
        backgroundImage: `url("${import.meta.env.BASE_URL}agent-avatars/atlas-${atlas}.webp")`,
        backgroundPosition: `${column * 50}% ${row === 0 ? 12.5 : 87.5}%`,
      }}
    />
  );
}

// The one-line developer summary, for example
// "Akiho-chan · Trunk Mode · Claude Code · claude-opus"; a preparation
// assignment records no mode. Each fact is its own group so a visual mark
// stays beside the label it belongs to; an unrecorded host keeps its text gap
// and gets no mark.
function DeveloperSummary({
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
  return (
    <p className="owner-summary">
      <span className="owner-fact owner-agent">
        <AgentPortrait name={developer.name} />
        {developer.agent}
      </span>
      {facts.map(({ kind, label, mark }) => (
        <span key={kind}>
          {" · "}
          <span className={`owner-fact owner-${kind}`}>
            <OwnerMark file={mark} />
            {label}
          </span>
        </span>
      ))}
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

export function TakenOwnerFacts({ owner }: { owner: TakenOwner | undefined }) {
  if (owner === undefined) {
    return null;
  }
  if (owner.status === "loading") {
    return <p className="card-owner quiet">Reading agent profile…</p>;
  }
  if (owner.status === "unavailable") {
    return <p className="card-owner preparation-problem">{owner.problem}</p>;
  }
  if (owner.status === "not-recorded") {
    return <p className="card-owner">Owner not recorded</p>;
  }
  return (
    <div className="card-owner">
      {owner.assignments.map((each) => (
        <div key={each.agent}>
          <DeveloperSummary developer={each} />
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
}: {
  preparing: Preparing | undefined;
}) {
  if (preparing === undefined || preparing.status === "not-recorded") {
    return null;
  }
  if (preparing.status === "unavailable") {
    return (
      <p className="card-owner preparation-problem">
        Preparation assignment unknown. {preparing.problem}
      </p>
    );
  }
  const { assignments: preparers } = preparing;
  return (
    <div className="card-owner card-preparing">
      <p className="preparing-activity">Preparing</p>
      {preparers.map((each) => (
        <DeveloperSummary key={each.agent} developer={each} />
      ))}
      {preparers.length > 1 && (
        <p className="preparation-problem">
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
        <li key={file} className="preparation-problem">
          Agent profile {file} is unreadable: {problem}. It is not matched to
          any entry.
        </li>
      ))}
    </ul>
  );
}
