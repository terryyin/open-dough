// The one rule for what a follow-up supplies (`./followUpRequest.ts`): the
// context the dashboard still holds of the entry it follows up, as the
// dialog lists it (`./FollowUpSubject.tsx`) and as the server sends it as its
// own first input block (`../server/unattachedInput.ts`), so the two cannot
// disagree. For each retained session: its workflow and story identity when
// it had one, its original request, its final report when one was submitted,
// and the revision its work landed at when that was recorded. It states only
// what the records hold: a Done mark is not evidence that work landed, so it
// is never mentioned.

import { completionLabel } from "./completionReport.ts";
import type { LaunchRecord } from "./launchRecord.ts";
import { launchSubject } from "./launchWorkflow.ts";

// What the context reads of one retained session.
export type FollowUpSessionFacts = Pick<
  LaunchRecord,
  "request" | "completion" | "landing"
>;

// One line of the context: what it is, and what the records hold of it.
export type FollowUpItem = { readonly label: string; readonly value: string };

// A session's context, under its label.
export type FollowUpSessionContext = {
  readonly label: string;
  readonly items: readonly FollowUpItem[];
};

export const noRequestGiven = "No request text was given.";
export const noReportSubmitted = "No final report was submitted.";
export const noReportRetained = "No final report is retained.";

function reportItem(
  completion: FollowUpSessionFacts["completion"],
): FollowUpItem {
  if (completion === undefined)
    return { label: "Final report", value: noReportRetained };
  if (completion.message.trim() === "")
    return { label: "Final report", value: noReportSubmitted };
  return {
    label: `Final report (${completionLabel(completion)})`,
    value: completion.message,
  };
}

// The context one retained session supplies.
export function sessionContext(
  record: FollowUpSessionFacts,
): FollowUpSessionContext {
  const { title, identity, name } = launchSubject(record.request);
  const request = record.request.instruction?.trim() ?? "";
  return {
    label: title,
    items: [
      { label: "Workflow", value: name },
      ...(identity === undefined ? [] : [{ label: "Story", value: identity }]),
      {
        label: "Original request",
        value: request === "" ? noRequestGiven : request,
      },
      reportItem(record.completion),
      ...(record.landing === undefined
        ? []
        : [{ label: "Landed at revision", value: record.landing.revision }]),
    ],
  };
}

const preamble =
  "Follow-up context: this session follows up earlier work in this project whose conversation can no longer be continued. These are the records the dashboard still holds of it; they state nothing beyond what was recorded.";

function itemText({ label, value }: FollowUpItem): string {
  return value.includes("\n")
    ? `- ${label}:\n${value}`
    : `- ${label}: ${value}`;
}

// The context as the session receives it, its own first input block.
export function followUpContextText(
  sessions: readonly FollowUpSessionContext[],
): string {
  return [
    preamble,
    ...sessions.map(({ label, items }) =>
      [`Session “${label}”:`, ...items.map(itemText)].join("\n"),
    ),
  ].join("\n");
}
