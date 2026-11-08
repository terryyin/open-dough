// The one rule for what a follow-up supplies (`./followUpRequest.ts`): the
// context the dashboard still holds of the entry it follows up, as the
// dialog lists it (`./FollowUpSubject.tsx`) and as the server sends it as its
// own first input block (`../server/unattachedInput.ts`), so the two cannot
// disagree. For a done story, first, under its identity and title: when it was
// completed, by which developer with which agent, and that it is done, so its
// seed and plan may be gone while its history keeps the identity; or that no
// session context is retained when its card holds no session. For each
// retained session: its workflow and story identity when it had one, its
// original request, its final report when one was submitted, and the
// revision its work landed at when that was recorded. It states only what
// the records hold: a Done mark is not evidence that work landed, so it is
// never mentioned.

import { completionLabel } from "./completionReport.ts";
import type { DoneStory } from "./doneRecord.ts";
import type { LaunchRecord } from "./launchRecord.ts";
import { launchSubject } from "./launchWorkflow.ts";

// What the context reads of one retained session.
export type FollowUpSessionFacts = Pick<
  LaunchRecord,
  "request" | "completion" | "landing"
>;

// One line of the context: what it is, and what the records hold of it.
export type FollowUpItem = { readonly label: string; readonly value: string };

// A story's or a session's context, under its label.
export type FollowUpSection = {
  readonly label: string;
  readonly items: readonly FollowUpItem[];
};

// What a follow-up supplies: the done story it follows up, if any, then each
// retained session.
export type FollowUpContext = {
  readonly story?: FollowUpSection | undefined;
  readonly sessions: readonly FollowUpSection[];
};

// What the context reads of a done story's published record.
export type FollowUpStoryFacts = Pick<
  DoneStory,
  "identity" | "title" | "completedAt" | "developer" | "agent"
>;

export const noRequestGiven = "No request text was given.";
export const noReportSubmitted = "No final report was submitted.";
export const noReportRetained = "No final report is retained.";
export const noSessionRetained = "No session context is retained.";

// A done story as its entry reads, by identity and title.
export const storyName = ({ identity, title }: FollowUpStoryFacts) =>
  `${identity} — ${title}`;

// When a story was completed, the same for the page and the server.
const completionTime = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
  timeZone: "UTC",
});

// The context a done story supplies, holding `sessions`.
export function storyContext(
  story: FollowUpStoryFacts,
  sessions: readonly FollowUpSessionFacts[],
): FollowUpContext {
  const completed = [
    `${completionTime.format(new Date(story.completedAt))} UTC`,
    ...(story.developer === undefined ? [] : [`by ${story.developer}`]),
    ...(story.agent === undefined ? [] : [`with ${story.agent}`]),
  ].join(" ");
  return {
    story: {
      label: storyName(story),
      items: [
        { label: "Completed", value: completed },
        {
          label: "Status",
          value: `Done. Its seed and plan may have been removed; its records remain in the project's history under ${story.identity}.`,
        },
        ...(sessions.length === 0
          ? [{ label: "Sessions", value: noSessionRetained }]
          : []),
      ],
    },
    sessions: sessions.map(sessionContext),
  };
}

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
export function sessionContext(record: FollowUpSessionFacts): FollowUpSection {
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

// Every item of the context, one line each: the story's, then each
// session's.
export function followUpItems({
  story,
  sessions,
}: FollowUpContext): readonly FollowUpItem[] {
  return [story, ...sessions].flatMap((section) => section?.items ?? []);
}

// The context as the session receives it, its own first input block.
export function followUpContextText({
  story,
  sessions,
}: FollowUpContext): string {
  const section = (kind: string) => (each: FollowUpSection) =>
    [`${kind} “${each.label}”:`, ...each.items.map(itemText)].join("\n");
  return [
    preamble,
    ...(story === undefined ? [] : [section("Done story")(story)]),
    ...sessions.map(section("Session")),
  ].join("\n");
}
