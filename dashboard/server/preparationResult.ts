// What the preparation start command reported. This module is the only reader
// of `preparation-assignment.mjs start`'s one-line JSON result
// (`readPreparationResult`); `./preparationStart.ts` runs the command.

import { z } from "zod";

// An announced start carries the published commit; a continued one (the
// workspace already held the assignment) does not.
export type PreparationResult =
  | {
      readonly kind: "established";
      readonly agent: string;
      readonly publishedSha?: string;
    }
  | {
      readonly kind: "stopped";
      readonly status: string;
      readonly error?: string;
      // The agents holding the rotation's names, when every name is held.
      readonly occupied?: readonly string[];
    }
  | { readonly kind: "unreadable" };

const establishedSchema = z.looseObject({
  ok: z.literal(true),
  status: z.enum(["announced", "continued"]),
  agent: z.string().min(1),
  publishedSha: z.string().min(1).optional(),
});

const stoppedSchema = z.looseObject({
  ok: z.literal(false),
  status: z.string().min(1),
  error: z.string().optional(),
  occupied: z
    .array(z.looseObject({ agent: z.string().optional().catch(undefined) }))
    .optional()
    .catch(undefined),
});

// The command's stdout, as the typed result; output without JSON, or with
// JSON of another shape, is unreadable.
export function readPreparationResult(stdout: string): PreparationResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(stdout.trim().split("\n").at(-1) ?? "");
  } catch {
    return { kind: "unreadable" };
  }
  const established = establishedSchema.safeParse(parsed);
  if (established.success) {
    const { agent, publishedSha } = established.data;
    return {
      kind: "established",
      agent,
      ...(publishedSha === undefined ? {} : { publishedSha }),
    };
  }
  const stopped = stoppedSchema.safeParse(parsed);
  if (!stopped.success) return { kind: "unreadable" };
  const { status, error, occupied } = stopped.data;
  const agents = (occupied ?? []).flatMap(({ agent }) =>
    agent === undefined ? [] : [agent],
  );
  return {
    kind: "stopped",
    status,
    ...(error === undefined ? {} : { error }),
    ...(agents.length === 0 ? {} : { occupied: agents }),
  };
}

type Stop = Extract<PreparationResult, { kind: "stopped" }>;

// The stop's own error, as the tail of a sentence.
function detail(stop: Stop): string {
  return stop.error ? `: ${stop.error}` : "";
}

// Why a preparation start that stopped is refused, by the script's stop
// `status`: the words after the card's "Launch failed:".
const stopReasons: Record<string, (stop: Stop) => string> = {
  "not-queued": () =>
    "The story is not queued in Backlog on origin, so it cannot be started.",
  "source-refused": (stop) =>
    `The story's published source cannot be started${detail(stop)}.`,
  "invalid-request": (stop) =>
    `The start command refused the request${detail(stop)}.`,
  "workspace-selection-failed": (stop) =>
    `The workspace could not be set up${detail(stop)}.`,
  "workspace-not-isolated": (stop) =>
    `The workspace cannot take a new announcement${detail(stop)}.`,
  "workspace-assigned-elsewhere": (stop) =>
    `The workspace still holds another published assignment${detail(stop)}.`,
  "agent-setting-invalid": (stop) =>
    `The project's agent setting is invalid${detail(stop)}.`,
  "agent-unavailable": (stop) =>
    `Every agent name is held on origin${stop.occupied ? ` (${stop.occupied.join(", ")})` : ""}, so no agent is free to prepare the story.`,
  "developer-identity-refused": (stop) =>
    `Git has no usable developer identity for the announcement${detail(stop)}.`,
  // Slice 7 keeps the start for this stop instead of ending it.
  unpublished: (stop) =>
    `The Preparing announcement could not be confirmed on origin${detail(stop)}.`,
};

// The card's answer for a start that did not establish: the reason, what the
// cleanup could not remove (a sentence, or ""), and that nothing was launched.
export function preparationRefusal(
  result: Exclude<PreparationResult, { kind: "established" }>,
  leftBehind = "",
): string {
  const reason =
    result.kind === "stopped"
      ? (stopReasons[result.status]?.(result) ??
        `The preparation start stopped (${result.status})${detail(result)}.`)
      : "The preparation start gave no result this dashboard could read.";
  return `${reason}${leftBehind} Nothing was launched.`;
}
