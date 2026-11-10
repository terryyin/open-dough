// Configuration and retained evidence only: browsing never acquires CI.
import type { IncomingMessage } from "node:http";
import { hostname } from "node:os";
import { ciConfiguration } from "./baseCiJudgment.ts";
import { projectFolder } from "./projectFolders.ts";
import {
  configuredProject,
  projectEnvironment,
} from "./projectConfiguration.ts";
import { readFollowUps } from "./ciFollowUpStore.ts";
import { saveFollowUpSetting } from "./ciFollowUpAdmission.ts";
import { withKeptAttempts } from "./launchAttemptStore.ts";
import { readStoredRecords } from "./launchRecordDocument.ts";
import {
  readStoredLandedCiHistory,
  keptLandingReferences,
} from "./landedCiHistoryStore.ts";
import { historyWallTimeMs } from "../src/landedCiHistory.ts";
import { RefusedRequest } from "./localOrigin.ts";
import { jsonBody } from "./jsonRequestBody.ts";
import { completedFollowUps } from "./completedCiFollowUps.ts";
import { retainedFollowUpOf } from "./ciFollowUpReading.ts";

export async function followUpAnswer(
  project: string,
  signal = new AbortController().signal,
) {
  const source = configuredProject(project);
  if (source === undefined)
    throw new RefusedRequest(404, "The project is not configured.");
  const read = await readFollowUps();
  if (read.kind !== "document")
    throw new RefusedRequest(
      503,
      "Automatic CI follow-up is blocked: settings or allowance evidence is unreadable. The original bytes are preserved.",
    );
  const setting = read.document.projects[project];
  const adapter =
    ciConfiguration(projectFolder(source).path).adapter !== undefined;
  const production = projectEnvironment() === "production";
  const authority = setting === undefined || setting.authority === hostname();
  const available = production && !adapter && authority;
  const completed = await completedFollowUps(source, read.document, signal);
  return {
    enabled: setting?.enabled ?? false,
    machine: setting?.authority ?? hostname(),
    available,
    explanation: !production
      ? "Development dashboards have no automatic CI action authority."
      : adapter
        ? "Automatic CI follow-up is unavailable for this provider; existing CI reading remains available."
        : !authority
          ? "This project designates another production machine; this machine has no action authority."
          : "Enabling designates this production machine to request one full repeat for newly recorded landing receipts. Keep follow-up off on other machines; cross-machine coordination is not provided.",
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
  const project = new URL(req.url ?? "", "http://local").searchParams.get("id");
  if (project === null)
    throw new RefusedRequest(400, "The follow-up request names one project.");
  if (req.method === "GET") {
    const params = new URL(req.url ?? "", "http://local").searchParams;
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
  if (req.method !== "POST")
    throw new RefusedRequest(405, "Only GET and POST are accepted.");
  const source = configuredProject(project);
  if (source === undefined)
    throw new RefusedRequest(404, "The project is not configured.");
  if (projectEnvironment() !== "production")
    throw new RefusedRequest(
      409,
      "Development dashboards have no automatic CI action authority.",
    );
  const body: unknown = await jsonBody(req, signal);
  if (
    typeof body !== "object" ||
    body === null ||
    !("enabled" in body) ||
    typeof body.enabled !== "boolean"
  )
    throw new RefusedRequest(400, "The follow-up setting is malformed.");
  const enabled = body.enabled;
  if (
    enabled &&
    ciConfiguration(projectFolder(source).path).adapter !== undefined
  )
    throw new RefusedRequest(
      409,
      "Automatic CI follow-up is unavailable for this provider.",
    );
  // Matches receipt creation's attempts→follow-up lock order. An older
  // preparation stays old even if publication/acceptance happens afterwards.
  await withKeptAttempts(async (attempts) => {
    const records = await readStoredRecords();
    const history = await readStoredLandedCiHistory();
    if (
      attempts === undefined ||
      records.kind !== "document" ||
      history.kind !== "document"
    )
      throw new RefusedRequest(
        503,
        "Receipt evidence is unreadable; automatic follow-up cannot be enabled.",
      );
    const prior = [
      ...attempts
        .filter((attempt) => attempt.request.source === project)
        .flatMap((attempt) => [
          ...(attempt.landingPreparations ?? []),
          ...(attempt.landing === undefined ? [] : [attempt.landing]),
        ]),
      ...(records.document[project] ?? []).flatMap((record) =>
        "session" in record
          ? [
              ...(record.landingReporting?.preparations ?? []),
              ...(record.landing === undefined ? [] : [record.landing]),
            ]
          : [],
      ),
      ...keptLandingReferences(
        history.document[project] ?? { landings: {}, builds: {} },
      ),
    ];
    signal.throwIfAborted();
    await saveFollowUpSetting(
      project,
      enabled,
      prior.map((landing) => ({
        ...landing,
        target: landing.target ?? `refs/heads/${source.ref}`,
      })),
    );
  });
  return followUpAnswer(project, signal);
}
