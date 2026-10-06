// The human developer credited for a published assignment: who committed its
// profile's current allocation (`./assignmentAttribution.ts`), or why that is
// not known, with the matched GitHub account's avatar beside a credited name.
// Shown in a story's detail and in the agent roster; a card's scan view keeps
// the credited name with its avatar, or the short warning that it is unknown
// (`HumanCreditBrief`).

import { useState, type ReactNode } from "react";
import type { AgentAssignment } from "./agentAssignments.ts";
import "./agent-assignment.css";

// A name's initials: its first and last words' first letters.
function initialsOf(name: string): string {
  const words = name.split(/\s+/).filter((word) => word.length > 0);
  const initial = (word: string | undefined) => Array.from(word ?? "")[0] ?? "";
  return `${initial(words[0])}${words.length > 1 ? initial(words.at(-1)) : ""}`.toUpperCase();
}

// The credited account's avatar, served by the local boundary, or the name's
// initials when no account was matched or its avatar cannot be shown, unless
// `withInitials` is false. Both are decorative: the name beside them carries
// the meaning, and neither implies the person is present.
function HumanAvatar({
  name,
  avatar,
  withInitials = true,
}: {
  name: string;
  avatar: string | undefined;
  withInitials?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  if (avatar === undefined || failed) {
    if (!withInitials) return null;
    return (
      <span className="human-avatar human-avatar-fallback" aria-hidden="true">
        {initialsOf(name)}
      </span>
    );
  }
  return (
    <img
      className="human-avatar"
      src={avatar}
      alt=""
      onError={() => {
        setFailed(true);
      }}
    />
  );
}

// Who committed the assignment's profile allocation, or why that is not
// known. A name credits the assignment, never presence.
export function HumanCredit({ developer }: { developer: AgentAssignment }) {
  const { human } = developer;
  switch (human.status) {
    case "loading":
      return <p className="owner-human quiet">Reading human developer…</p>;
    case "credited":
      return (
        <div className="owner-human-credit">
          <HumanAvatar
            key={human.avatar ?? ""}
            name={human.name}
            avatar={human.avatar}
          />
          <p className="owner-human">Human developer: {human.name}</p>
        </div>
      );
    case "no-addition":
      return (
        <p className="owner-human assignment-gap">
          Human developer unknown: no commit adding this agent profile was found
          in its recent published history.
        </p>
      );
    case "unnamed":
      return (
        <p className="owner-human assignment-gap">
          Human developer unknown: the commit that added this agent profile
          names no usable committer.
        </p>
      );
    case "unavailable":
      return (
        <p className="owner-human assignment-gap">
          Human developer unknown. {human.problem}
        </p>
      );
  }
}

// A human developer's name as a card's scan view shows it, after the avatar
// when there is one. A done story's card names its recorded developer this
// way, with no avatar.
export function HumanName({
  name,
  avatar,
}: {
  name: string;
  avatar?: ReactNode;
}) {
  return (
    <span className="owner-human-name">
      {avatar}
      {name}
    </span>
  );
}

// The credited human as a card's scan view names it, for example
// "Terry Yin" with their avatar (a name without one stands alone, since
// initials would only repeat it), or the short warning that it is unknown;
// why it is unknown is in the story's detail (`HumanCredit`). Nothing while
// reading.
export function HumanCreditBrief({
  developer,
}: {
  developer: AgentAssignment;
}) {
  const { human } = developer;
  switch (human.status) {
    case "loading":
      return null;
    case "credited":
      return (
        <HumanName
          name={human.name}
          avatar={
            <HumanAvatar
              key={human.avatar ?? ""}
              name={human.name}
              avatar={human.avatar}
              withInitials={false}
            />
          }
        />
      );
    case "no-addition":
    case "unnamed":
    case "unavailable":
      return (
        <span className="owner-human-gap assignment-gap">
          Human developer unknown
        </span>
      );
  }
}
