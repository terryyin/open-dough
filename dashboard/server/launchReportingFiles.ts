// The installed reporting files retained past the worktree's removal.
import { access, copyFile, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import type { LandingRepository } from "../src/launchLanding.ts";
import type { AgentLaunchRequest } from "../src/launchRequest.ts";
import type { LocalFolder } from "./localFolder.ts";
import {
  IncompleteReportingSupport,
  reportingSupport,
} from "./launchWorkspaceReporting.ts";

export async function copyReportingFiles(
  host: AgentLaunchRequest["host"],
  folder: LocalFolder,
  directory: string,
) {
  const support = await reportingSupport(host, folder);
  if (support.kind === "absent") return undefined;
  if (support.kind === "incomplete")
    throw new IncompleteReportingSupport(support.missing);
  const { files } = support;
  await mkdir(directory, { recursive: true });
  const copy = async (file: string) => {
    const destination = path.join(directory, path.basename(file));
    await copyFile(file, destination);
    return destination;
  };
  await copy(files.entry);
  const script = await copy(files.completion);
  const { landing: landingModule, expectation: expectationModule } = files;
  try {
    await access(landingModule);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT")
      return { directory, script };
    throw error;
  }
  await copy(landingModule);
  await copy(expectationModule);
  return { directory, script, landingModule, expectationModule };
}

export async function writeLandingContext(
  directory: string,
  context: {
    readonly origin: string;
    readonly source: string;
    readonly host: AgentLaunchRequest["host"];
    readonly reference: string;
  },
  { identity, remote, target, workspace, admission }: LandingRepository,
): Promise<string> {
  const landingContext = path.join(directory, "landing-context.json");
  await writeFile(
    landingContext,
    `${JSON.stringify({ ...context, identity, remote, target }, null, 2)}\n`,
    { mode: 0o600 },
  );
  if (admission !== undefined) {
    const claim = {
      ...context,
      identity,
      remote,
      target,
      nativeWorkspace: workspace,
      admission,
    };
    await writeFile(
      path.join(directory, "admitted-claim.json"),
      `${JSON.stringify(claim, null, 2)}\n`,
      { mode: 0o600 },
    );
  }
  return landingContext;
}
