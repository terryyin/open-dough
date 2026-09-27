// The human developer credited for a published assignment: who committed its
// profile's current allocation (`./commissionAttribution.ts`), or why that is
// not known. Shown on story cards and in the agent roster.

import type { AgentAssignment } from "./agentAssignments.ts";
import "./agent-assignment.css";

// Who committed the assignment's profile allocation, or why that is not
// known. A name credits the commission, never presence.
export function HumanCredit({ developer }: { developer: AgentAssignment }) {
  const { human } = developer;
  switch (human.status) {
    case "loading":
      return <p className="owner-human quiet">Reading human developer…</p>;
    case "credited":
      return <p className="owner-human">Human developer: {human.name}</p>;
    case "no-addition":
      return (
        <p className="owner-human preparation-problem">
          Human developer unknown: no commit adding this agent profile was found
          in its recent published history.
        </p>
      );
    case "unnamed":
      return (
        <p className="owner-human preparation-problem">
          Human developer unknown: the commit that added this agent profile
          names no usable committer.
        </p>
      );
    case "unavailable":
      return (
        <p className="owner-human preparation-problem">
          Human developer unknown. {human.problem}
        </p>
      );
  }
}
