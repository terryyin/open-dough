import { createElement } from "react";
import { expect, onTestFinished, test } from "vitest";
import { page, userEvent } from "vitest/browser";
import refinementOptions from "../../../Distribution/src/skills/dough-story-refinement/references/refinement-options.json";
import {
  offeredShape,
  optionsDefinitionSchema,
} from "../../src/commandOptions.ts";
import { StartLaunch } from "../../src/StartLaunch.tsx";
import { mountComponent } from "../../test-support/component-mount/mountComponent.ts";
import { painted } from "../../test-support/composedColours.ts";
import { browserSession } from "../review/browser-session.ts";
import {
  controlContrast,
  decorativeIcon,
  expectDocumentStill,
  focusStops,
  narrowViewport,
  textContrast,
  visibleParts,
} from "./board-accessibility.ts";
import { mountBoardFrame } from "./board-frame-mount.ts";
import { noSessions } from "./board-mount.ts";
import { boardWork, story } from "./board-work.ts";

const wideViewport = { width: 1440, height: 900 };
const sessionZoom = { width: 640, height: 450 };

function readableLaunchDialog(dialog: Element) {
  const text = visibleParts(dialog, "h2, p, label, legend, summary");
  const controls = visibleParts(dialog, "button, select, textarea");
  expect(text.length).toBeGreaterThan(0);
  expect(controls.length).toBeGreaterThan(0);
  for (const words of text) textContrast(words);
  for (const control of controls) {
    textContrast(control);
    if (!control.matches(":disabled")) controlContrast(control);
  }
}

test("Start refinement's fields, disclosures, and footer read clearly, with Start the filled action", async () => {
  const work = story(
    "Keep the full title of a long story in its refinement dialog with options and command details open: Supercalifragilisticexpialidocious-session-options-with-an-unbroken-name",
    413,
  );
  await mountComponent(
    createElement(StartLaunch, {
      work,
      sourceId: "open-dough",
      workflow: "refinement",
      establishesStart: false,
      options: {
        kind: "offered",
        ...offeredShape(optionsDefinitionSchema.parse(refinementOptions)),
      },
      note: undefined,
      attempt: undefined,
      onStart: () => Promise.resolve(false),
    }),
    { viewport: wideViewport },
  );
  await page.getByRole("button", { name: "Start refinement" }).click();
  const dialog = page.getByRole("dialog", {
    name: "Start refinement in Claude Code",
  });
  await expect.element(dialog.getByText(work.title)).toBeVisible();
  await expect
    .element(dialog.getByRole("textbox", { name: "Instruction (optional)" }))
    .toBeVisible();
  await dialog
    .getByText("Refinement options None selected", { exact: true })
    .click();
  await dialog.getByText("Command details", { exact: true }).click();
  await expect.element(dialog.getByText(/Sent after/)).toBeVisible();
  const disclosures = visibleParts(dialog.element(), "summary");
  expect(disclosures.length).toBeGreaterThanOrEqual(2);
  for (const summary of disclosures) decorativeIcon(summary);
  readableLaunchDialog(dialog.element());

  const start = dialog.getByRole("button", { name: "Start", exact: true });
  const cancel = dialog.getByRole("button", { name: "Cancel", exact: true });
  await expect.element(start).toBeEnabled();
  const startFill = getComputedStyle(start.element()).backgroundColor;
  expect(painted(startFill)).toBe(true);
  expect(startFill).not.toBe(
    getComputedStyle(cancel.element()).backgroundColor,
  );
});

function fitsClippingAncestors(control: Element) {
  const bounds = control.getBoundingClientRect();
  const scrollable = (overflow: string) =>
    overflow === "auto" || overflow === "scroll";
  for (
    let parent = control.parentElement;
    parent !== null;
    parent = parent.parentElement
  ) {
    const { overflowX, overflowY } = getComputedStyle(parent);
    const clip = parent.getBoundingClientRect();
    if (
      overflowX !== "visible" &&
      (bounds.left < clip.left - 1 ||
        bounds.right > clip.right + 1 ||
        (!scrollable(overflowX) && parent.scrollWidth > parent.clientWidth + 1))
    )
      return false;
    if (
      overflowY !== "visible" &&
      (bounds.top < clip.top - 1 ||
        bounds.bottom > clip.bottom + 1 ||
        (!scrollable(overflowY) &&
          parent.scrollHeight > parent.clientHeight + 1))
    )
      return false;
    if (parent.matches(":modal")) break;
  }
  return (
    bounds.left >= -1 &&
    bounds.right <= innerWidth + 1 &&
    bounds.top >= -1 &&
    bounds.bottom <= innerHeight + 1 &&
    control.contains(
      document.elementFromPoint(
        (bounds.left + bounds.right) / 2,
        (bounds.top + bounds.bottom) / 2,
      ),
    )
  );
}

async function startSessionReadsAt(viewport: {
  width: number;
  height: number;
}) {
  await mountBoardFrame(boardWork([]), viewport, "stories", {
    ...noSessions,
    sessionPolicyOffer: () => "unavailable",
  });
  await page
    .getByRole("button", { name: "Start session in Open Dough" })
    .click();
  const dialog = page.getByRole("dialog", {
    name: "Start a session in Open Dough in Claude Code",
  });
  await expect.element(dialog).toBeVisible();
  const prompt = dialog.getByRole("textbox", {
    name: "What would you like to talk about? (optional)",
  });
  await expect.element(prompt).toHaveFocus();
  await expect
    .element(
      dialog.getByText(
        /the installed skills in this project do not establish a session without a story for this host/,
      ),
    )
    .toBeVisible();

  const shown = dialog.element();
  expectDocumentStill();
  expect(shown.scrollWidth).toBeLessThanOrEqual(shown.clientWidth + 1);
  const controls = visibleParts(
    shown,
    "button, input, select, textarea, summary",
  );
  expect(controls.length).toBeGreaterThan(0);
  for (const control of controls) {
    control.scrollIntoView({ block: "center" });
    await expect
      .poll(() => ({
        control:
          control.getAttribute("aria-label") ?? control.textContent.trim(),
        reachable: fitsClippingAncestors(control),
      }))
      .toMatchObject({ reachable: true });
  }
  expectDocumentStill();
  readableLaunchDialog(shown);
  const start = dialog.getByRole("button", { name: "Start", exact: true });
  const cancel = dialog.getByRole("button", { name: "Cancel", exact: true });
  await cancel.click();
  const launcher = page.getByRole("button", {
    name: "Start session in Open Dough",
  });
  await expect.element(launcher).toHaveFocus();
  await userEvent.keyboard("{Enter}");
  await expect.element(prompt).toHaveFocus();
  const reached = [
    document.activeElement,
    ...(await focusStops("{Tab}".repeat(controls.length))).map(
      ({ element }) => element,
    ),
  ];
  for (const action of [prompt, cancel, start])
    expect(reached).toContain(action.element());
}

test("at a narrow window Start session keeps every control reachable and readable without sideways scrolling", async () => {
  expect(window.devicePixelRatio).toBe(1);
  await startSessionReadsAt(narrowViewport);
});

test("at 200% zoom Start session keeps every control reachable and readable without sideways scrolling", async () => {
  const browser = browserSession();
  onTestFinished(async () => {
    await browser.send("Emulation.clearDeviceMetricsOverride");
  });
  await browser.send("Emulation.setDeviceMetricsOverride", {
    width: 0,
    height: 0,
    deviceScaleFactor: 2,
    mobile: false,
  });
  expect(window.devicePixelRatio).toBe(2);
  await startSessionReadsAt(sessionZoom);
});
