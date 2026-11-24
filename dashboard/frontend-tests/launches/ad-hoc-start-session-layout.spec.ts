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
  zoomToTwoHundredPercent,
} from "./launch-layout-page.ts";

async function open(
  offer: SessionPolicyOffer,
  mountOptions?: Parameters<typeof mountComponent>[1],
) {
  const project = makeMe.aPublishedSource.pygardon.please();
  await mountComponent(
    createElement(StartSession, {
      project: project.label,
      sourceId: project.id,
      launches: adHocLaunches(offer),
      presentTerminal: vi.fn(),
    }),
    mountOptions,
  );
  await startSession(project.label).click();
  const form = launchDialog();
  await expect.element(form.instruction).toHaveFocus();
  return form;
}

test("Start session tabs from instruction through session choices and closed command details to Start", async () => {
  const form = await open("offered");
  const where = form.dialog.getByText(
    "The session runs in this project's execution checkout, with its existing changes.",
    { exact: true },
  );
  await expect.element(where).not.toBeVisible();
  await expect.element(form.options).not.toBeInTheDocument();
  await followsTabOrder([
    form.dialog.getByRole("button", { name: "Record", exact: true }),
    form.dialog.getByRole("button", { name: "Attach images" }),
    form.host,
    form.model,
    form.effort,
    form.dialog.getByRole("radio", { name: "Execution checkout" }),
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
  "Execution checkout": `Execution checkout · Automatically land The session runs in this project's execution checkout, with its existing changes; ${lands}`,
  "Isolated workspace": `Isolated workspace · Automatically land The session runs in a new workspace under .worktrees/; ${lands}`,
};

test("both workspace policies keep the automatic landing actions in view when narrow or zoomed", async () => {
  const { dialog, command, start, cancel } = await open("offered", {
    viewport: narrowDialog,
  });
  const workspace = ["Isolated workspace", "Execution checkout"] as const;
  const afterChecks = ["Wait for review", "Automatically land"] as const;
  const radio = (name: string) => dialog.getByRole("radio", { name });
  await radio(afterChecks[1]).click();
  await command.click();
  await expect
    .element(
      dialog.getByText(/Its first message carries the established session/),
    )
    .toBeVisible();
  const pairsWrap = (wrapped: boolean) =>
    [workspace, afterChecks].map(([first, second]) =>
      wrapped
        ? box(radio(second)).top > box(radio(first)).top
        : box(radio(second)).top === box(radio(first)).top,
    );
  const workspaceFits = async (chosen: (typeof workspace)[number]) => {
    await expect.element(start).toHaveAccessibleDescription(effect[chosen]);
    noSidewaysScroll(dialog);
    controlsAreReachable(dialog);
    await expect.element(start).toBeInViewport({ ratio: 1 });
    await expect.element(cancel).toBeInViewport({ ratio: 1 });
    await expect
      .element(dialog.getByText(/Pressing Start authorizes that push/))
      .toBeInViewport({ ratio: 1 });
  };
  const choicesFit = async (wrapped: boolean) => {
    await expect.poll(() => pairsWrap(wrapped)).toEqual([true, true]);
    expect(box(radio(afterChecks[0])).top).toBeGreaterThan(
      box(radio(workspace[1])).top,
    );
  };

  await choicesFit(true);
  await workspaceFits("Execution checkout");
  await radio("Isolated workspace").click();
  await workspaceFits("Isolated workspace");

  await zoomToTwoHundredPercent();
  await choicesFit(false);
  await workspaceFits("Isolated workspace");
  await radio("Execution checkout").click();
  await workspaceFits("Execution checkout");
});

test("Start session explains unavailable choices without clipping them and keeps both actions reachable at 320 pixels and at 200% zoom", async () => {
  const { dialog, start, cancel } = await open("unavailable", {
    viewport: narrowDialog,
  });
  const why = dialog.getByText(
    "Isolated workspace and Automatically land are not offered: the installed skills in this project do not establish a session without a story for this host.",
  );
  for (const name of ["Isolated workspace", "Automatically land"])
    await expect.element(dialog.getByRole("radio", { name })).toBeDisabled();
  const explanationAndActionsFit = async () => {
    await expect.element(why).toBeVisible();
    why.element().scrollIntoView({ block: "center" });
    textFitsViewport(why);
    expect(box(why).left).toBeGreaterThanOrEqual(box(dialog).left);
    expect(box(why).right).toBeLessThanOrEqual(box(dialog).right);
    noSidewaysScroll(dialog);
    controlsAreReachable(dialog);
    for (const action of [cancel, start]) {
      await expect.element(action).toBeEnabled();
      await expect.element(action).toBeInViewport({ ratio: 1 });
    }
  };
  await explanationAndActionsFit();
  await zoomToTwoHundredPercent();
  await explanationAndActionsFit();
});
