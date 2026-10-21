// Labels for a Cursor screen the runner still holds.
import type { CursorHeldLabel } from "../../../src/cursorHeldLabel.ts";

// A screen is working only while the live stop hint is in its current
// status region, or on the current composer line when a footer of task,
// model, path, and branch sits below that line and pushes it out of the
// bottom window. Prose such as `Working` or `Running` also appears in
// viewport history on a finished screen (slice 1 of plan 324 observed a
// finished screen pinned to working by a history line), so those words
// never prove work on their own. An earlier composer line in history is
// not the current one.
const workingMarker = "ctrl+c to stop";
const statusRegionLines = 6;

// Cursor's empty composer. Older builds say "Add a follow-up". The current
// build says "Plan, search, build anything". Either line is ready for the
// launch instruction. A hidden cursor does not withhold it.
const composerPrompts = [
  "Add a follow-up",
  "Plan, search, build anything",
] as const;

// A clarifying-question screen, by the structural shape slice 1 of plan 324
// proved natively: a `Question N of M` line and the selection footer. The
// literal words `Clarifying Questions` never appear on the native screen.
export function showsCursorWaitingQuestion(screen: string): boolean {
  const flattened = screen.replace(/\s+/gu, " ");
  return (
    /Question \d+ of \d+/u.test(flattened) &&
    flattened.includes("Space select · Enter next/submit")
  );
}

// The question text on that screen: its numbered question lines, without
// any box border. Nothing when the screen is not a proved question screen
// or carries no numbered question line.
export function cursorWaitingQuestion(screen: string): string | undefined {
  if (!showsCursorWaitingQuestion(screen)) return undefined;
  const questions = screen
    .split(/\r?\n/u)
    .map((line) =>
      /^\s*[│|]?\s*(\d+\.\s+.+?)\s*$/u
        .exec(line)?.[1]
        ?.replace(/[\s│|]+$/u, ""),
    )
    .filter((line) => line !== undefined);
  return questions.length === 0 ? undefined : questions.join(" ");
}

// Follow-up line present (launch may type). A working paint still includes
// that line under `ctrl+c to stop`. A question screen is never the composer.
export function showsFollowUpLine(screen: string): boolean {
  return (
    composerPrompts.some((prompt) => screen.includes(prompt)) &&
    !showsCursorWaitingQuestion(screen)
  );
}

// Idle composer only. Recovery types a continuation only on this screen, not
// while the agent is working or asking a clarifying question.
export function showsCursorComposer(screen: string): boolean {
  return showsFollowUpLine(screen) && !showsWorkingScreen(screen);
}

function nonemptyLines(screen: string): string[] {
  return screen
    .split(/\r?\n/u)
    .map((line) => line.trim())
    .filter((line) => line !== "");
}

function carriesComposerPrompt(text: string): boolean {
  return composerPrompts.some((prompt) => text.includes(`→ ${prompt}`));
}

function currentComposerLine(lines: readonly string[]): string | undefined {
  for (let index = lines.length - 1; index >= 0; index -= 1) {
    const line = lines[index];
    if (line !== undefined && carriesComposerPrompt(line)) return line;
  }
  return undefined;
}

function showsStopHint(line: string): boolean {
  return line.includes(workingMarker);
}

function showsWorkingScreen(screen: string): boolean {
  const lines = nonemptyLines(screen);
  const composerLine = currentComposerLine(lines);
  return (
    lines.slice(-statusRegionLines).some(showsStopHint) ||
    (composerLine !== undefined && showsStopHint(composerLine))
  );
}

function showsFollowUpPrompt(screen: string): boolean {
  return showsCursorComposer(screen) && carriesComposerPrompt(screen);
}

// The list's three labels are this same screen, not a separate catalog of
// Cursor wording. The ordinary follow-up prompt is "at the follow-up prompt".
// A working screen is "working". Any other screen still held, including a
// question or a trust prompt, is "waiting for an answer".
export function cursorSessionLabel(screen: string): CursorHeldLabel {
  if (showsFollowUpPrompt(screen)) return "at the follow-up prompt";
  if (showsWorkingScreen(screen)) return "working";
  return "waiting for an answer";
}
