import { expect, test } from "vitest";
import type { Locator } from "vitest/browser";
import { followsTabOrder } from "./ad-hoc-launch-page.ts";
import {
  box,
  controlsAreReachable,
  narrowDialog,
  noSidewaysScroll,
  zoomToTwoHundredPercent,
} from "./launch-layout-page.ts";
import { openRefinement, refinementChoices } from "./refinement-launch-page.ts";

const effect = "The session runs in this project's folder.";
const preview = (identity: string) => `/dough-story-refinement ${identity}`;

test("refinement tabs from the instruction through the closed disclosures to Start", async () => {
  const { form } = await openRefinement();
  const { dialog, host, model, effort, options, command, cancel } = form;
  await followsTabOrder([
    dialog.getByRole("button", { name: "Record", exact: true }),
    dialog.getByRole("button", { name: "Attach images" }),
    host,
    model,
    effort,
    dialog.getByRole("radio", { name: "Standard" }),
    options,
    command,
    cancel,
    form.start,
  ]);
});

test("the refinement options disclosure keeps its selection when collapsed", async () => {
  const {
    form: { dialog, options },
    work,
  } = await openRefinement();
  const explore = dialog.getByRole("checkbox", { name: "Explore" });
  const uxUi = dialog.getByRole("checkbox", { name: "UX/UI" });
  const code = dialog.getByRole("code", { includeHidden: true });
  await expect
    .element(options)
    .toHaveTextContent("Refinement options None selected");
  await expect.element(explore).not.toBeInTheDocument();
  await expect.element(code).not.toBeVisible();
  await expect.element(code).toHaveTextContent(preview(work.identity));

  await options.click();
  await uxUi.click();
  await explore.click();
  const selected = "Refinement options Explore, UX/UI (2)";
  await expect.element(options).toHaveTextContent(selected);
  await options.click();
  await expect.element(explore).not.toBeInTheDocument();
  await expect.element(options).toHaveTextContent(selected);
  await options.click();
  await expect.element(explore).toBeChecked();
  await expect.element(uxUi).toBeChecked();
});

function fitsWithActionsInView(form: {
  cancel: Locator;
  start: Locator;
  dialog: Locator;
}) {
  noSidewaysScroll(form.dialog);
  controlsAreReachable(form.dialog);
  return Promise.all(
    [
      form.cancel,
      form.start,
      form.dialog.getByText(effect, { exact: true }),
    ].map((control) => expect.element(control).toBeInViewport({ ratio: 1 })),
  );
}

test("a dense refinement dialog keeps its controls reachable when narrow or zoomed", async () => {
  const { form, work } = await openRefinement({ viewport: narrowDialog });
  const { host, model, options, command, dialog } = form;
  await expect.element(dialog.getByText(work.title)).toBeVisible();
  await expect
    .element(dialog.getByText(work.identity, { exact: true }))
    .toBeVisible();
  await expect
    .element(
      dialog.getByText(
        "Claude Code starts a background session on this machine to refine this story.",
      ),
    )
    .toBeVisible();
  await options.click();
  const choices = dialog.getByRole("group", { name: "Options", exact: true });
  await expect.element(choices).toBeVisible();
  for (const input of choices
    .element()
    .querySelectorAll<HTMLInputElement>('input[type="checkbox"]'))
    input.click();
  await command.click();
  const flags = refinementChoices.map(({ flag }) => flag).join(" ");
  await expect
    .element(dialog.getByRole("code", { includeHidden: true }))
    .toHaveTextContent(`${preview(work.identity)} ${flags}`);
  expect(options.element().textContent).toContain(
    `(${refinementChoices.length})`,
  );
  await expect.element(form.start).toHaveAccessibleDescription(effect);
  expect(box(host).top).toBeLessThan(box(model).top);
  await fitsWithActionsInView(form);

  await zoomToTwoHundredPercent();
  await expect.poll(() => box(model).top).toBe(box(host).top);
  expect(box(host).left).toBeLessThan(box(model).left);
  await fitsWithActionsInView(form);
});
