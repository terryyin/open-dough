// Card-facing ownership of Taken work: the recorded agent profile facts, or
// the explicit gap when none is recorded or readable. Branch context is shown
// as context only; it never says that branch work has reached trunk.

import type {
  AgentHost,
  AgentMode,
  AgentOwner,
  TakenOwner,
  UnreadableProfile,
} from "./takenOwner.ts";
import { agentNames } from "../../src/skills/dough-product-backlog/scripts/product-backlog-agent-profile.mjs";
import "./taken-owner.css";

const modeLabels: Readonly<Record<AgentMode, string>> = {
  trunk: "Trunk Mode",
  "story-branch": "Story Branch Mode",
};

const hostLabels: Readonly<Record<AgentHost, string>> = {
  claude: "Claude Code",
  codex: "Codex",
  cursor: "Cursor",
};

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

// The one-line owner summary, for example
// "Akiho-chan · Trunk Mode · Claude Code · claude-opus". Each fact is its own
// group so a visual mark stays beside the label it belongs to.
function OwnerSummary({ owner }: { owner: AgentOwner }) {
  const facts = [
    { kind: "mode", label: modeLabels[owner.mode] },
    {
      kind: "host",
      label:
        owner.host === undefined ? "host not recorded" : hostLabels[owner.host],
    },
    { kind: "model", label: owner.model ?? "model not recorded" },
  ];
  return (
    <p className="owner-summary">
      <span className="owner-fact owner-agent">
        <AgentPortrait name={owner.name} />
        {owner.agent}
      </span>
      {facts.map(({ kind, label }) => (
        <span key={kind}>
          {" · "}
          <span className={`owner-fact owner-${kind}`}>{label}</span>
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
      {owner.owners.map((each) => (
        <div key={each.agent}>
          <OwnerSummary owner={each} />
          <BranchContext owner={each} />
        </div>
      ))}
    </div>
  );
}

// Profiles the shared reader could not read name no Taken entry, so they are
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
          any Taken entry.
        </li>
      ))}
    </ul>
  );
}
