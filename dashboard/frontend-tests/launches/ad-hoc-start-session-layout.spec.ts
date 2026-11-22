import { createElement } from "react";
import { expect, test, vi } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import type { SessionPolicyOffer } from "../../src/launchOffers.ts";
import { StartSession } from "../../src/StartSession.tsx";
import { mountComponent } from "../../test-support/component-mount/mountComponent.ts";
import {
  adHocLaunches,
  followsTabOrder,
  launchDialog,
  startSession,
} from "./ad-hoc-launch-page.ts";
import {
  box,
  controlsAreReachable,
  narrowDialog,
  noSidewaysScroll,
  textFitsViewport,
  twiceZoomedDialog,
  useTwiceZoomedDevice,
} from "./launch-layout-page.ts";

async function open(offer: SessionPolicyOffer, viewport = twiceZoomedDialog) {
  const project = makeMe.aPublishedSource.pygardon.please();
  await mountComponent(
    createElement(StartSession, {
      project: project.label,
      sourceId: project.id,
      launches: adHocLaunches(offer),
      presentTerminal: vi.fn(),
    }),
    { viewport },
  );
  await startSession(project.label).click();
  const form = launchDialog();
  await expect.element(form.instruction).toHaveFocus();
  return form;
}

test("Start session tabs from instruction through session choices and closed command details to Start", async () => {
  const form = await open("offered");
  const where = form.dialog.getByText(
    "The session runs in this project's folder on default main, with its existing changes.",
    { exact: true },
  );
  await expect.element(where).not.toBeVisible();
  await followsTabOrder([
    form.dialog.getByRole("button", { name: "Record", exact: true }),
    form.dialog.getByRole("button", { name: "Attach images" }),
    form.host,
    form.model,
    form.effort,
    form.dialog.getByRole("radio", { name: "Default main" }),
    form.dialog.getByRole("radio", { name: "Wait for review" }),
    form.command,
    form.cancel,
    form.start,
  ]);
  await form.command.click();
  await expect.element(where).toBeVisible();
  await expect
    .element(form.dialog.element().querySelector("code"))
    .not.toBeInTheDocument();
});

const lands =
  "verified results land on origin without another review. Pressing Start authorizes that push.";
const effect = {
  "Default main": `Default main · Automatically land The session runs in this project's folder on default main, with its existing changes; ${lands}`,
  "Isolated workspace": `Isolated workspace · Automatically land The session runs in a new workspace under .worktrees/; ${lands}`,
};

async function offeredChoicesFit(
  viewport: typeof narrowDialog,
  wrapped: boolean,
) {
  const { dialog, command, start, cancel } = await open("offered", viewport);
  const workspace = ["Isolated workspace", "Default main"] as const;
  const afterChecks = ["Wait for review", "Automatically land"] as const;
  const radio = (name: string) => dialog.getByRole("radio", { name });
  await radio(afterChecks[1]).click();
  await command.click();
  await expect
    .element(
      dialog.getByText(/Its first message carries the established session/),
    )
    .toBeVisible();
  for (const [first, second] of [workspace, afterChecks]) {
    const one = box(radio(first));
    const other = box(radio(second));
    if (wrapped) expect(other.top).toBeGreaterThan(one.top);
    else expect(other.top).toBe(one.top);
  }
  expect(box(radio(afterChecks[0])).top).toBeGreaterThan(
    box(radio(workspace[1])).top,
  );
  for (const chosen of workspace) {
    await radio(chosen).click();
    await expect.element(start).toHaveAccessibleDescription(effect[chosen]);
    noSidewaysScroll(dialog);
    controlsAreReachable(dialog);
    await expect.element(start).toBeInViewport({ ratio: 1 });
    await expect.element(cancel).toBeInViewport({ ratio: 1 });
    await expect
      .element(dialog.getByText(/Pressing Start authorizes that push/))
      .toBeInViewport({ ratio: 1 });
  }
}

test("Start session wraps both choices at 320 pixels, with automatic landing effects and actions in view", async () => {
  await offeredChoicesFit(narrowDialog, true);
});

test("Start session fits both workspace choices and automatic landing at 200% zoom", async () => {
  await useTwiceZoomedDevice();
  await offeredChoicesFit(twiceZoomedDialog, false);
});

async function unavailableChoicesFit(viewport: typeof narrowDialog) {
  const { dialog, start, cancel } = await open("unavailable", viewport);
  const why = dialog.getByText(
    "Isolated workspace and Automatically land are not offered: the installed skills in this project do not establish a session without a story for this host.",
  );
  await expect.element(why).toBeVisible();
  why.element().scrollIntoView({ block: "center" });
  textFitsViewport(why);
  expect(box(why).left).toBeGreaterThanOrEqual(box(dialog).left);
  expect(box(why).right).toBeLessThanOrEqual(box(dialog).right);
  for (const name of ["Isolated workspace", "Automatically land"])
    await expect.element(dialog.getByRole("radio", { name })).toBeDisabled();
  noSidewaysScroll(dialog);
  controlsAreReachable(dialog);
  for (const action of [cancel, start]) {
    await expect.element(action).toBeEnabled();
    await expect.element(action).toBeInViewport({ ratio: 1 });
  }
}

test("Start session explains unavailable choices without clipping them at 320 pixels", async () => {
  await unavailableChoicesFit(narrowDialog);
});

test("Start session explains unavailable choices and keeps both actions reachable at 200% zoom", async () => {
  await useTwiceZoomedDevice();
  await unavailableChoicesFit(twiceZoomedDialog);
});
