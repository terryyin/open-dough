// The explicit handoff gives the installed publisher a context for this launch.
import { randomUUID } from "node:crypto";
import type { LaunchRecord } from "../src/launchRecord.ts";
import { machineDashboardPath } from "./machineHome.ts";
import { changeSessionRecord } from "./launchRecordStore.ts";
import {
  acceptsStoryless,
  copyReportingFiles,
  writeLandingContext,
} from "./launchReportingFiles.ts";

export async function branchLandingContext(
  source: string,
  original: LaunchRecord,
  origin: string,
): Promise<string | undefined> {
  const saved = await changeSessionRecord(
    source,
    original.session,
    async (record) => {
      if (
        record.launchedAt !== original.launchedAt ||
        record.landingReporting !== undefined
      )
        return record;
      const entry = record.branchEntry;
      if (entry?.trunk === undefined || record.doneAt !== undefined)
        return record;
      const authority = {
        repository: entry.repository,
        workspace: entry.workspace,
        branch: entry.branch,
        remote: entry.trunk.remote,
        target: entry.trunk.target,
      };
      const reference = record.request.reporting?.reference ?? randomUUID();
      const host = record.session.host;
      const files = await copyReportingFiles(
        host,
        { path: entry.workspace, shown: entry.workspace },
        machineDashboardPath("reporting", reference, "branch-landing"),
      ).catch(() => undefined);
      if (
        files?.landingModule === undefined ||
        !(await acceptsStoryless(files.landingModule))
      )
        return record;
      const file = await writeLandingContext(
        files.directory,
        { origin, source, host, reference },
        authority,
      );
      return {
        ...record,
        landingReporting: {
          origin,
          authority,
          preparations: [],
          branchContext: { reference, file },
        },
      };
    },
  );
  return saved?.launchedAt === original.launchedAt
    ? saved.landingReporting?.branchContext?.file
    : undefined;
}
