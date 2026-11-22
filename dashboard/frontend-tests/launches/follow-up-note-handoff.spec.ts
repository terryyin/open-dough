import { createElement } from "react";
import { expect, test, vi } from "vitest";
import { page } from "vitest/browser";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import type { LaunchAttemptSource } from "../../src/launchAttempts.ts";
import { launchOffers } from "../../src/launchOffers.ts";
import { StartSession } from "../../src/StartSession.tsx";
import { storyContext } from "../../src/followUpContext.ts";
import type { StoryNote, StoryNotesAnswer } from "../../src/storyNote.ts";
import { StoryNotesOnPage, storyNotesState } from "../../src/storyNotes.ts";
import { mountComponent } from "../../test-support/component-mount/mountComponent.ts";
import { launchDialog } from "./ad-hoc-launch-page.ts";
import { useMountedLaunchAttempts } from "./mounted-launch-attempts.ts";
import { mountStoryStartup } from "./story-startup-page.ts";

const project = makeMe.aPublishedSource.openDough.please();
const story = makeMe.aWorkEntry
  .with({
    identity: "SEED-826#notes",
    title: "Keep the follow-up notes",
  })
  .please();
const revision = "7".repeat(40);
const name = `${story.identity} — ${story.title}`;
const waiting = makeMe.aStoryNote.withText("Still waiting").please();
const sent = makeMe.aStoryNote
  .identifiedAs("34810000-0000-4000-8000-000000000202")
  .withText("Already sent")
  .savedAt("2026-11-17T00:10:00.000Z")
  .deliveredAs("2026-11-17T00:10:00.000Z")
  .please();
const answer = (...notes: StoryNote[]): StoryNotesAnswer => ({
  kind: "notes",
  notes: { [story.identity]: notes },
});
const machine = makeMe.aMachineAnswer.please();

function FollowUpOnPage({ source }: { source: LaunchAttemptSource }) {
  const attempts = useMountedLaunchAttempts(machine, source, 0);
  return createElement(StartSession, {
    project: project.label,
    sourceId: project.id,
    launches: {
      ...launchOffers(machine, true),
      ...attempts,
      rereadOffers: () => undefined,
    },
    presentTerminal: () => undefined,
    followUp: {
      name,
      context: storyContext(
        { ...story, completedAt: "2026-11-17T00:00:00.000Z" },
        [],
      ),
      source: { story: { identity: story.identity, revision } },
    },
  });
}

async function mountFollowUp(read: StoryNotesAnswer) {
  const accept = vi.fn<LaunchAttemptSource["accept"]>().mockResolvedValue({
    kind: "failed",
    explanation: "The test host declined this start.",
  });
  const source = {
    accept,
    waitForChange: vi
      .fn<LaunchAttemptSource["waitForChange"]>()
      .mockResolvedValue(undefined),
  };
  await mountComponent(
    createElement(StoryNotesOnPage, {
      value: new Map([
        [project.id, storyNotesState(() => Promise.resolve(read))],
      ]),
      children: createElement(FollowUpOnPage, { source }),
    }),
  );
  const launcher = page.getByRole("button", { name: `Follow up ${name}` });
  await launcher.click();
  const form = launchDialog();
  const attach = form.dialog.getByRole("checkbox", {
    name: "Attach story notes",
  });
  return { launcher, form, attach, accept };
}

test("Follow up defaults to waiting notes, Start sends the selected choice, and Cancel sends nothing", async () => {
  const { launcher, form, attach, accept } = await mountFollowUp(
    answer(waiting, sent),
  );
  const expectChecked = async () => {
    await expect.element(attach).toBeChecked();
    await expect.element(attach).toBeEnabled();
    await expect
      .element(attach)
      .toHaveAccessibleDescription("1 waiting of 2 notes");
  };

  await expectChecked();
  await form.start.click();
  await expect.element(form.dialog).not.toBeInTheDocument();
  expect(accept).toHaveBeenNthCalledWith(
    1,
    expect.objectContaining({
      workflow: "ad-hoc",
      followUp: { story: { identity: story.identity, revision, notes: true } },
    }),
    false,
  );

  await launcher.click();
  await expectChecked();
  await attach.click();
  await expect.element(attach).not.toBeChecked();
  await form.start.click();
  await expect.element(form.dialog).not.toBeInTheDocument();
  expect(accept).toHaveBeenNthCalledWith(
    2,
    expect.objectContaining({
      workflow: "ad-hoc",
      followUp: { story: { identity: story.identity, revision } },
    }),
    false,
  );

  await launcher.click();
  await expectChecked();
  await form.cancel.click();
  await expect.element(form.dialog).not.toBeInTheDocument();
  expect(accept).toHaveBeenCalledTimes(2);
});

async function startsWithoutNotes(read: StoryNotesAnswer, description: string) {
  const { form, attach, accept } = await mountFollowUp(read);
  await expect.element(attach).toBeDisabled();
  await expect.element(attach).not.toBeChecked();
  await expect.element(attach).toHaveAccessibleDescription(description);
  await expect.element(form.start).toBeEnabled();
  await form.start.click();
  await expect.element(form.dialog).not.toBeInTheDocument();
  expect(accept).toHaveBeenCalledExactlyOnceWith(
    expect.objectContaining({
      workflow: "ad-hoc",
      followUp: { story: { identity: story.identity, revision } },
    }),
    false,
  );
}

test("a follow-up with no waiting notes explains why Attach is unavailable and Start still works", async () => {
  await startsWithoutNotes(answer(sent), "No waiting notes");
});

test("a follow-up with unreadable notes explains why Attach is unavailable and Start still works", async () => {
  await startsWithoutNotes(
    { kind: "unreadable" },
    "The notes could not be read.",
  );
});

test("a Taken card shows notes waiting and offers no story Follow up", async () => {
  const { card } = await mountStoryStartup(story, {
    taken: true,
    notes: answer(waiting),
  });
  await expect
    .element(card.getByRole("status"))
    .toHaveTextContent("1 note waiting");
  await expect
    .element(card.getByRole("button", { name: "Notes (1)" }))
    .toHaveAccessibleDescription("1 note waiting");
  await expect
    .element(card.getByRole("button", { name: /Follow up/ }))
    .not.toBeInTheDocument();
});
