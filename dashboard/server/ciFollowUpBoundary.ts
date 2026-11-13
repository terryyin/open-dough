// Retained evidence only: browsing never acquires CI.
import type { IncomingMessage } from "node:http";
import { configuredProject } from "./projectConfiguration.ts";
import { readFollowUps } from "./ciFollowUpStore.ts";
import { historyWallTimeMs } from "../src/landedCiHistory.ts";
import { RefusedRequest } from "./localOrigin.ts";
import { completedFollowUps } from "./completedCiFollowUps.ts";
import { retainedFollowUpOf } from "./ciFollowUpReading.ts";

async function followUpAnswer(project: string, signal: AbortSignal) {
  const source = configuredProject(project);
  if (source === undefined)
    throw new RefusedRequest(404, "The project is not configured.");
  const read = await readFollowUps();
  if (read.kind !== "document")
    throw new RefusedRequest(
      503,
      "Automatic CI follow-up is blocked: allowance evidence is unreadable. The original bytes are preserved.",
    );
  const completed = await completedFollowUps(source, read.document, signal);
  return {
    cards: completed.flatMap((landing) => {
      const request = landing.request;
      const evidence = request ?? landing.assessment;
      const originalMs = historyWallTimeMs(
        evidence?.original.startedAt,
        evidence?.original.completedAt,
      );
      const averageMs = evidence?.reference.averageMs;
      if (
        landing.project !== project ||
        evidence === undefined ||
        originalMs === undefined ||
        averageMs === undefined ||
        averageMs <= 0
      )
        return [];
      const repeatMs = historyWallTimeMs(
        request?.outcome.repeat?.startedAt,
        request?.outcome.repeat?.completedAt,
      );
      return [
        {
          revision: landing.revision,
          ...(landing.identity === undefined
            ? {}
            : { identity: landing.identity }),
          originalMs,
          averageMs,
          kind: request?.outcome.kind ?? "unverified",
          explanation:
            request?.outcome.explanation ??
            landing.assessment?.explanation ??
            "Automatic repeat is unverified",
          reviewable: request !== undefined,
          ...(repeatMs === undefined ? {} : { repeatMs }),
        },
      ];
    }),
  };
}

export async function answerCiFollowUp(
  req: IncomingMessage,
  signal: AbortSignal,
) {
  const params = new URL(req.url ?? "", "http://local").searchParams;
  const project = params.get("id");
  if (project === null)
    throw new RefusedRequest(400, "The follow-up request names one project.");
  if (req.method !== "GET")
    throw new RefusedRequest(405, "Only GET is accepted.");
  const identity = params.get("identity"),
    revision = params.get("revision");
  if (identity === null && revision === null)
    return followUpAnswer(project, signal);
  const source = configuredProject(project);
  const read = await readFollowUps();
  if (source === undefined || read.kind !== "document")
    throw new RefusedRequest(
      503,
      "Retained follow-up evidence is unavailable.",
    );
  const completed = await completedFollowUps(source, read.document, signal);
  const landing = completed.find(
    (item) => item.identity === identity && item.revision === revision,
  );
  const reading =
    landing === undefined ? undefined : retainedFollowUpOf(landing);
  if (reading === undefined)
    throw new RefusedRequest(
      404,
      "No retained follow-up names this published Done landing.",
    );
  return reading;
}
