// Explicit reports use an accepted launch's identity, never the newest story session.
import type { IncomingMessage } from "node:http";
import type { EstablishedContext } from "../src/launchRecord.ts";
import type { EstablishedSession } from "../src/unattachedSession.ts";
import { defaultGitOutputLimit } from "./gitRunner.ts";
import { commonGitDirectory } from "./gitCommonDirectory.ts";
import { type LaunchAttemptRecord } from "../src/agentLaunch.ts";
import type { ReportingContext } from "../src/launchRequest.ts";
import type {
  AdmittedClaimCheckout,
  LandingRepository,
} from "../src/launchLanding.ts";
import { landingStoryOfAttempt } from "./launchLandingRecord.ts";
import { installedExports } from "./startLaunch.ts";
import type { LocalFolder } from "./localFolder.ts";
import { deliverCompletion } from "./completionDelivery.ts";
import type { ReportedDone } from "./doneMarks.ts";
import { jsonBody } from "./jsonRequestBody.ts";
import { admitCompletionRequest } from "./completionAdmission.ts";
import { verifyLoopbackSocket } from "./localOrigin.ts";
import { shellCommand } from "../src/sessionCapabilities.ts";
import { machineDashboardPath } from "./machineHome.ts";
import { preparesReporting } from "./launchWorkspaceReporting.ts";
import {
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
  folder: LocalFolder,
  established?: EstablishedContext | EstablishedSession,
  admission?: AdmittedClaimCheckout,
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
  // The established workspace names its trunk target. The accepted attempt
  // supplies the story, including an admitted or follow-up ad hoc launch.
  const identity = landingStoryOfAttempt(attempt);
  if (landingModule !== undefined && established !== undefined) {
    const repository = await commonGitDirectory({
      cwd: established.workspace,
      maxBuffer: defaultGitOutputLimit,
    });
    landingRepository = {
      repository,
      workspace: established.workspace,
      branch: established.branch,
      ...(identity === undefined ? {} : { identity }),
      ...(admission === undefined ? {} : { admission }),
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
  doneMarks: ReportedDone,
) {
  verifyLoopbackSocket(req);
  const report = await admitCompletionRequest({
    method: req.method,
    origin: req.headers.origin,
    host: req.headers.host,
    fetchSite: req.headers["sec-fetch-site"],
    body: () => jsonBody(req, undefined, 128 * 1024),
  });
  return deliverCompletion(report, `http://${req.headers.host}`, doneMarks);
}
