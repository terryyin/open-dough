// One done story in Recently done, from its published done record
// (`./doneStories.ts`): its title and identity, when it was done, and, as a
// Taken card's scan line names its developer, the agent with its portrait,
// the recorded developer's name, and the agent's host beside its mark, for
// example "Yui-chan · Terry Yin · Claude Code". A record naming no agent shows
// none. It is a story fact, published for every machine.

import { useId } from "react";
import { agentNameOf } from "../../src/skills/dough-product-backlog/scripts/product-backlog-agent-profile.mjs";
import { AgentPortrait } from "./AgentPortrait.tsx";
import { RecordedHost } from "./AssignmentRecords.tsx";
import type { DoneStory } from "./doneStories.ts";
import { HumanName } from "./HumanCredit.tsx";
import { Moment } from "./Moment.tsx";
import "./agent-assignment.css";
import "./agent-launch.css";

function DoneAgent({ agent }: { agent: string }) {
  const name = agentNameOf(agent);
  return (
    <span className="owner-fact owner-agent">
      {name !== undefined && <AgentPortrait name={name} />}
      {agent}
    </span>
  );
}

export function DoneStoryCard({ story }: { readonly story: DoneStory }) {
  const heading = useId();
  const { title, identity, completedAt, developer, agent, host } = story;
  const facts = [
    ...(agent === undefined
      ? []
      : [{ key: "agent", fact: <DoneAgent agent={agent} /> }]),
    ...(developer === undefined
      ? []
      : [{ key: "developer", fact: <HumanName name={developer} /> }]),
    ...(agent === undefined || host === undefined
      ? []
      : [{ key: "host", fact: <RecordedHost host={host} /> }]),
  ];
  return (
    <article className="done-story" aria-labelledby={heading}>
      <h3 id={heading}>{title}</h3>
      <p className="card-identity">{identity}</p>
      <p>
        Done <Moment at={new Date(completedAt)} />
      </p>
      {facts.length > 0 && (
        <p className="card-owner">
          <span className="owner-line">
            {facts.map(({ key, fact }, index) => (
              <span key={key}>
                {index > 0 && " · "}
                {fact}
              </span>
            ))}
          </span>
        </p>
      )}
    </article>
  );
}
