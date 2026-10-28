// Explicit reports use an accepted launch's identity, never the newest story session.
import { copyFile, mkdir, access, writeFile } from "node:fs/promises";
import path from "node:path";
import type { IncomingMessage } from "node:http";
import type { EstablishedContext } from "../src/launchRecord.ts";
import type { EstablishedSession } from "../src/unattachedSession.ts";
import { defaultGitOutputLimit, runGit } from "./gitRunner.ts";
import {
  sendsFirstInput,
  type LaunchAttemptRecord,
} from "../src/agentLaunch.ts";
import type { ReportingContext } from "../src/launchRequest.ts";
import type { LandingRepository } from "../src/launchLanding.ts";
import { installedSkillPath } from "./launchHosts.ts";
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

export const completionEndpoint = "/__agent-launch/completion";
// What a launch's attempt keeps in one write: the context its instruction
// names and, when that names a landing context, the capture authority.
export type PreparedReporting = {
  readonly reporting: ReportingContext;
  readonly landingRepository?: LandingRepository;
};
// Whether the installed landing module takes a context that names no story,
// as an unattached session's does. One that requires an identity would refuse
// the context inside the publication, before its push, so such a session is
// named no landing context there.
async function acceptsStoryless(landingModule: string): Promise<boolean> {
  try {
    const installed = await installedExports<{
      acceptsLandingWithoutIdentity?: unknown;
    }>(landingModule);
    return installed.acceptsLandingWithoutIdentity === true;
  } catch {
    return false;
  }
}
// Prepare a standalone installed script outside the launch workspace, which may retire.
// This is an executable copy; the existing attempts/records remain the only evidence stores.
export async function reportingContext(
  attempt: LaunchAttemptRecord,
  folder: ProjectFolder,
  established?: EstablishedContext | EstablishedSession,
): Promise<PreparedReporting | undefined> {
  if (
    attempt.reportingOrigin === undefined ||
    (attempt.request.workflow === "ad-hoc" && !sendsFirstInput(attempt.request))
  )
    return undefined;
  const installed = installedSkillPath(
    attempt.request.host,
    folder,
    "dough-execute-plan",
    "scripts",
    "dashboard-completion.mjs",
  );
  try {
    await access(installed);
  } catch {
    return undefined;
  }
  const directory = machineDashboardPath("reporting", attempt.id);
  await mkdir(directory, { recursive: true });
  const script = path.join(directory, "dashboard-completion.mjs");
  await copyFile(
    path.join(path.dirname(installed), "ci-direct-entry.mjs"),
    path.join(directory, "ci-direct-entry.mjs"),
  );
  await copyFile(installed, script);
  let landingContext: string | undefined;
  let landingRepository: LandingRepository | undefined;
  const landingModule = path.join(
    path.dirname(installed),
    "dashboard-landing.mjs",
  );
  // Only absence of this optional installed module permits legacy fallback.
  let capturesLanding = false;
  try {
    await access(landingModule);
    capturesLanding = true;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
  }
  let expectationModule: string | undefined;
  if (capturesLanding) {
    await copyFile(
      landingModule,
      path.join(directory, "dashboard-landing.mjs"),
    );
    // Landing capture clears the open expectation through this sibling module.
    // Plant uses the same installed bytes so preparation and clear stay aligned.
    expectationModule = path.join(
      path.dirname(landingModule),
      "first-landing-expectation.mjs",
    );
    await copyFile(
      expectationModule,
      path.join(directory, "first-landing-expectation.mjs"),
    );
  }
  // Every established start, preparation or unattached session names its
  // trunk target; only a story's names an identity.
  const identity = establishedStory(established);
  if (
    capturesLanding &&
    expectationModule !== undefined &&
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
    landingContext = path.join(directory, "landing-context.json");
    await writeFile(
      landingContext,
      `${JSON.stringify({ origin: attempt.reportingOrigin, source: attempt.request.source, host: attempt.request.host, reference: attempt.id, identity, remote: landingRepository.remote, target: landingRepository.target }, null, 2)}\n`,
      { mode: 0o600 },
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
