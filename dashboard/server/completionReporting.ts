// Explicit reports use an accepted launch's identity, never the newest story session.
import { copyFile, mkdir, access, writeFile } from "node:fs/promises";
import path from "node:path";
import type { IncomingMessage } from "node:http";
import {
  isEstablishedOneShot,
  type EstablishedContext,
} from "../src/launchRecord.ts";
import { defaultGitOutputLimit, runGit } from "./gitRunner.ts";
import { replaceAttempts } from "./launchAttemptStore.ts";
import type { LaunchAttemptRecord } from "../src/agentLaunch.ts";
import type { ReportingContext } from "../src/launchRequest.ts";
import { installedSkillPath } from "./launchHosts.ts";
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
// Prepare a standalone installed script outside the launch workspace, which may retire.
// This is an executable copy; the existing attempts/records remain the only evidence stores.
export async function reportingContext(
  attempt: LaunchAttemptRecord,
  folder: ProjectFolder,
  established?: EstablishedContext,
): Promise<ReportingContext | undefined> {
  if (
    attempt.reportingOrigin === undefined ||
    (attempt.request.workflow === "ad-hoc" &&
      !attempt.request.instruction?.trim())
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
  if (capturesLanding)
    await copyFile(
      landingModule,
      path.join(directory, "dashboard-landing.mjs"),
    );
  if (
    capturesLanding &&
    established !== undefined &&
    isEstablishedOneShot(established)
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
    const authority = {
      repository,
      workspace: established.workspace,
      branch: established.branch,
      identity: established.identity,
      remote: established.remote,
      target: `refs/heads/${established.target}`,
    };
    await replaceAttempts((kept) => ({
      ...kept,
      [attempt.request.source]: (kept[attempt.request.source] ?? []).map(
        (entry) =>
          entry.id === attempt.id
            ? {
                ...entry,
                landingRepository: entry.landingRepository ?? authority,
              }
            : entry,
      ),
    }));
    landingContext = path.join(directory, "landing-context.json");
    await writeFile(
      landingContext,
      `${JSON.stringify({ origin: attempt.reportingOrigin, source: attempt.request.source, host: attempt.request.host, reference: attempt.id, identity: authority.identity, remote: authority.remote, target: authority.target }, null, 2)}\n`,
      { mode: 0o600 },
    );
  }
  return {
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
