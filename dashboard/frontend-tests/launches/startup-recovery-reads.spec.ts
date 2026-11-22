import { expect, test } from "vitest";
import { page, type Locator } from "vitest/browser";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import { launchDialog } from "./ad-hoc-launch-page.ts";
import { mountStoryStartup } from "./story-startup-page.ts";

const story = makeMe.aWorkEntry
  .with({
    identity: "SEED-824#first",
    title: "Recover the first launch",
    dependencies: { status: "not-recorded", entries: [], blocking: [] },
  })
  .please();

async function expectProtected(card: Locator) {
  await expect.element(card.getByRole("button").first()).toBeDisabled();
  for (const action of card.getByRole("button").all())
    await expect.element(action).toBeDisabled();
  const source = card
    .getByRole("list", { name: "Source links" })
    .getByRole("link")
    .first();
  await expect.element(source).toBeVisible();
  expect(source.element().getAttribute("href")).toBe(
    "https://example.test/seeds/SEED-1.md",
  );
}

test("story starts wait for launch evidence while inspection works and an unanswered read can be rechecked", async () => {
  const ui = await mountStoryStartup(story, { evidence: "unread" });
  const inspect = ui.card.getByRole("button", { name: "Inspect story" });
  await expect.element(ui.card).toBeVisible();
  for (const action of [ui.execution, ui.refinement]) {
    await expect.element(action).toBeDisabled();
    await expect
      .element(action)
      .toHaveAccessibleDescription(
        /Unavailable until this dashboard reads this machine's launch evidence\./,
      );
  }
  await expect.element(inspect).toBeEnabled();
  await inspect.click();
  await expect
    .element(ui.card.getByRole("button", { name: "Hide detail" }))
    .toBeEnabled();
  const read = makeMe.aMachineAnswer.please();
  ui.read(read);
  await expect.element(ui.execution).toBeEnabled();
  await expect.element(ui.refinement).toBeEnabled();

  ui.readDoesNotAnswer();
  await expect
    .element(
      ui.recovery.getByText(
        /^The local dashboard server has not answered with this machine's launch evidence/,
      ),
    )
    .toBeVisible();
  await expect.element(ui.execution).toBeDisabled();
  await expect.element(ui.refinement).toBeDisabled();
  await ui.recovery
    .getByRole("button", { name: "Recheck launch evidence" })
    .click();
  expect(ui.reread).toHaveBeenCalledTimes(1);
  ui.read(read);
  await expect.element(ui.execution).toBeEnabled();
  await expect.element(ui.refinement).toBeEnabled();
  await expect.element(ui.recovery).not.toBeInTheDocument();
});

test("a lost acceptance stays static through an unsuccessful recheck and progresses when a later read confirms it", async () => {
  const other = makeMe.aWorkEntry
    .with({ ...story, identity: "SEED-824#other", title: "Independent work" })
    .please();
  const ui = await mountStoryStartup(story, { other });
  ui.accept.mockResolvedValueOnce({
    kind: "uncertain",
    unacknowledged: true,
    explanation:
      "The local dashboard server could not be reached, so the launch may or may not have been accepted and its session may or may not have started. Check `claude agents` for it.",
  });
  await ui.execution.click();
  const form = launchDialog();
  await form.start.click();
  await expect.element(form.dialog).not.toBeInTheDocument();
  const lost =
    /Startup needs reconciliation: the answer to this execution start was lost/;
  const status = ui.card.getByText(lost);
  const progressing = () =>
    ui.card.element().querySelector(".story-card-startup-progressing");
  await expect.element(status).toBeVisible();
  expect(status.element().textContent).toContain(
    "Recheck it under Startup recovery",
  );
  expect(status.element().textContent).not.toMatch(/continu/i);
  expect(progressing()).toBeNull();
  await expectProtected(ui.card);
  const independent = page.getByRole("article", { name: other.title });
  for (const action of independent.getByRole("button").all())
    await expect.element(action).toBeEnabled();

  const recheck = ui.recovery.getByRole("button", {
    name: `Recheck ${story.title} (${story.identity})`,
  });
  expect(ui.reread).toHaveBeenCalledTimes(1);
  await recheck.click();
  expect(ui.reread).toHaveBeenCalledTimes(2);
  ui.readDoesNotAnswer();
  await expect
    .element(
      ui.recovery.getByRole("button", { name: "Recheck launch evidence" }),
    )
    .toBeVisible();
  await expect.element(status).toBeVisible();
  expect(progressing()).toBeNull();
  await expectProtected(ui.card);

  await recheck.click();
  expect(ui.reread).toHaveBeenCalledTimes(3);
  const accepted = makeMe.anAttemptObservation
    .of(makeMe.anAcceptedAttempt.executing(story).please())
    .owned(true)
    .running(true)
    .please();
  ui.read(makeMe.aMachineAnswer.answeringAttempts(accepted).please());
  await expect
    .element(
      ui.card.getByText(
        /^Launch uncertain: The local dashboard server could not be reached, so the launch may or may not have been accepted/,
      ),
    )
    .toBeVisible();
  await expect
    .element(ui.card.getByText(/^Local startup in progress/))
    .toBeVisible();
  expect(progressing()).not.toBeNull();
  await expectProtected(ui.card);
  await expect.element(ui.recovery).not.toBeInTheDocument();
  expect(ui.accept).toHaveBeenCalledTimes(1);
});
