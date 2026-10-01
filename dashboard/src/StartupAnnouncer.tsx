// Says politely, once each, how the startups of the shown project's stories
// move (`./storyStartup.ts`): under way on this machine, waiting for
// published story state, in need of reconciliation, or reconciled with
// published story state, which ends its protection. Only a change of what
// is said is spoken: a read that finds every startup where it was, or a new
// start phase, says nothing more, and nothing here moves the keyboard. The
// region stays rendered while it has nothing to say, so assistive technology
// knows it before it speaks. Switching projects says nothing of the project
// left.

import { useEffect, useRef, useState } from "react";
import { startName } from "./agentLaunch.ts";
import type { StoryStartup } from "./storyStartup.ts";

type Told = "in progress" | "waiting" | "needs reconciliation";

// What is told of one story's startup: its identity, how it stands, and
// what it is: the story's title and the start, such as "execution start".
type Telling = {
  readonly identity: string;
  readonly told: Told;
  readonly subject: string;
};

function tellingOf({ request, workflow, state }: StoryStartup): Telling {
  return {
    identity: request.identity,
    told:
      state === "reconciling"
        ? "waiting"
        : state === "needs-reconciliation"
          ? "needs reconciliation"
          : "in progress",
    subject: `${request.title}: ${startName(workflow)}`,
  };
}

function said({ told, subject }: Telling): string {
  switch (told) {
    case "in progress":
      return `${subject}, local startup in progress.`;
    case "waiting":
      return `${subject} settled on this machine; waiting for published story state.`;
    default:
      return `${subject} needs reconciliation under Startup recovery.`;
  }
}

export function StartupAnnouncer({
  sourceId,
  startups,
}: {
  readonly sourceId: string;
  readonly startups: readonly StoryStartup[];
}) {
  // What is told now, as one value that changes only when a telling does.
  const tellings = JSON.stringify(
    startups
      .map(tellingOf)
      .sort((one, other) => one.identity.localeCompare(other.identity)),
  );
  const told = useRef<{
    readonly sourceId: string;
    readonly tellings: ReadonlyMap<string, Telling>;
  }>({ sourceId, tellings: new Map() });
  const [announcement, setAnnouncement] = useState("");
  useEffect(() => {
    const now = new Map(
      (JSON.parse(tellings) as Telling[]).map((telling) => [
        telling.identity,
        telling,
      ]),
    );
    const before =
      told.current.sourceId === sourceId
        ? told.current.tellings
        : new Map<string, Telling>();
    told.current = { sourceId, tellings: now };
    const changes = [
      ...[...now.values()].flatMap((telling) =>
        before.get(telling.identity)?.told === telling.told
          ? []
          : [said(telling)],
      ),
      ...[...before.values()].flatMap(({ identity, subject }) =>
        now.has(identity)
          ? []
          : [`${subject} reconciled with published story state.`],
      ),
    ];
    if (changes.length > 0) setAnnouncement(changes.join(" "));
  }, [tellings, sourceId]);
  return (
    <p
      role="log"
      aria-label="Startup announcements"
      // Spoken and not shown; empty, it takes no room at all.
      className={
        announcement === "" ? "announcement" : "announcement spoken-only"
      }
    >
      {announcement}
    </p>
  );
}
