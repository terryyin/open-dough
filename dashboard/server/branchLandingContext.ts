// The explicit handoff gives the installed publisher a context for this launch.
import { randomUUID } from "node:crypto";
import type { LandingReporting } from "../src/launchLanding.ts";
import type { LaunchRecord } from "../src/launchRecord.ts";
import type { SessionBranchEntry } from "../src/sessionBranchResult.ts";
import {
  copyReportingFiles,
  writeLandingContext,
} from "./launchReportingFiles.ts";

function sameBranchEntry(
  current: SessionBranchEntry | undefined,
  answered: SessionBranchEntry | undefined,
): boolean {
  return (
    current !== undefined &&
    answered !== undefined &&
    current.repository === answered.repository &&
    current.workspace === answered.workspace &&
    current.branch === answered.branch &&
    current.committedTip === answered.committedTip &&
    current.trunk?.remote === answered.trunk?.remote &&
    current.trunk?.target === answered.trunk?.target &&
    current.trunk?.revision === answered.trunk?.revision
  );
}

// Keep only the prepared context on the same open launch and branch entry.
export function acceptBranchLandingAnswer(
  current: LaunchRecord,
  answered: LaunchRecord,
): LaunchRecord {
  if (
    current.launchedAt !== answered.launchedAt ||
    current.doneAt !== undefined ||
    current.landingReporting !== undefined ||
    answered.landingReporting === undefined ||
    !sameBranchEntry(current.branchEntry, answered.branchEntry)
  )
    return current;
  return { ...current, landingReporting: answered.landingReporting };
}

// Answers the next record and context file for `directory`, or undefined when
// this record already reports, is done, or has no installed landing module.
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
): Promise<
  | {
      record: LaunchRecord & { landingReporting: LandingReporting };
      file: string;
    }
  | undefined
> {
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
  if (files?.landingModule === undefined) return undefined;
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
