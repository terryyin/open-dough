import { expect, onTestFinished, test } from "vitest";
import { page, userEvent, type Locator } from "vitest/browser";
import { boardWork } from "../navigation/board-work.ts";
import { expectServedBrandAsset } from "../navigation/frame-brand-asset.ts";
import {
  controlContrast,
  readsWhole,
  textContrast,
  visibleParts,
} from "../navigation/board-accessibility.ts";
import {
  enableSettingsTouch,
  readSettingText,
  resizeSettingsViewport,
  settingsPhoneViewports,
  tapSettingWhereShown,
} from "./system-settings-browser.ts";
import {
  backToDashboard,
  openSystemSettings,
  settingsButton,
  settingsHeading,
  settingsRegion,
} from "./system-settings-controls.ts";
import {
  mountSettingsFrame,
  projectFacts,
  settingsWork,
} from "./system-settings-frame.ts";
import { clippedSettingContent } from "./system-settings-reading.ts";

const general = page.getByRole("main").filter({ has: settingsHeading });
const groupNames = ["Projects", "OpenAI", "Terminal theme"] as const;
const texts = "h2, h3, p, dt, dd, label, [role='alert']";
const choice = settingsRegion("Terminal theme").getByRole("combobox", {
  name: "Terminal theme",
});

async function expectReadySettings() {
  await expect.element(settingsHeading).toHaveFocus();
  await expect
    .element(settingsRegion("OpenAI").getByRole("status"))
    .toHaveTextContent("API key: Not configured");
  await expect.element(choice).toBeEnabled();
}

function expectReadingContrast(area: Element) {
  for (const text of visibleParts(area, texts)) textContrast(text);
  const controls = visibleParts(area, "button, input, select");
  expect(controls.length).toBeGreaterThan(0);
  for (const control of controls) {
    if (!control.matches('input[type="password"]')) textContrast(control);
    if (!control.matches(":disabled")) controlContrast(control);
  }
}

function expectWholeWidth(area: Locator) {
  expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(innerWidth);
  for (const element of visibleParts(area.element(), texts)) {
    expect(readsWhole(element), element.textContent).toBe(true);
    const { left, right } = element.getBoundingClientRect();
    expect(left, element.textContent).toBeGreaterThanOrEqual(-0.5);
    expect(right, element.textContent).toBeLessThanOrEqual(innerWidth + 0.5);
  }
}

async function expectProductMark(proveBytes = false) {
  const mark = general.getByRole("img", { name: "Open Dough", exact: true });
  await expect.element(mark).toBeVisible();
  const image = mark.element() as HTMLImageElement;
  await expect.poll(() => image.complete && image.naturalWidth > 0).toBe(true);
  expect(new URL(image.currentSrc).pathname).toMatch(/^\/icon-\d+\.png$/);
  expect(image.naturalWidth).toBe(image.naturalHeight);
  const { x, y, width, height } = image.getBoundingClientRect();
  expect(width).toBeCloseTo(height, 1);
  expect(width).toBeGreaterThanOrEqual(16);
  expect(width * 2).toBeLessThanOrEqual(image.naturalWidth);
  expect(clippedSettingContent(image, "control")).toEqual([]);
  const main = general.element().getBoundingClientRect();
  expect(x).toBeGreaterThanOrEqual(main.left);
  expect(x + width).toBeLessThanOrEqual(main.right);
  expect(y).toBeGreaterThanOrEqual(main.top);
  expect(y + height).toBeLessThanOrEqual(main.bottom);
  expect(document.elementFromPoint(x + width / 2, y + height / 2)).toBe(image);
  expect(image.tabIndex).toBe(-1);
  expect(
    image.closest("a, button, summary, label, [role], [tabindex]"),
  ).toBeNull();
  if (proveBytes) await expectServedBrandAsset(image.currentSrc, "productMark");
}

test("headed settings share one readable column and their project dialogs fit the narrow window", async () => {
  await mountSettingsFrame({ width: 1440, height: 900 });
  await openSystemSettings();
  await expectReadySettings();
  await expectProductMark(true);
  textContrast(backToDashboard.element());
  controlContrast(backToDashboard.element());
  const [projects] = groupNames;
  const first = settingsRegion(projects).element().getBoundingClientRect();
  for (const name of groupNames) {
    const group = settingsRegion(name);
    await expect
      .element(group.getByRole("heading", { level: 2, name, exact: true }))
      .toBeVisible();
    expectReadingContrast(group.element());
    const rect = group.element().getBoundingClientRect();
    expect(rect.x).toBeCloseTo(first.x, 0);
    expect(rect.width).toBeCloseTo(first.width, 0);
  }
  await resizeSettingsViewport({ width: 420, height: 900 });
  await expectProductMark();
  expect(clippedSettingContent(backToDashboard.element(), "control")).toEqual(
    [],
  );
  expectWholeWidth(general);
  for (const [opener, title, focus] of [
    ["Add project", "Add project", "GitHub URL"],
    ["Remove project Doughnut", "Remove Doughnut?", "Cancel"],
  ] as const) {
    await userEvent.click(
      page.getByRole("button", { name: opener, exact: true }),
    );
    const dialog = page.getByRole("dialog", { name: title, exact: true });
    const role = focus === "Cancel" ? "button" : "textbox";
    await expect
      .element(dialog.getByRole(role, { name: focus, exact: true }))
      .toHaveFocus();
    expectReadingContrast(dialog.element());
    expectWholeWidth(dialog);
    expect(clippedSettingContent(dialog.element(), "control")).toEqual([]);
    await userEvent.click(
      dialog.getByRole("button", { name: "Cancel", exact: true }),
    );
    await expect.element(dialog).not.toBeInTheDocument();
  }
  expectWholeWidth(general);
});

test("long configured facts wrap at 360 pixels and at 200 percent zoom with keyboard return", async () => {
  const localPath = `/work/${"long-checkout-directory/".repeat(10)}project`;
  const work = boardWork([], { id: "long-project", label: "Long Project" });
  const project = {
    ...work,
    source: {
      ...work.source,
      repository: `example/${"long-repository-name-".repeat(8)}project`,
    },
  };
  await mountSettingsFrame({ width: 360, height: 800 }, [project], {
    facts: [projectFacts(project, { localPath })],
  });
  (settingsButton.element() as HTMLElement).focus();
  await userEvent.keyboard("{Enter}");
  await expectReadySettings();
  const row = settingsRegion("Projects").getByRole("listitem");
  await expect.element(row.getByText(localPath, { exact: true })).toBeVisible();
  expectWholeWidth(general);
  const root = document.documentElement;
  const zoom = root.style.zoom;
  onTestFinished(() => {
    root.style.zoom = zoom;
  });
  await resizeSettingsViewport({ width: 720, height: 1000 });
  root.style.zoom = "2";
  expectWholeWidth(general);
  (backToDashboard.element() as HTMLElement).focus();
  await userEvent.keyboard("{Enter}");
  await expect.element(settingsButton).toHaveFocus();
});

test("phone touch reads machine-local facts and returns from the last group after rotation", async () => {
  const [first, doughnut] = settingsWork;
  const local = projectFacts(first, {
    clientConfiguration: { status: "unreadable" },
  });
  const { portrait, landscape } = settingsPhoneViewports;
  const sources = await mountSettingsFrame(portrait, [doughnut, first], {
    view: "roster",
    facts: [local, projectFacts(doughnut)],
  });
  await enableSettingsTouch();
  await tapSettingWhereShown(settingsButton);
  await expectReadySettings();
  await expectProductMark();
  const projects = settingsRegion("Projects");
  const firstRow = projects.getByRole("listitem").filter({
    has: page.getByRole("heading", { name: "Open Dough", exact: true }),
  });
  await expect.element(firstRow).toBeVisible();
  for (const fact of firstRow.element().querySelectorAll("h3, dt, dd")) {
    await readSettingText(page.elementLocator(fact));
  }
  expect(
    [...firstRow.element().querySelectorAll("dd")].map(
      (fact) => fact.textContent,
    ),
  ).toEqual([
    first.source.repository,
    local.localPath,
    "The Client configuration could not be read from this project's execution checkout.",
  ]);
  await expect
    .element(
      projects.getByText(
        "Configure projects for this dashboard on this machine.",
      ),
    )
    .toBeVisible();
  await readSettingText(settingsRegion("OpenAI").getByRole("status"));
  const theme = settingsRegion("Terminal theme");
  const themeHeading = theme.getByRole("heading", { level: 2 });
  await readSettingText(themeHeading);
  await readSettingText(
    theme.getByText(
      /^Choose the colours embedded terminals use on this machine\./,
    ),
  );
  const figure = theme.getByRole("figure");
  await expect.element(figure).toBeVisible();
  const sample = figure.element().querySelector("pre");
  if (!sample) throw new Error("The terminal sample is missing its text.");
  await readSettingText(page.elementLocator(sample));
  expect(sample.textContent).toContain("All checks passed.");
  expectWholeWidth(general);
  for (const viewport of [landscape, portrait]) {
    await resizeSettingsViewport(viewport);
    await readSettingText(themeHeading);
    expectWholeWidth(general);
  }
  await tapSettingWhereShown(backToDashboard);
  await expect
    .element(page.getByRole("heading", { name: "Agent roster", exact: true }))
    .toBeVisible();
  await expect.element(settingsButton).toHaveFocus();
  expect(new URLSearchParams(location.search).get("project")).toBe("doughnut");
  for (const write of [
    sources.projects.add,
    sources.projects.remove,
    sources.projects.setHidden,
    sources.openAI.save,
    sources.openAI.remove,
    sources.terminalTheme.save,
  ])
    expect(write).not.toHaveBeenCalled();
});
