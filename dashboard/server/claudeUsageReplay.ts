// A forked worker's transcript replays its parent's rows with their native
// identities, so one response can be read from several workers' transcripts.
// It is the response of the one reading agent whose transcript every
// reading's climb passes through: the transcript it was first recorded in.
import { reconcileObservation } from "./usageReconciliation.ts";
import type { UsageObservation } from "./usageRecords.ts";

export type ClaudeReading = {
  agent: string;
  transcripts: string[];
  unresolved: boolean;
};

function replayOwner(readings: ClaudeReading[]): string | undefined {
  const agents = new Set(readings.map((reading) => reading.agent));
  if (agents.size < 2 || readings.some((reading) => reading.unresolved))
    return undefined;
  const owners = [...agents].filter((agent) =>
    readings.every((reading) => reading.transcripts.includes(agent)),
  );
  return owners.length === 1 ? owners[0] : undefined;
}

type Lineage = {
  agentId?: string | undefined;
  parentSessionId?: string | undefined;
};

function restated<Item extends Lineage>(
  item: Item,
  owner: string,
  sessionId: string,
): Item {
  const copy = { ...item };
  delete copy.agentId;
  delete copy.parentSessionId;
  return owner ? { ...copy, agentId: owner, parentSessionId: sessionId } : copy;
}

// The observation with its replayed readings restated as its owner's, its
// lineage reconciled again; unchanged when no single owner explains them.
export function ownReplayedReadings(
  observation: UsageObservation,
  readings: ClaudeReading[],
): UsageObservation {
  const owner = replayOwner(readings);
  if (owner === undefined) return observation;
  const { sessionId } = observation;
  return reconcileObservation(undefined, {
    ...restated(observation, owner, sessionId),
    measurements: observation.measurements.map((measurement) =>
      restated(measurement, owner, sessionId),
    ),
    gaps: observation.gaps.filter((gap) => gap !== "contradictory-lineage"),
  });
}
