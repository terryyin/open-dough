// A Backlog card's launches, one per workflow in the order `launchWorkflows`
// offers them. Each shows Started once the launch records still awaiting
// publication hold one of that workflow for the entry, otherwise the
// workflow's action.

import { useState } from "react";
import type { WorkEntry } from "./publishedWork.ts";
import {
  launchWorkflowNames,
  launchWorkflows,
  latestRecordOf,
  type LaunchWorkflow,
} from "./agentLaunch.ts";
import type { ProjectLaunches } from "./agentLaunches.ts";
import { StartLaunch } from "./StartLaunch.tsx";
import { LaunchStarted } from "./LaunchStarted.tsx";

function CardLaunch({
  entry,
  workflow,
  launches,
}: {
  entry: WorkEntry;
  workflow: LaunchWorkflow;
  launches: ProjectLaunches;
}) {
  const [startedHere, setStartedHere] = useState(false);
  const record = latestRecordOf(launches.records, entry.identity, workflow);
  if (record !== undefined) {
    return <LaunchStarted record={record} takesFocus={startedHere} />;
  }
  return (
    <StartLaunch
      work={entry}
      workflow={workflow}
      note={launchWorkflows[workflow].note(entry)}
      attempt={launches.attemptOf(entry.identity, workflow)}
      onStart={(instruction) => {
        setStartedHere(true);
        return launches.start(entry, workflow, instruction);
      }}
    />
  );
}

export function CardLaunches({
  entry,
  launches,
}: {
  entry: WorkEntry;
  launches: ProjectLaunches;
}) {
  return launchWorkflowNames.map((workflow) => (
    <CardLaunch
      key={workflow}
      entry={entry}
      workflow={workflow}
      launches={launches}
    />
  ));
}
