import {
  followUpTargetItems,
  itemText,
  noRequestGiven,
  type FollowUpSection,
  type StoryFollowUpContext,
} from "../src/followUpContext.ts";

const sectionNames = {
  story: "story",
  request: "follow-up",
  session: "session",
  notes: "line-notes",
} as const;

// Escape a tag at the start of a body line, and preserve the distinction
// between a literal escape and an escape that protects our framing.
const reservedLine = new RegExp(
  String.raw`^(?=\\|</?(?:${Object.values(sectionNames).join("|")})>$)`,
  "gm",
);

function section(
  kind: keyof typeof sectionNames,
  body: readonly string[],
): string {
  const tag = sectionNames[kind];
  const escaped = body.join("\n").replace(reservedLine, "\\");
  return [`<${tag}>`, escaped, `</${tag}>`].join("\n");
}

function contextSection(
  kind: "story" | "session" | "notes",
  { label, items }: FollowUpSection,
): string {
  return section(kind, [label, ...items.map(itemText)]);
}

export function storyFollowUpMessage(
  { story, target, sessions, notes }: StoryFollowUpContext,
  instruction: string | undefined,
): string {
  const comparison =
    target === undefined ? [] : followUpTargetItems(target).map(itemText);
  const request = instruction?.trim()
    ? ["Request:", instruction]
    : [`Request: ${noRequestGiven}`];
  return [
    contextSection("story", story),
    section("request", [...comparison, ...request]),
    ...sessions.map((session) => contextSection("session", session)),
    ...(notes === undefined ? [] : [contextSection("notes", notes)]),
  ].join("\n\n");
}
