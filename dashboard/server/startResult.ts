// What the start command reported and how the dashboard words a start that did
// not establish. This module is the only reader of `execution-start.mjs`'s
// one-line JSON result (`readStartResult`) and holds the one table of reasons
// a stop is refused for (`refusal`); `./executionStart.ts` runs the command.

import { z } from "zod";

// What the start command reported, read from its one line of JSON. A
// one-shot start that prepared its workspace published nothing: it reports
// the revision its result builds on, the default checkout's role when it took
// that checkout, the fetched trunk, and a selected automatic landing.
export type StartResult =
  | {
      readonly kind: "prepared";
      readonly startingRevision: string;
      readonly role?: "default-checkout";
      readonly fetched?: string;
      readonly landing?: "auto-land";
    }
  | {
      readonly kind: "accepted";
      readonly publishedSha: string;
      readonly startingRevision?: string;
      readonly candidateSha?: string;
      readonly agent?: string;
      readonly plan?: string;
    }
  | {
      readonly kind: "stopped";
      readonly status: string;
      readonly error?: string;
      readonly recovery?: {
        readonly workspace: string;
        readonly branch: string;
        readonly startingRevision?: string;
        readonly candidateSha?: string;
      };
    }
  | { readonly kind: "unreadable" };

const acceptedSchema = z.looseObject({
  ok: z.literal(true),
  publishedSha: z.string().min(1),
  startingRevision: z.string().min(1).optional(),
  candidateSha: z.string().min(1).optional(),
  agent: z.string().min(1).optional(),
  plan: z.string().min(1).optional(),
});

const preparedSchema = z.looseObject({
  ok: z.literal(true),
  status: z.literal("prepared"),
  startingRevision: z.string().min(1),
  role: z.literal("default-checkout").optional(),
  fetched: z.string().min(1).optional(),
  landing: z.literal("auto-land").optional(),
});

const stoppedSchema = z.looseObject({
  ok: z.literal(false),
  status: z.string().min(1),
  error: z.string().optional(),
  recovery: z
    .looseObject({
      workspace: z.string(),
      branch: z.string(),
      startingRevision: z.string().min(1).optional().catch(undefined),
      candidateSha: z.string().min(1).optional().catch(undefined),
    })
    .optional()
    .catch(undefined),
});

// The command's stdout, as the typed result; a stop without JSON, or with
// JSON of another shape, is unreadable.
export function readStartResult(stdout: string): StartResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(stdout.trim().split("\n").at(-1) ?? "");
  } catch {
    return { kind: "unreadable" };
  }
  const accepted = acceptedSchema.safeParse(parsed);
  if (accepted.success) {
    const facts = accepted.data;
    return {
      kind: "accepted",
      publishedSha: facts.publishedSha,
      ...(facts.startingRevision === undefined
        ? {}
        : { startingRevision: facts.startingRevision }),
      ...(facts.candidateSha === undefined
        ? {}
        : { candidateSha: facts.candidateSha }),
      ...(facts.agent === undefined ? {} : { agent: facts.agent }),
      ...(facts.plan === undefined ? {} : { plan: facts.plan }),
    };
  }
  const prepared = preparedSchema.safeParse(parsed);
  if (prepared.success) {
    const { startingRevision, role, fetched, landing } = prepared.data;
    return {
      kind: "prepared",
      startingRevision,
      ...(role === undefined ? {} : { role }),
      ...(fetched === undefined ? {} : { fetched }),
      ...(landing === undefined ? {} : { landing }),
    };
  }
  const stopped = stoppedSchema.safeParse(parsed);
  if (!stopped.success) {
    return { kind: "unreadable" };
  }
  const { status, error, recovery } = stopped.data;
  return {
    kind: "stopped",
    status,
    ...(error === undefined ? {} : { error }),
    ...(recovery === undefined
      ? {}
      : {
          recovery: {
            workspace: recovery.workspace,
            branch: recovery.branch,
            ...(recovery.startingRevision === undefined
              ? {}
              : { startingRevision: recovery.startingRevision }),
            ...(recovery.candidateSha === undefined
              ? {}
              : { candidateSha: recovery.candidateSha }),
          },
        }),
  };
}

type Stop = Extract<StartResult, { kind: "stopped" }>;

// The stop's own error, as the tail of a sentence.
function detail(stop: Stop): string {
  return stop.error ? `: ${stop.error}` : "";
}

// Why a start that cannot be established is refused, by the script's stop
// `status`: the words after the card's "Launch failed:". `owner` is the Agent
// holding the story, read from origin's Taken profiles when known.
const stopReasons: Record<
  string,
  (facts: { stop: Stop; owner: string | undefined }) => string
> = {
  conflict: ({ owner }) =>
    `Taken by ${owner ?? "another agent"}, so this dashboard did not start it.`,
  "source-refused": ({ stop }) =>
    /not queued/.test(stop.error ?? "")
      ? "The story is not queued in Backlog on origin, so it cannot be started."
      : `The story's published source cannot be started${detail(stop)}.`,
  "source-conflict": ({ stop }) =>
    `The story's published source conflicts with origin${detail(stop)}.`,
  "invalid-request": ({ stop }) =>
    `The start command refused the request${detail(stop)}.`,
  "authority-required": ({ stop }) =>
    `The start command needs authority it was not given${detail(stop)}.`,
  "setup-failed": ({ stop }) =>
    `The workspace could not be set up${detail(stop)}.`,
  "carry-conflict": ({ stop }) =>
    `Uncommitted changes could not be carried into the workspace${detail(stop)}.`,
  "developer-identity-refused": ({ stop }) =>
    `Git has no usable developer identity for the Take${detail(stop)}.`,
  "claim-failed": ({ stop }) =>
    `The Take could not be committed${detail(stop)}.`,
  unpublished: ({ stop }) =>
    `The Take could not be confirmed on origin, so the story may or may not be Taken${detail(stop)}.`,
  unchanged: () => "The start changed nothing.",
};

const unreadableReason =
  "The start command gave no result this dashboard could read, so the story may or may not be Taken.";
// A one-shot start publishes no claim, whatever became of it.
const unreadableOneShot =
  "The start command gave no result this dashboard could read. A one-shot start publishes nothing.";

const keptWords = "The start was kept; pressing Start again resumes it.";

// Whether a start that ended so leaves a claim possibly published or
// committed, or a one-shot workspace possibly prepared: its record is kept and
// the next launch of the story resumes it.
export function keepsStart(result: StartResult): boolean {
  return (
    result.kind === "unreadable" ||
    (result.kind === "stopped" &&
      (result.status === "unpublished" || result.status === "claim-failed"))
  );
}

// The card's answer for a start that did not establish: the reason, the
// workspace and branch a stop kept (or `kept`, where a start that leaves a
// claim possibly published was kept), that the start can be resumed, and that
// nothing was launched.
export function refusal(
  result: Exclude<StartResult, { kind: "accepted" | "prepared" }>,
  owner?: string,
  kept?: { readonly workspace: string; readonly branch: string },
  oneShot = false,
): string {
  const reason =
    result.kind !== "stopped"
      ? oneShot
        ? unreadableOneShot
        : unreadableReason
      : (stopReasons[result.status]?.({ stop: result, owner }) ??
        `The start stopped (${result.status})${detail(result)}.`);
  const place =
    (result.kind === "stopped" ? result.recovery : undefined) ??
    (keepsStart(result) ? kept : undefined);
  const where = place
    ? ` Workspace ${place.workspace} on branch ${place.branch}.`
    : "";
  return `${reason}${where}${keepsStart(result) ? ` ${keptWords}` : ""} Nothing was launched.`;
}
