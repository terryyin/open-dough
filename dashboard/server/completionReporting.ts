// Explicit reports use an accepted launch's identity, never the newest story session.
import type { IncomingMessage } from "node:http";
import type { EstablishedContext } from "../src/launchRecord.ts";
import type { EstablishedSession } from "../src/unattachedSession.ts";
import { defaultGitOutputLimit, runGit } from "./gitRunner.ts";
import { type LaunchAttemptRecord } from "../src/agentLaunch.ts";
import type { ReportingContext } from "../src/launchRequest.ts";
import type { LandingRepository } from "../src/launchLanding.ts";
import { establishedStory } from "./launchRecord.ts";
import { installedExports } from "./startLaunch.ts";
import type { ProjectFolder } from "./projectFolders.ts";
import { deliverCompletion } from "./completionDelivery.ts";
import type { NativeDoneMarks } from "./doneMarks.ts";
import { submissionSchema } from "./completionAdmission.ts";
import { jsonBody } from "./jsonRequestBody.ts";
import { RefusedRequest, verifyLocalOrigin } from "./localOrigin.ts";
import { knownSource } from "./sessionAdmission.ts";
import { shellCommand } from "../src/sessionCapabilities.ts";
import { machineDashboardPath } from "./machineHome.ts";
import { preparesReporting } from "./launchWorkspaceReporting.ts";
import {
  acceptsStoryless,
  copyReportingFiles,
  writeLandingContext,
} from "./launchReportingFiles.ts";
export { IncompleteReportingSupport } from "./launchWorkspaceReporting.ts";

export const completionEndpoint = "/__agent-launch/completion";
// What a launch's attempt keeps in one write: the context its instruction
// names and, when that names a landing context, the capture authority.
export type PreparedReporting = {
  readonly reporting: ReportingContext;
  readonly landingRepository?: LandingRepository;
};
// Prepare a standalone installed script outside the launch workspace, which may retire.
// This is an executable copy; the existing attempts/records remain the only evidence stores.
export async function reportingContext(
  attempt: LaunchAttemptRecord,
  folder: ProjectFolder,
  established?: EstablishedContext | EstablishedSession,
  sessionTitle?: string,
): Promise<PreparedReporting | undefined> {
  if (!preparesReporting(attempt)) return undefined;
  const files = await copyReportingFiles(
    attempt.request.host,
    folder,
    machineDashboardPath("reporting", attempt.id),
  );
  if (files === undefined) return undefined;
  const { directory, script, landingModule, expectationModule } = files;
  let landingContext: string | undefined;
  let landingRepository: LandingRepository | undefined;
  // Every established start, preparation or unattached session names its
  // trunk target; only a story's names an identity.
  const identity = establishedStory(established);
  if (
    landingModule !== undefined &&
    established !== undefined &&
    (identity !== undefined || (await acceptsStoryless(landingModule)))
  ) {
    const repository = (
      await runGit(
        ["rev-parse", "--path-format=absolute", "--git-common-dir"],
        {
          cwd: established.workspace,
          maxBuffer: defaultGitOutputLimit,
        },
      )
    ).stdout.trim();
    landingRepository = {
      repository,
      workspace: established.workspace,
      branch: established.branch,
      ...(identity === undefined ? {} : { identity }),
      remote: established.remote,
      target: `refs/heads/${established.target}`,
    };
    landingContext = await writeLandingContext(
      directory,
      {
        origin: attempt.reportingOrigin,
        source: attempt.request.source,
        host: attempt.request.host,
        reference: attempt.id,
      },
      landingRepository,
      sessionTitle,
    );
    // Durable pointer outside the working tree so first trunk publication can
    // resolve this prepared context when the agent omits --landing-context.
    const { plantFirstLandingExpectation } = await installedExports<{
      plantFirstLandingExpectation: (args: {
        repository: string;
        workspace: string;
        branch: string;
        landingContext: string;
      }) => Promise<string>;
    }>(expectationModule);
    await plantFirstLandingExpectation({
      repository,
      workspace: established.workspace,
      branch: established.branch,
      landingContext,
    });
  }
  return {
    ...(landingRepository === undefined ? {} : { landingRepository }),
    reporting: {
      origin: attempt.reportingOrigin,
      reference: attempt.id,
      ...(landingContext === undefined ? {} : { landingContext }),
      command: shellCommand([
        "node",
        script,
        "--origin",
        attempt.reportingOrigin,
        "--source",
        attempt.request.source,
        "--host",
        attempt.request.host,
        "--reference",
        attempt.id,
      ]),
    },
  };
}

export async function submitCompletion(
  req: IncomingMessage,
  doneMarks: NativeDoneMarks,
) {
  verifyLocalOrigin(req);
  if (req.method !== "POST")
    throw new RefusedRequest(405, "Only POST is accepted here.");
  const parsed = submissionSchema.safeParse(
    await jsonBody(req, undefined, 128 * 1024),
  );
  if (!parsed.success)
    throw new RefusedRequest(400, "The completion request is malformed.");
  const report = parsed.data;
  knownSource(report.source);
  return deliverCompletion(report, `http://${req.headers.host}`, doneMarks);
}
