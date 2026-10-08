// Explicit reports use an accepted launch's identity, never the newest story session.
import { copyFile, mkdir, access } from "node:fs/promises";
import path from "node:path";
import type { IncomingMessage } from "node:http";
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
  return {
    origin: attempt.reportingOrigin,
    reference: attempt.id,
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
