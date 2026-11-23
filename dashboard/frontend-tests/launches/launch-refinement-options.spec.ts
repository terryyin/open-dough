import { expect, test } from "vitest";
import { userEvent } from "vitest/browser";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import { offeredShape } from "../../src/commandOptions.ts";
import { story } from "../navigation/board-work.ts";
import { launchDialog } from "./ad-hoc-launch-page.ts";
import { mountStoryLaunches } from "./story-card-launch-page.ts";

const project = makeMe.aPublishedSource.openDough.please();
const entry = story("Review the draft approach", 731, {
  dependencies: { status: "not-recorded", entries: [], blocking: [] },
});
const definition = makeMe.anOptionsDefinition
  .withExclusiveApproachExample()
  .please();
const machine = makeMe.aMachineAnswer
  .offering({
    source: project.id,
    workflow: "refinement",
    host: "claude",
    ...offeredShape(definition),
  })
  .please();

const optionsGroup = (form: ReturnType<typeof launchDialog>) =>
  form.dialog.getByRole("group", { name: "Options", exact: true });

async function choices(form: ReturnType<typeof launchDialog>) {
  await form.options.click();
  const options = optionsGroup(form);
  await expect.element(options).toBeVisible();
  return {
    a: options.getByRole("radio", { name: "A", exact: true }),
    none: options.getByRole("radio", { name: "No Approach", exact: true }),
    c: options.getByRole("checkbox", { name: "C", exact: true }),
  };
}

test("a story's installed refinement options appear on refinement alone", async () => {
  const { execution, refinement } = await mountStoryLaunches(entry, {
    offerRead: { answer: machine, held: false },
  });
  const form = launchDialog();
  await execution.click();
  await expect
    .element(form.dialog.getByText(entry.title, { exact: true }))
    .toBeVisible();
  await expect.element(form.options).not.toBeInTheDocument();
  await expect.element(optionsGroup(form)).not.toBeInTheDocument();
  await form.cancel.click();

  await refinement.click();
  const { a, c } = await choices(form);
  await expect.element(a).toBeVisible();
  await expect.element(c).toBeVisible();
});

test("No Approach clears A, keeps C and sends only C on Start", async () => {
  const { refinement, start } = await mountStoryLaunches(entry, {
    offerRead: { answer: machine, held: false },
  });
  await refinement.click();
  const form = launchDialog();
  const { a, none, c } = await choices(form);
  await c.click();
  await a.click();
  none.element().focus();
  await userEvent.keyboard(" ");
  await expect.element(none).toBeChecked();
  await expect.element(a).not.toBeChecked();
  await expect.element(c).toBeChecked();
  await form.start.click();
  await expect.element(form.dialog).not.toBeInTheDocument();
  expect(start).toHaveBeenCalledExactlyOnceWith(
    project.id,
    entry,
    "refinement",
    expect.objectContaining({ host: "claude", options: ["--c"] }),
    expect.any(Function),
  );
});

test("a held initial read disables refinement and a held host reread submits no options", async () => {
  const { refinement, show, start } = await mountStoryLaunches(entry, {
    offerRead: { answer: machine, held: true },
  });
  await expect.element(refinement).toBeDisabled();
  show(entry);
  await expect.element(refinement).toBeEnabled();
  await refinement.click();
  const form = launchDialog();
  const { c } = await choices(form);
  await expect.element(c).not.toBeChecked();
  await form.host.selectOptions("codex");
  await form.host.selectOptions("claude");
  await expect.element(form.dialog.getByText("Reading options…")).toBeVisible();
  await expect.element(form.options).not.toBeInTheDocument();
  await expect.element(optionsGroup(form)).not.toBeInTheDocument();

  await form.start.click();
  await expect.element(form.dialog).not.toBeInTheDocument();
  expect(start).toHaveBeenCalledExactlyOnceWith(
    project.id,
    entry,
    "refinement",
    expect.objectContaining({ host: "claude" }),
    expect.any(Function),
  );
  expect(start.mock.calls[0]?.[3]).not.toHaveProperty("options");
});

test("Cancel clears the retained choices from a refused refinement", async () => {
  const { refinement, start } = await mountStoryLaunches(entry, {
    offerRead: { answer: machine, held: false },
  });
  start.mockResolvedValueOnce(false);
  const form = launchDialog();
  await refinement.click();
  const selected = await choices(form);
  await selected.a.click();
  await selected.c.click();
  await form.start.click();
  await expect.element(form.dialog).not.toBeInTheDocument();
  expect(start).toHaveBeenCalledExactlyOnceWith(
    project.id,
    entry,
    "refinement",
    expect.objectContaining({ options: ["--a", "--c"] }),
    expect.any(Function),
  );

  await refinement.click();
  const kept = await choices(form);
  await expect.element(kept.a).toBeChecked();
  await expect.element(kept.c).toBeChecked();
  await form.cancel.click();
  await expect.element(form.dialog).not.toBeInTheDocument();
  await refinement.click();
  const cleared = await choices(form);
  await expect.element(cleared.a).not.toBeChecked();
  await expect.element(cleared.c).not.toBeChecked();
  await expect.element(cleared.none).toBeChecked();
  expect(start).toHaveBeenCalledTimes(1);
});
