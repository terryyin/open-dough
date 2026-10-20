// Held-screen classification at the Cursor host boundary, on the screen
// shapes slice 1 of plan 324 proved natively: working is proved only by
// the live stop hint in the screen's current status region, never by
// `Working`/`Running` prose in viewport history, and a clarifying
// question is proved (and its text taken) only by the structural
// `Question N of M` line with the selection footer.
import { expect, test } from "../support/pageTest.ts";
import {
  cursorSessionLabel,
  cursorWaitingQuestion,
  showsCursorComposer,
  showsCursorWaitingQuestion,
} from "../../server/hosts/cursor/idleScreen.ts";
import { cursorHeldLabel } from "../../src/cursorHeldLabel.ts";

const waitingScreen = [
  "Color preference",
  "Question 1 of 1",
  "1. Which color do you prefer, Red or Blue?",
  "› [ ] Red",
  "  [ ] Blue",
  "  [ ] Other: (type to answer)",
  "↑/↓ option · ←/→ question · Space select · Enter next/submit · Esc to skip",
].join("\n");

test("a finished screen whose history mentions Running is at the follow-up prompt, not working", () => {
  const finished = [
    "Running false to check its exit code.",
    "The exit code was 1.",
    "→ Add a follow-up",
    "Press Ctrl+C again to exit",
  ].join("\n");
  expect(cursorSessionLabel(finished)).toBe(cursorHeldLabel.followUp);
  expect(showsCursorComposer(finished)).toBe(true);
});

test("cancelled and failed history above the follow-up prompt is at the follow-up prompt, not failed or stopped", () => {
  const settled = [
    "$ sleep 45",
    "Cancelled • 3.7s",
    "$ false",
    "exit 1 • 184ms",
    "The exit code was 1.",
    "→ Add a follow-up",
    "Press Ctrl+C again to exit",
  ].join("\n");
  expect(cursorSessionLabel(settled)).toBe(cursorHeldLabel.followUp);
  expect(showsCursorComposer(settled)).toBe(true);
  expect(showsCursorWaitingQuestion(settled)).toBe(false);
  expect(cursorWaitingQuestion(settled)).toBeUndefined();
});

test("cancelled history without a follow-up prompt, live stop hint, or structural question proves no failure or interruption", () => {
  const settled = ["$ sleep 45", "Cancelled • 3.7s", "exit 1 • 184ms"].join(
    "\n",
  );
  // It falls back to the waiting label only; no failed/interrupted
  // classification or question text is derived from the history lines.
  expect(cursorSessionLabel(settled)).toBe(cursorHeldLabel.waiting);
  expect(showsCursorComposer(settled)).toBe(false);
  expect(showsCursorWaitingQuestion(settled)).toBe(false);
  expect(cursorWaitingQuestion(settled)).toBeUndefined();
});

test("a screen whose current status region shows the live stop hint is working, whatever its history says", () => {
  const working = [
    "Running false to check its exit code.",
    "Working on the next step",
    "→ Add a follow-up",
    "ctrl+c to stop",
  ].join("\n");
  expect(cursorSessionLabel(working)).toBe(cursorHeldLabel.working);
  expect(showsCursorComposer(working)).toBe(false);
});

test("the native question screen yields its numbered question and is never the composer", () => {
  expect(showsCursorWaitingQuestion(waitingScreen)).toBe(true);
  expect(cursorWaitingQuestion(waitingScreen)).toBe(
    "1. Which color do you prefer, Red or Blue?",
  );
  expect(cursorSessionLabel(waitingScreen)).toBe(cursorHeldLabel.waiting);
  expect(showsCursorComposer(waitingScreen)).toBe(false);
});

test("screens without the structural question shape yield no question text", () => {
  const trust = [
    "Workspace Trust Required",
    "Do you trust the contents of this directory?",
    "[a] Trust this workspace",
  ].join("\n");
  expect(showsCursorWaitingQuestion(trust)).toBe(false);
  expect(cursorWaitingQuestion(trust)).toBeUndefined();
  expect(cursorWaitingQuestion("1. Which do you choose?")).toBeUndefined();
  expect(cursorWaitingQuestion("Question 1 of 1\nEsc to skip")).toBeUndefined();
});
