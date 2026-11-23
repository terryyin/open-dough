import { expect, test, onTestFinished } from "vitest";
import { page, userEvent } from "vitest/browser";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import { browserSession, emulateMedia } from "../review/browser-session.ts";
import { launchDialog } from "./ad-hoc-launch-page.ts";
import { mountStoryStartup } from "./story-startup-page.ts";

const instruction = "Keep this exact instruction.";
const story = makeMe.aWorkEntry
  .with({
    identity: "SEED-825#first",
    title: "Finish a keyboard launch",
    dependencies: { status: "not-recorded", entries: [], blocking: [] },
  })
  .please();
const other = makeMe.aWorkEntry
  .with({ ...story, identity: "SEED-825#other", title: "Read another story" })
  .please();
const unavailable =
  "Local startup in progress; this story's actions are unavailable until it settles.";
const progress = `${story.title}: execution start, local startup in progress.`;
const waiting = `${story.title}: execution start settled on this machine; waiting for published story state.`;
const reconciled = `${story.title}: execution start reconciled with published story state.`;

test("a keyboard start protects the selected story, announces each transition once, and leaves the next inspection focused", async () => {
  await emulateMedia([{ name: "prefers-reduced-motion", value: "reduce" }]);
  const attempt = makeMe.anAcceptedAttempt.executing(story);
  const observe = (running: boolean) =>
    makeMe.anAttemptObservation
      .of(attempt.please())
      .owned(true)
      .running(running)
      .please();
  const ui = await mountStoryStartup(story, { other });
  const said: string[] = [];
  await expect.element(ui.announcement).toBeInTheDocument();
  const log = ui.announcement.element();
  const announcer = new MutationObserver(() => {
    const words = log.textContent;
    if (words) said.push(words);
  });
  announcer.observe(log, {
    childList: true,
    characterData: true,
    subtree: true,
  });
  onTestFinished(() => {
    announcer.disconnect();
  });
  ui.accept.mockResolvedValueOnce({ kind: "accepted", attempt: observe(true) });

  const inspect = ui.card.getByRole("button", { name: "Inspect story" });
  inspect.element().focus();
  await userEvent.keyboard("{Enter}");
  const hide = ui.card.getByRole("button", { name: "Hide detail" });
  await expect.element(hide).toHaveAttribute("aria-expanded", "true");
  const detail = ui.card.getByRole("region", {
    name: `Detail for ${story.title}`,
  });
  await expect.element(detail).toBeVisible();
  await ui.card.getByRole("heading", { level: 3, name: story.title }).click();
  await expect.element(ui.card).toHaveClass("story-card-selected");
  ui.execution.element().focus();
  await userEvent.keyboard("{Enter}");
  const form = launchDialog("Start execution in Claude Code");
  await expect.element(form.instruction).toHaveFocus();
  await userEvent.keyboard(instruction);
  await expect.element(form.start).toBeEnabled();
  form.start.element().focus();
  await userEvent.keyboard("{Enter}");

  await expect.element(form.dialog).not.toBeInTheDocument();
  await expect.element(ui.card).toHaveFocus();
  await expect
    .element(ui.card)
    .toHaveAccessibleDescription(new RegExp(unavailable));
  for (const action of [ui.execution, ui.refinement, hide]) {
    await expect.element(action).toBeDisabled();
    await expect
      .element(action)
      .toHaveAccessibleDescription(new RegExp(unavailable));
  }
  const otherCard = page.getByRole("article", { name: other.title });
  const otherStart = otherCard.getByRole("button", { name: "Start execution" });
  await expect.element(otherStart).toBeEnabled();
  expect(otherStart.element().getAttribute("aria-describedby")).not.toBe(
    ui.execution.element().getAttribute("aria-describedby"),
  );
  const availableStatus = ui.card.getByText(unavailable, { exact: true });
  await expect.element(availableStatus).toBeVisible();
  const status = availableStatus.element().parentElement;
  expect(status?.textContent).not.toMatch(/Backlog|Taken|detail/);
  await expect.element(hide).toHaveAttribute("aria-expanded", "true");
  await expect
    .element(ui.card)
    .toHaveClass("story-card-selected", "story-card-starting");
  const marks = getComputedStyle(ui.card.element());
  expect(marks.boxShadow).toContain("inset");
  const accent = document.createElement("span");
  accent.style.backgroundColor = "var(--accent-soft)";
  ui.card.element().append(accent);
  const selectionColor = getComputedStyle(accent).backgroundColor;
  accent.remove();
  expect(marks.backgroundColor).toBe(selectionColor);
  expect(marks.borderTopStyle).toBe("dashed");
  expect(marks.borderTopColor).toBe(marks.borderLeftColor);

  const indicator = ui.card
    .getByText("Starting execution in Claude Code…", { exact: true })
    .element();
  const animation = () => getComputedStyle(indicator, "::before");
  expect(parseFloat(animation().width)).toBeGreaterThan(0);
  expect(animation().animationName).toBe("none");
  await browserSession().send("Emulation.setEmulatedMedia", {
    features: [{ name: "prefers-reduced-motion", value: "no-preference" }],
  });
  await expect
    .poll(() => animation().animationName)
    .toBe("story-card-startup-pulse");
  await browserSession().send("Emulation.setEmulatedMedia", {
    features: [{ name: "prefers-reduced-motion", value: "reduce" }],
  });
  await expect.poll(() => animation().animationName).toBe("none");
  await expect.poll(() => said).toEqual([progress]);
  expect(ui.accept).toHaveBeenCalledExactlyOnceWith(
    expect.objectContaining({ identity: story.identity, instruction }),
    false,
  );

  const inspectOther = otherCard.getByRole("button", { name: "Inspect story" });
  await expect.element(inspectOther).toBeEnabled();
  inspectOther.element().focus();
  await userEvent.keyboard("{Enter}");
  const otherTask = otherCard.getByRole("button", { name: "Hide detail" });
  await expect.element(otherTask).toHaveFocus();

  const published = "7".repeat(40);
  attempt.published(published);
  ui.read(makeMe.aMachineAnswer.answeringAttempts(observe(true)).please());
  await expect.element(ui.announcement).toHaveTextContent(progress);
  await expect.element(ui.execution).toBeDisabled();
  expect(said).toEqual([progress]);
  const launched = makeMe.aLaunchRecord.executing(story).please();
  attempt.launched(launched.session).settledAt("2026-01-01T00:00:02.000Z");
  const read = (running: boolean) =>
    makeMe.aMachineAnswer
      .answeringAttempts(observe(running))
      .observingOpen(launched)
      .please();
  ui.read(read(false));
  await expect.element(ui.announcement).toHaveTextContent(waiting);
  await expect.element(ui.execution).toBeDisabled();
  await expect.element(otherTask).toHaveFocus();

  attempt.reconciledAt("2026-01-01T00:00:03.000Z");
  ui.read(read(false));
  const session = ui.card
    .getByRole("list", { name: "Sessions" })
    .getByRole("article");
  await expect.element(session).toHaveLength(1);
  await expect.element(hide).toBeEnabled();
  await expect.element(hide).toHaveAttribute("aria-expanded", "true");
  await expect.element(detail).toBeVisible();
  await expect.poll(() => said).toEqual([progress, waiting, reconciled]);
  await expect.element(otherTask).toHaveFocus();
  await expect.element(session).not.toHaveFocus();
});
