// The explicit handoff gives the installed publisher a context for this launch.
import { randomUUID } from "node:crypto";
import type { LaunchRecord } from "../src/launchRecord.ts";
import {
  acceptsStoryless,
  copyReportingFiles,
  writeLandingContext,
} from "./launchReportingFiles.ts";

// The kept record after taking `answered` when the session still matches and
// does not already report; otherwise `current`.
export function acceptBranchLandingAnswer(
  current: LaunchRecord,
  answered: LaunchRecord,
): LaunchRecord {
  if (
    current.launchedAt !== answered.launchedAt ||
    current.landingReporting !== undefined
  )
    return current;
  return answered;
}

// Answers the next record and context file for `directory`, or undefined when
// this record already reports, is done, or cannot accept a storyless landing.
export async function branchLandingContext(
  directory: string,
  record: LaunchRecord,
  {
    origin,
    source,
    reference = record.request.reporting?.reference ?? randomUUID(),
  }: {
    readonly origin: string;
    readonly source: string;
    readonly reference?: string;
  },
): Promise<{ record: LaunchRecord; file: string } | undefined> {
  if (record.landingReporting !== undefined) return undefined;
  const entry = record.branchEntry;
  if (entry?.trunk === undefined || record.doneAt !== undefined)
    return undefined;
  const authority = {
    repository: entry.repository,
    workspace: entry.workspace,
    branch: entry.branch,
    remote: entry.trunk.remote,
    target: entry.trunk.target,
  };
  const host = record.session.host;
  const files = await copyReportingFiles(
    host,
    { path: entry.workspace, shown: entry.workspace },
    directory,
  ).catch(() => undefined);
  if (
    files?.landingModule === undefined ||
    !(await acceptsStoryless(files.landingModule))
  )
    return undefined;
  const file = await writeLandingContext(
    files.directory,
    { origin, source, host, reference },
    authority,
  );
  return {
    record: {
      ...record,
      landingReporting: {
        origin,
        authority,
        preparations: [],
        branchContext: { reference, file },
      },
    },
    file,
  };
}
