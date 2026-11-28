// Project Intent's view tabs (../../src/IntentTabs.tsx): arrow keys, Home and
// End choose the view. A file read before Optimization Candidates is still
// selected and read until CI status
// itself is activated (../../src/IntentPage.tsx). Activation within a story's
// or the project's scope: ./intent-home-activation-scope.spec.ts.

import { expect, test } from "vitest";
import { userEvent } from "vitest/browser";
import { intentViewTab } from "./intent-candidates-page.ts";
import {
  expectFileRead,
  fileControl,
  intentReadsRecording,
  selectBrowsedFile,
} from "./intent-browsed-file-page.ts";
import { activateChosenCiTab, workOf } from "./intent-ci-homepage-page.ts";
import { mountIntentCiPage } from "./intent-ci-page-mount.ts";
import {
  inertCiReads,
  judgedStatus,
  openDoughSource,
} from "./intent-ci-status-fixtures.ts";
import { intentCiStatus } from "./intent-ci-status-page.ts";

const ci = intentCiStatus();
const ciTab = intentViewTab("CI status");
const candidates = intentViewTab("Optimization Candidates");

// Project Intent's CI status passing on main, with the browsed spec read.
async function readPassingHome() {
  await mountIntentCiPage({
    work: workOf(openDoughSource, "a1b2c3d"),
    reads: {
      intent: intentReadsRecording([]),
      ci: inertCiReads({
        readStatus: () =>
          Promise.resolve(judgedStatus("main", "pass", "a1b2c3d", "Add login")),
      }),
    },
  });
  await ci.answers("Passed at a1b2c3d (Add login)");
  await selectBrowsedFile();
}

test("arrow keys, Home and End choose CI status again with the file still read", async () => {
  await readPassingHome();

  for (const [away, back] of [
    ["ArrowRight", "ArrowLeft"],
    ["End", "Home"],
    ["ArrowLeft", "ArrowRight"],
  ] as const) {
    ciTab.element().focus();
    await userEvent.keyboard(`{${away}}`);
    await expect.element(candidates).toHaveAttribute("aria-selected", "true");
    await expect.element(candidates).toHaveFocus();
    await userEvent.keyboard(`{${back}}`);
    await expect.element(ciTab).toHaveAttribute("aria-selected", "true");
    await expect.element(ciTab).toHaveFocus();
    await expectFileRead();
  }
});

test("activating CI status from Optimization Candidates returns home", async () => {
  await readPassingHome();
  await userEvent.click(candidates);
  await expect.element(candidates).toHaveAttribute("aria-selected", "true");

  await activateChosenCiTab("click");

  await ci.answers("Passed at a1b2c3d (Add login)");
  await expect.element(fileControl()).toHaveAttribute("aria-pressed", "false");
});
