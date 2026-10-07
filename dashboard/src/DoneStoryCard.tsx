// One done story in Recently done, from its published done record
// (`./doneStories.ts`): its title and identity, when it was done, and, as a
// Taken card's scan line names its developer, the agent with its portrait,
// the recorded developer's name, and the agent's host beside its mark, for
// example "Yui-chan · Terry Yin · Claude Code". A record naming no agent shows
// none. Until its record is read, the card holds its place in the list under
// the identity and completion time the done catalog names, saying the record
// is being read, or why it was not. It is a story fact, published for every
// machine. Inside it, read or not, are the
// marked-done sessions this machine keeps for the story, newest
// first, each the entry Recently done shows (`./SessionEntry.tsx`); a machine
// that keeps none shows none. The card holds the keyboard when the last of
// them is deleted (`deletedEntryHome`).

import { useId } from "react";
import type { LaunchWithState } from "./agentLaunch.ts";
import { agentNameOf } from "../../src/skills/dough-product-backlog/scripts/product-backlog-agent-profile.mjs";
import { AgentPortrait } from "./AgentPortrait.tsx";
import { RecordedHost } from "./AssignmentRecords.tsx";
import type { DoneStory } from "./doneStories.ts";
import { HumanName } from "./HumanCredit.tsx";
import { Moment } from "./Moment.tsx";
import { doneStoryMarks } from "./pageSessions.ts";
import { StorySessions } from "./SessionEntry.tsx";
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

export function DoneStoryCard({
  identity,
  completedAt,
  story,
  said,
  sessions,
}: {
  // The story and when it was done, as its done catalog names it.
  readonly identity: string;
  readonly completedAt: string;
  // What its record says, once read.
  readonly story: DoneStory | undefined;
  // Why the record's facts are not shown yet, until they are.
  readonly said: { readonly words: string; readonly gap: boolean } | undefined;
  // This machine's sessions for the story, oldest first.
  readonly sessions: readonly LaunchWithState[];
}) {
  const heading = useId();
  const { developer, agent, host } = story ?? {};
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
    <article
      className="done-story"
      aria-labelledby={heading}
      aria-busy={said !== undefined && !said.gap}
      {...doneStoryMarks(identity)}
    >
      <h3 id={heading}>{story?.title ?? identity}</h3>
      {story !== undefined && <p className="card-identity">{identity}</p>}
      <p>
        Done <Moment at={new Date(completedAt)} />
      </p>
      {said !== undefined && (
        <p className={said.gap ? "assignment-gap" : "quiet"}>{said.words}</p>
      )}
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
      <StorySessions
        sessions={sessions}
        className="done-story-sessions"
        onCard={false}
      />
    </article>
  );
}
