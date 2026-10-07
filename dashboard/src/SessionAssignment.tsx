// A kept session's original allocation, read at its saved publication revision.
// Current story assignments and later uses of the same rotating name never
// supply its credit. Known local launch facts survive an unreadable history.

import { useEffect, useState } from "react";
import { assignedAgent, type LaunchRecord } from "./launchRecord.ts";
import { useProjects } from "./projectList.tsx";
import {
  profilesUnread,
  readAssignments,
  type AgentAssignment,
} from "./agentAssignments.ts";
import { readAttributedAssignments } from "./assignmentAttribution.ts";
import { profileAdditionsAt } from "./authenticatedProfileRead.ts";
import { ObservationOutcomes } from "./observationOutcomes.ts";
import { withinReadWait } from "./readWaitBound.ts";
import { HumanCreditBrief } from "./HumanCredit.tsx";
import { RecordedFacts } from "./AssignmentRecords.tsx";
import { AgentPortrait } from "./AgentPortrait.tsx";
import { agentNameOf } from "../../src/skills/dough-product-backlog/scripts/product-backlog-agent-profile.mjs";

export function SessionAssignment({
  record,
  cardAssignments,
}: {
  readonly record: LaunchRecord;
  readonly cardAssignments?: readonly AgentAssignment[] | undefined;
}) {
  const established = record.start ?? record.preparation;
  const agent = assignedAgent(established);
  const revision =
    established !== undefined && "publishedSha" in established
      ? established.publishedSha
      : undefined;
  const identity = established?.identity;
  const source = useProjects().find(
    (project) => project.id === record.request.source,
  );
  const [assignment, setAssignment] = useState<AgentAssignment | undefined>();
  const [reading, setReading] = useState(false);

  useEffect(() => {
    setAssignment(undefined);
    if (agent === undefined || revision === undefined || source === undefined) {
      setReading(false);
      return;
    }
    const controller = new AbortController();
    setReading(true);
    void withinReadWait(controller.signal, async (untilEither, bound) => {
      // Session credit is not the page observation; a local owner only
      // satisfies the shared addition/assignment settle boundary.
      const outcomes = new ObservationOutcomes();
      const profiles = await readAssignments(
        source,
        revision,
        untilEither,
        outcomes,
        bound,
      );
      if (profilesUnread(profiles)) return undefined;
      const own = profiles.assignments.filter(
        (each) => each.agent === agent && each.identity === identity,
      );
      if (own.length !== 1) return undefined;
      const attributed = await readAttributedAssignments(
        source,
        revision,
        { ...profiles, assignments: own },
        profileAdditionsAt(source, revision, untilEither, outcomes, bound),
        untilEither,
        bound,
      );
      return profilesUnread(attributed) ? undefined : attributed.assignments[0];
    }).then(
      (found) => {
        if (!controller.signal.aborted) {
          setAssignment(found);
          setReading(false);
        }
      },
      () => {
        if (!controller.signal.aborted) setReading(false);
      },
    );
    return () => {
      controller.abort();
    };
  }, [source, revision, agent, identity]);

  if (agent === undefined) return null;
  const human = assignment?.human;
  // Only a known original allocation can establish that the header already
  // carries this session's credit. Unknown history and reused names stay visible.
  if (
    !reading &&
    human?.status === "credited" &&
    cardAssignments?.some(
      (current) =>
        current.agent === agent &&
        current.host === record.session.host &&
        current.model === (record.request.model ?? assignment?.model) &&
        current.human.status === "credited" &&
        current.human.name === human.name &&
        current.human.allocation === human.allocation,
    )
  ) {
    return null;
  }
  const developer: AgentAssignment = {
    profilePath: assignment?.profilePath ?? "",
    name: assignment?.name ?? agentNameOf(agent) ?? "",
    agent,
    host: record.session.host,
    model:
      record.request.model !== undefined
        ? `${record.request.model} (requested)`
        : assignment?.model === undefined
          ? undefined
          : `${assignment.model} (recorded at assignment)`,
    human: assignment?.human ?? { status: "no-addition" },
  };
  return (
    <p className="session-assignment">
      Session assignment:{" "}
      <span className="owner-agent">
        <AgentPortrait name={developer.name} />
        {agent}
      </span>
      {" · "}
      {reading ? (
        "Reading human developer…"
      ) : (
        <HumanCreditBrief developer={developer} />
      )}
      {" · "}
      <RecordedFacts developer={developer} withMode={false} />
    </p>
  );
}
