// The story Follow up composer's session choices: one per story session, kept
// here, published from another machine, or both, each unchecked and closed,
// with its facts on demand; Start requests only the chosen sessions. The
// integrated journeys are ../../../e2e/stories/recently-done-follow-up.spec.ts
// and ../../../e2e/intent/intent-published-range-source.spec.ts.

import { expect, test } from "vitest";
import { userEvent, type Locator } from "vitest/browser";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import type { LaunchRecord } from "../../src/launchRecord.ts";
import type { PublishedSessionRecord } from "../../src/publishedSessionRecord.ts";
import {
  followUpRevision as revision,
  openStoryFollowUp,
} from "./follow-up-page.ts";

const story = { identity: "SEED-826#sessions", title: "Choose the sessions" };

const retained = (sessionId: string, instruction: string, report: string) =>
  makeMe.aLaunchRecord
    .executing({ ...story, instruction })
    .inClaudeSession({ sessionId })
    .completedWith({ message: report })
    .markedDoneAt("2026-11-17T00:00:00.000Z")
    .please();
const first = retained("first-run", "First request", "First report");
const second = retained("second-run", "Second request", "Second report");
const otherMachine = makeMe.aSessionRecord
  .forStory(story.identity)
  .closing({ base: "1".repeat(40), candidate: "2".repeat(40) })
  .andClosing({ base: "3".repeat(40), candidate: "4".repeat(40) })
  .please();
const matchedRecord = makeMe.aSessionRecord.forStory(story.identity).please();
const matched = makeMe.aLaunchRecord
  .executing({ ...story, instruction: "Matched request" })
  .reportingThrough({
    origin: "https://dashboard.example",
    reference: matchedRecord.sessionId,
    command: "node report.mjs",
  })
  .inClaudeSession({ sessionId: "matched-here" })
  .completedWith({ message: "Matched report" })
  .markedDoneAt("2026-11-17T00:00:00.000Z")
  .please();
const foreign = makeMe.aSessionRecord.forStory("SEED-880#other").please();

async function mountFollowUp(
  records: readonly LaunchRecord[],
  published: readonly PublishedSessionRecord[],
) {
  const { accept, form } = await openStoryFollowUp(story, {
    sessions: { retained: records, published },
  });
  const chooser = form.dialog.getByRole("group", { name: "Attach sessions" });
  const choice = (choiceName: string) => ({
    box: chooser.getByRole("checkbox", { name: choiceName, exact: true }),
    summary: chooser.getByText(`Details for ${choiceName}`, { exact: true }),
    detail: (text: string) => chooser.getByText(text, { exact: true }),
  });
  return { accept, form, chooser, choice };
}

async function pressOn(target: Locator, key: "{Enter}" | " ") {
  target.element().focus();
  await userEvent.keyboard(key);
}

test("same-title sessions are separate choices whose details keep the selection, and Start requests only the chosen one", async () => {
  const { accept, form, chooser, choice } = await mountFollowUp(
    [first, second],
    [],
  );
  const one = choice(`${story.title} · Claude Code · first-run`);
  const two = choice(`${story.title} · Claude Code · second-run`);
  expect(chooser.getByRole("checkbox").all()).toHaveLength(2);
  for (const each of [one, two]) {
    await expect.element(each.box).not.toBeChecked();
    await expect.element(each.detail("First request")).not.toBeVisible();
  }

  await pressOn(one.summary, "{Enter}");
  await expect.element(one.detail("First request")).toBeVisible();
  await expect.element(one.detail("First report")).toBeVisible();
  await expect.element(one.box).not.toBeChecked();
  await pressOn(one.box, " ");
  await pressOn(one.summary, "{Enter}");
  await expect.element(one.detail("First request")).not.toBeVisible();
  await expect.element(one.box).toBeChecked();
  await expect.element(two.box).not.toBeChecked();

  await form.start.click();
  await expect.element(form.dialog).not.toBeInTheDocument();
  expect(accept).toHaveBeenCalledWith(
    expect.objectContaining({
      followUp: {
        story: {
          identity: story.identity,
          revision,
          sessions: [{ host: "claude", sessionId: "first-run" }],
        },
      },
    }),
    false,
  );
});

test("published sessions of the story are choices with their UUID and recorded ranges, one per session when kept here too", async () => {
  const { accept, form, chooser, choice } = await mountFollowUp(
    [matched],
    [otherMachine, matchedRecord, foreign],
  );
  const merged = choice(`${story.title} · Claude Code · matched-here`);
  const remote = choice(`Published session ${otherMachine.sessionId}`);
  expect(chooser.getByRole("checkbox").all()).toHaveLength(2);
  await expect
    .element(chooser.getByText(foreign.sessionId, { exact: false }))
    .not.toBeInTheDocument();

  await merged.summary.click();
  for (const text of [
    matchedRecord.sessionId,
    "Matched request",
    "Matched report",
  ])
    await expect.element(merged.detail(text)).toBeVisible();
  await remote.summary.click();
  for (const text of [
    otherMachine.sessionId,
    `${"1".repeat(40)} → ${"2".repeat(40)}`,
    `${"3".repeat(40)} → ${"4".repeat(40)}`,
  ])
    await expect.element(remote.detail(text)).toBeVisible();
  await expect.element(remote.box).not.toBeChecked();

  await remote.box.click();
  await form.start.click();
  await expect.element(form.dialog).not.toBeInTheDocument();
  expect(accept).toHaveBeenCalledWith(
    expect.objectContaining({
      followUp: {
        story: {
          identity: story.identity,
          revision,
          sessions: [{ published: otherMachine.sessionId }],
        },
      },
    }),
    false,
  );
});
