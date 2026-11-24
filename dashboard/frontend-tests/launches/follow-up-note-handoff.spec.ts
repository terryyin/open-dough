import { createElement } from "react";
import { expect, test, vi } from "vitest";
import { page } from "vitest/browser";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import type { LaunchAttemptSource } from "../../src/launchAttempts.ts";
import { StartSession } from "../../src/StartSession.tsx";
import { storyContext } from "../../src/followUpContext.ts";
import type { StoryNote, StoryNotesAnswer } from "../../src/storyNote.ts";
import { PageReadsOnPage } from "../../src/pageReads.tsx";
import { mountComponent } from "../../test-support/component-mount/mountComponent.ts";
import { pageReadsSupplying } from "../../test-support/component-mount/unreadPageReads.ts";
import { adHocLaunches, launchDialog } from "./ad-hoc-launch-page.ts";
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
  const { adHocAttemptOf, startAdHoc } = useMountedLaunchAttempts(
    machine,
    source,
    0,
  );
  const { sessionPolicyOffer, rereadOffers } = adHocLaunches();
  return createElement(StartSession, {
    project: project.label,
    sourceId: project.id,
    launches: { adHocAttemptOf, startAdHoc, sessionPolicyOffer, rereadOffers },
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
    createElement(PageReadsOnPage, {
      reads: pageReadsSupplying({ storyNotes: () => Promise.resolve(read) }),
      children: createElement(FollowUpOnPage, { source }),
    }),
  );
  const launcher = page.getByRole("button", { name: `Follow up ${name}` });
  await launcher.click();
  const form = launchDialog();
  const attach = form.dialog.getByRole("checkbox", {
    name: "Attach story notes",
  });
  const details = form.dialog.getByText("Waiting note details", {
    exact: true,
  });
  return { launcher, form, attach, details, accept };
}

test("waiting note details preserve the choice and only selected notes are requested by Start", async () => {
  const { launcher, form, attach, details, accept } = await mountFollowUp(
    answer(waiting, sent),
  );
  const waitingText = form.dialog.getByText(waiting.text, { exact: true });
  await expect.element(attach).toBeEnabled();
  await expect
    .element(attach)
    .toHaveAccessibleDescription("1 waiting of 2 notes");
  await expect.element(attach).not.toBeChecked();
  await expect.element(waitingText).not.toBeVisible();
  await details.click();
  await expect.element(waitingText).toBeVisible();
  await expect
    .element(form.dialog.getByText(sent.text, { exact: true }))
    .not.toBeInTheDocument();
  await expect.element(attach).not.toBeChecked();
  await attach.click();
  await details.click();
  await expect.element(waitingText).not.toBeVisible();
  await expect.element(attach).toBeChecked();
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
  await expect.element(attach).not.toBeChecked();
  await expect.element(waitingText).not.toBeVisible();
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
  await attach.click();
  await form.cancel.click();
  await expect.element(form.dialog).not.toBeInTheDocument();
  expect(accept).toHaveBeenCalledTimes(2);
});

async function leavesNotesUnattached(
  read: StoryNotesAnswer,
  description: string,
) {
  const { attach, details, form, accept } = await mountFollowUp(read);
  await expect.element(attach).toHaveAccessibleDescription(description);
  await expect.element(attach).toBeDisabled();
  await expect.element(attach).not.toBeChecked();
  await expect.element(details).not.toBeInTheDocument();
  await expect.element(form.start).toBeEnabled();
  await form.start.click();
  expect(accept).toHaveBeenCalledWith(
    expect.objectContaining({
      followUp: { story: { identity: story.identity, revision } },
    }),
    false,
  );
}

test("the notes reader leaves Attach unavailable when no notes wait", async () => {
  await leavesNotesUnattached(answer(sent), "No waiting notes");
});

test("the notes reader explains why unreadable notes cannot be attached", async () => {
  await leavesNotesUnattached(
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
