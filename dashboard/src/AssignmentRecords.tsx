// What a published assignment records beyond its agent: mode, host, and
// model, each beside its mark. A story's inspected detail shows them with the
// credited human developer (`./HumanCredit.tsx`) and branch context; the
// agent roster shows them beside each assignment; a card's scan view shows
// the host and model without the mode (`./AgentAssignmentFacts.tsx`). Branch
// context is shown as context only; it never says that branch work has
// reached trunk.

import type {
  AgentAssignment,
  AgentHost,
  AgentMode,
  AgentOwner,
  Preparing,
  TakenOwner,
} from "./agentAssignments.ts";
import { HumanCredit } from "./HumanCredit.tsx";
import { hostDescription } from "./hostDescription.ts";
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

const hostMarks: Readonly<Record<AgentHost, string>> = {
  claude: "tool-avatars/claude.png",
  codex: "tool-avatars/codex.png",
  cursor: "tool-avatars/cursor.png",
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

// What an assignment records beyond its agent, for example
// "Trunk Mode · Claude Code · claude-opus"; a preparation assignment records
// no mode, and a card's scan view leaves it to the detail (`withMode`). Each
// fact is its own group so a visual mark stays beside the label it belongs
// to; an unrecorded host keeps its text gap and gets no mark.
export function RecordedFacts({
  developer,
  withMode = true,
}: {
  developer: AgentAssignment & { readonly mode?: AgentMode };
  withMode?: boolean;
}) {
  const facts = [
    ...(developer.mode === undefined || !withMode
      ? []
      : [{ kind: "mode", ...modes[developer.mode] }]),
    { kind: "host", ...hostFact(developer.host) },
    {
      kind: "model",
      label: developer.model ?? "model not recorded",
      mark: undefined,
    },
  ];
  return facts.map((fact, index) => (
    <span key={fact.kind}>
      {index > 0 && " · "}
      <RecordedFact {...fact} />
    </span>
  ));
}

// A recorded host as every assignment shows it, beside its mark; a done
// story's card shows its agent's host the same way.
export function RecordedHost({ host }: { host: AgentHost }) {
  return <RecordedFact kind="host" {...hostFact(host)} />;
}

function hostFact(host: AgentHost | undefined): {
  label: string;
  mark: string | undefined;
} {
  return host === undefined
    ? { label: "host not recorded", mark: undefined }
    : { label: hostDescription(host).name, mark: hostMarks[host] };
}

function RecordedFact({
  kind,
  label,
  mark,
}: {
  kind: string;
  label: string;
  mark: string | undefined;
}) {
  return (
    <span className={`owner-fact owner-${kind}`}>
      <OwnerMark file={mark} />
      {label}
    </span>
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

// The assignment as inspected detail shows it: for each recorded assignment,
// the one-line developer summary, for example
// "Akiho-chan · Trunk Mode · Claude Code · claude-opus", the credited human
// developer, and, for Taken work, its branch context, with an unrecorded host
// or model as its text gap. Profile-level gaps and the short warning that the
// credited human is unknown stay on the card's scan view.
export function AssignmentDetail({
  owner,
  preparing,
}: {
  owner: TakenOwner | undefined;
  preparing: Preparing | undefined;
}) {
  const recorded =
    owner?.status === "recorded"
      ? { heading: "Assignment", assignments: owner.assignments }
      : preparing?.status === "recorded"
        ? {
            heading: "Preparation assignment",
            assignments: preparing.assignments,
          }
        : undefined;
  if (recorded === undefined) {
    return null;
  }
  return (
    <div className="assignment-detail">
      <h4>{recorded.heading}</h4>
      {recorded.assignments.map((each: AgentAssignment | AgentOwner) => (
        <div key={each.agent}>
          <p className="owner-summary">
            <span className="owner-fact owner-name">{each.agent}</span>
            {" · "}
            <RecordedFacts developer={each} />
          </p>
          <HumanCredit developer={each} />
          {"branch" in each && <BranchContext owner={each} />}
        </div>
      ))}
    </div>
  );
}
