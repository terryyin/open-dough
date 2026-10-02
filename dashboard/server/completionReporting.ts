// Explicit reports use an accepted launch's identity, never the newest story session.
import { copyFile, mkdir, access } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { homedir } from "node:os";
import path from "node:path";
import type { IncomingMessage } from "node:http";
import { z } from "zod";
import type { LaunchAttemptRecord } from "../src/agentLaunch.ts";
import type { ReportingContext } from "../src/launchRequest.ts";
import {
  completedWithoutAttention,
  completionSchema,
} from "../src/completionReport.ts";
import { sessionHostSchema } from "../src/sessionReference.ts";
import { installedSkillPath } from "./launchHosts.ts";
import type { ProjectFolder } from "./projectFolders.ts";
import { keptAttempts, replaceAttempts } from "./launchAttemptStore.ts";
import { keptRecords } from "./launchRecordStore.ts";
import { replaceRecords } from "./launchRecordDocument.ts";
import { jsonBody } from "./jsonRequestBody.ts";
import { RefusedRequest, verifyLocalOrigin } from "./localOrigin.ts";
import { knownSource } from "./sessionAdmission.ts";
import { shellCommand } from "../src/sessionCapabilities.ts";

export const completionEndpoint = "/__agent-launch/completion";
const submissionSchema = z
  .strictObject({
    source: z.string().min(1),
    host: sessionHostSchema,
    reference: completionSchema.shape.reference,
    session: z.string().min(1).optional(),
    outcome: completionSchema.shape.outcome,
    message: completionSchema.shape.message,
  })
  .refine(
    (report) =>
      completedWithoutAttention(report) || report.message.trim().length > 0,
  );

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
  const directory = path.join(
    homedir(),
    ".open-dough",
    "dashboard",
    "reporting",
    attempt.id,
  );
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

export async function submitCompletion(req: IncomingMessage) {
  verifyLocalOrigin(req);
  if (req.method !== "POST")
    throw new RefusedRequest(405, "Only POST is accepted here.");
  const parsed = submissionSchema.safeParse(await jsonBody(req, 128 * 1024));
  if (!parsed.success)
    throw new RefusedRequest(400, "The completion request is malformed.");
  const report = parsed.data;
  knownSource(report.source);
  const attempts = await keptAttempts();
  const attempt = attempts?.find(
    (entry) =>
      entry.id === report.reference &&
      entry.request.source === report.source &&
      entry.request.host === report.host,
  );
  if (
    attempt === undefined ||
    attempt.reporting === undefined ||
    attempt.reportingOrigin !== `http://${req.headers.host}`
  )
    throw new RefusedRequest(
      404,
      "This dashboard accepted no such reporting launch.",
    );
  const record = (await keptRecords(report.source)).find(
    (entry) =>
      entry.request.reporting?.reference === report.reference &&
      entry.session.host === report.host,
  );
  if (
    report.session !== undefined &&
    report.session !== record?.session.sessionId
  )
    throw new RefusedRequest(
      409,
      "The report does not name this launch's recorded session.",
    );
  if (record === undefined && attempt.outcome !== undefined)
    throw new RefusedRequest(
      409,
      "This launch has no retained reporting session.",
    );
  const completion = {
    receipt: randomUUID(),
    reference: report.reference,
    outcome: report.outcome,
    message: report.message,
    receivedAt: new Date().toISOString(),
  };
  // The attempt is the write-ahead owner while Claude has not printed a native identity.
  // A pending receipt deliberately names no session; its eventual binding owns local Done.
  // Reporting never renames/stops native sessions or disposes an attachment.
  try {
    await replaceAttempts((kept) => ({
      ...kept,
      [report.source]: (kept[report.source] ?? []).map((entry) =>
        entry.id === report.reference ? { ...entry, completion } : entry,
      ),
    }));
    if (record !== undefined) {
      const write = { stored: false };
      await replaceRecords((kept) => ({
        ...kept,
        [report.source]: (kept[report.source] ?? []).map((entry) => {
          if (
            !("session" in entry) ||
            entry.request.reporting?.reference !== report.reference ||
            entry.session.host !== report.host
          )
            return entry;
          write.stored = true;
          return {
            ...entry,
            completion,
            ...(completedWithoutAttention(completion)
              ? { doneAt: completion.receivedAt }
              : {}),
          };
        }),
      }));
      if (!write.stored) throw new Error("The reporting session was deleted.");
    }
  } catch {
    throw new RefusedRequest(
      500,
      "Completion delivery was not acknowledged. Keep the message and retry without repeating the work.",
    );
  }
  return {
    ...completion,
    state: record === undefined ? "pending-native-session" : "recorded",
    ...(record === undefined
      ? {}
      : {
          session: {
            host: record.session.host,
            sessionId: record.session.sessionId,
          },
        }),
  };
}
