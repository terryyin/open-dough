// Installed workflow capabilities and kept starts in catalog order. These are
// common project facts; native session observations live in launchStates.
import path from "node:path";
import { launchHosts } from "../src/sessionCapabilities.ts";
import {
  launchWorkflowNames,
  launchWorkflows,
  type KeptStart,
  type OfferedDefinition,
  type LaunchWorkflow,
} from "../src/agentLaunch.ts";
import { catalog } from "../src/publishedSource.ts";
import { offeredShape } from "../src/commandOptions.ts";
import { shownWorkspace } from "./launchWorkspace.ts";
import { readDefinition } from "./launchOptions.ts";
import { projectFolder } from "./projectFolders.ts";
import { keptStartsByProject } from "./startStore.ts";
import { startOf } from "./startWorkflows.ts";
import type { StartProgress } from "./startProgress.ts";

// The catalog projects whose installed skill establishes a workflow's start,
// by id, in catalog order.
export async function establishing(
  workflow: LaunchWorkflow,
): Promise<readonly string[]> {
  const ids = await Promise.all(
    catalog.map(async (source) =>
      (await startOf(workflow)?.establishes(projectFolder(source)))
        ? source.id
        : undefined,
    ),
  );
  return ids.filter((id) => id !== undefined);
}

// The options each catalog project's installed skill offers, for each
// workflow that defines options, in catalog order: read at each call, so a
// changed definition shows at once. A project without a usable definition
// says why for that workflow.
export async function offeredDefinitions(): Promise<
  readonly OfferedDefinition[]
> {
  const read = await Promise.all(
    catalog.flatMap((source) =>
      launchHosts.flatMap((host) =>
        launchWorkflowNames.map(async (workflow) => {
          const { skill, options: file } = launchWorkflows[workflow];
          if (file === undefined) return [];
          const answer = await readDefinition(
            projectFolder(source),
            skill,
            file,
            host,
          );
          return [
            answer.kind === "defined"
              ? {
                  source: source.id,
                  workflow,
                  host,
                  ...offeredShape(answer.definition),
                }
              : { source: source.id, workflow, host, unavailable: answer.why },
          ];
        }),
      ),
    ),
  );
  return read.flat();
}

// The starts kept without a session, in catalog order: each names the
// workspace as the page shows a project's folders and the Agent its claim
// named, when the start reported one.
export async function keptStarts(
  progress: StartProgress,
): Promise<readonly KeptStart[]> {
  const kept = {
    execution: await keptStartsByProject("execution"),
    refinement: await keptStartsByProject("refinement"),
  };
  return catalog.flatMap((source) =>
    (["execution", "refinement"] as const).flatMap((workflow) =>
      (kept[workflow].get(source.id) ?? [])
        .filter(
          (start) => !progress.for(workflow).running(source.id, start.identity),
        )
        .map((start) => ({
          workflow,
          source: source.id,
          identity: start.identity,
          workspace: shownWorkspace(
            projectFolder(source),
            path.basename(start.workspace),
          ),
          ...(start.start?.agent === undefined
            ? {}
            : { agent: start.start.agent }),
        })),
    ),
  );
}

export async function establishingHosts() {
  const rows = await Promise.all(
    catalog.flatMap((source) =>
      launchHosts.flatMap((host) =>
        launchWorkflowNames.map(async (workflow) =>
          (await startOf(workflow)?.establishes(projectFolder(source), host))
            ? { source: source.id, workflow, host }
            : undefined,
        ),
      ),
    ),
  );
  return rows.filter((row) => row !== undefined);
}
