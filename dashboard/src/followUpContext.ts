// Follow-up facts shared by the composer and the first-input renderer.

import { completionLabel } from "./completionReport.ts";
import type { DoneStory } from "./doneRecord.ts";
import type { FollowUpTarget } from "./followUpRequest.ts";
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
// retained session, then waiting story notes when attached
// (`./followUpStoryNotes.ts`).
export type FollowUpContext = {
  readonly story?: FollowUpSection | undefined;
  readonly target?: FollowUpTarget | undefined;
  readonly sessions: readonly FollowUpSection[];
  readonly notes?: FollowUpSection | undefined;
};

export type StoryFollowUpContext = FollowUpContext & {
  readonly story: FollowUpSection;
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
type NamedStory = Pick<FollowUpStoryFacts, "identity" | "title">;

export const storyName = ({ identity, title }: NamedStory) =>
  `${identity} — ${title}`;

export function takenStoryContext(
  story: NamedStory,
  sessions: readonly FollowUpSection[] = [],
): StoryFollowUpContext {
  return {
    story: {
      label: storyName(story),
      items: [{ label: "Status", value: "Taken" }],
    },
    sessions,
  };
}

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

export const fileComparisonName = (kind: "published" | "landed") =>
  kind === "published" ? "Published completion" : "Landed run";

export function followUpTargetItems(
  target: FollowUpTarget,
): readonly FollowUpItem[] {
  const file = "path" in target ? target : undefined;
  const published = file?.published;
  const completion = "completion" in target ? target.completion : undefined;
  const comparison =
    published === undefined
      ? fileComparisonName(completion === undefined ? "landed" : "published")
      : `Published session ${published}`;
  return [
    ...(file === undefined ? [] : [{ label: "Path", value: file.path }]),
    ...(file?.oldPath === undefined
      ? []
      : [{ label: "Old path", value: file.oldPath }]),
    {
      label: "Comparison",
      value: `${comparison} ${target.baseline} → ${target.tree}`,
    },
    ...(file?.line === undefined || file.side === undefined
      ? []
      : [
          { label: "Line", value: String(file.line) },
          { label: "Side", value: file.side },
        ]),
  ];
}

// The context a done story supplies, with its reviewed comparison or file when present.
export function storyContext(
  story: FollowUpStoryFacts,
  sessions: readonly FollowUpSection[],
  target?: FollowUpTarget,
  hasRetainedSessions = sessions.length > 0,
): StoryFollowUpContext {
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
        ...(hasRetainedSessions
          ? []
          : [{ label: "Sessions", value: noSessionRetained }]),
      ],
    },
    target,
    sessions,
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

export function itemText({ label, value }: FollowUpItem): string {
  return value.includes("\n")
    ? `- ${label}:\n${value}`
    : `- ${label}: ${value}`;
}

// Every item of the context, one line each: the story's, then each
// session's, then attached notes.
export function followUpItems({
  story,
  target,
  sessions,
  notes,
}: FollowUpContext): readonly FollowUpItem[] {
  return [
    ...(story?.items ?? []),
    ...(target === undefined ? [] : followUpTargetItems(target)),
    ...sessions.flatMap((section) => section.items),
    ...(notes?.items ?? []),
  ];
}

// A session follow-up keeps its session's context as one first-input block.
export function followUpContextText({ label, items }: FollowUpSection): string {
  return [preamble, `Session “${label}”:`, ...items.map(itemText)].join("\n");
}
