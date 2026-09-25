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

const modeLabels: Readonly<Record<AgentMode, string>> = {
  trunk: "Trunk Mode",
  "story-branch": "Story Branch Mode",
};

const hostLabels: Readonly<Record<AgentHost, string>> = {
  claude: "Claude Code",
  codex: "Codex",
  cursor: "Cursor",
};

// The one-line owner summary, for example
// "Akiho-chan · Trunk Mode · Claude Code · claude-opus".
function ownerSummary(owner: AgentOwner): string {
  return [
    owner.agent,
    modeLabels[owner.mode],
    owner.host === undefined ? "host not recorded" : hostLabels[owner.host],
    owner.model ?? "model not recorded",
  ].join(" · ");
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
          <p className="owner-summary">{ownerSummary(each)}</p>
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
