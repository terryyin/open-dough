import { expect, test } from "vitest";
import { page, userEvent } from "vitest/browser";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import { pageReadsSupplying } from "../../test-support/component-mount/unreadPageReads.ts";
import { contrastRatio } from "../../test-support/composedColours.ts";
import {
  controlContrast,
  focusedAndVisible,
  paintedBackground,
  textContrast,
} from "../navigation/board-accessibility.ts";
import { mountBoardFrame } from "../navigation/board-frame-mount.ts";
import { boardReading as board } from "../navigation/board-reading-page.ts";
import {
  closeTerminal,
  openRecord,
  openSidebarSession,
  sessions,
  sidebar,
  terminal,
} from "../navigation/board-session-view.ts";
import { boardWork, story } from "../navigation/board-work.ts";
import { withWidthStorage } from "../navigation/side-panel-width-view.ts";
import {
  expectReadablePlainSource,
  highlightedSourceReading,
  intent,
  openHighlightedSource,
  openPlainSource,
  plainText,
  sourceReads,
} from "./system-appearance-source.ts";
import { settingsColourScheme } from "./system-settings-browser.ts";
import {
  backToDashboard,
  openSystemSettings,
  settingsHeading,
} from "./system-settings-controls.ts";
import { tokenColour } from "./system-settings-reading.ts";
import { settingsReplies } from "./system-settings-reads.ts";

const queued = [
  story("Run the ready work", 71),
  story("Refine the next work", 72),
];
const running = story("Read the active session", 73);

function expectSurface(scheme: "dark" | "light") {
  const root = document.documentElement;
  const surface = tokenColour(root, "--surface");
  const text = tokenColour(root, "--text");
  expect(getComputedStyle(root).backgroundColor).toBe(surface);
  expect(getComputedStyle(root).color).toBe(text);
  expect(contrastRatio(text, surface)).toBeGreaterThanOrEqual(4.5);
  if (scheme === "light") {
    expect(surface).toBe("rgb(246, 246, 243)");
    expect(text).toBe("rgb(29, 29, 27)");
  } else {
    expect(surface).not.toBe("rgb(246, 246, 243)");
  }
}

function expectNoAppearanceSwitch() {
  for (const role of ["button", "combobox", "switch"] as const) {
    expect(
      page
        .getByRole(role, {
          name: /^(dark mode|light mode|appearance|color scheme|dashboard theme)$/i,
        })
        .elements(),
    ).toHaveLength(0);
  }
}

test("system appearance changes frame chrome and Intent source without losing the reading place", async () => {
  withWidthStorage();
  const setScheme = settingsColourScheme();
  const reads: string[] = [];
  await setScheme("dark");
  const answer = makeMe.aMachineAnswer
    .observingOpen(openRecord(running))
    .please();
  await mountBoardFrame(
    boardWork(queued, { taken: [running] }),
    { width: 2400, height: 900 },
    "stories",
    { answer },
    {
      intentReads: sourceReads(reads),
      settingsSources: settingsReplies(),
      sessions: {
        ...pageReadsSupplying({}).sessions,
        readHostStatus: () =>
          Promise.resolve(
            makeMe.aHostStatus
              .with({ cpuPercent: null, freeBytes: null })
              .please(),
          ),
        openTerminal: () => ({
          binaryType: "arraybuffer",
          readyState: WebSocket.CONNECTING,
          send() {},
          close() {},
          addEventListener() {},
        }),
      },
    },
  );

  expectSurface("dark");
  for (const column of ["Backlog", "Taken"] as const) {
    const heading = board
      .column(column)
      .getByRole("heading", { name: column, exact: true });
    await expect.element(heading).toBeVisible();
    textContrast(heading.element());
  }
  for (const { title } of queued) {
    const heading = board
      .column("Backlog")
      .getByRole("article", { name: title })
      .getByRole("heading");
    await expect.element(heading).toBeVisible();
    textContrast(heading.element());
  }
  const start = page.getByRole("button", {
    name: "Start session in Open Dough",
  });
  textContrast(start.element());
  controlContrast(start.element());
  (start.element() as HTMLElement).focus();
  focusedAndVisible(start.element());
  expect(
    contrastRatio(
      getComputedStyle(start.element()).outlineColor,
      paintedBackground(start.element().parentElement),
    ),
  ).toBeGreaterThanOrEqual(3);
  await userEvent.click(start);
  const dialog = page.getByRole("dialog");
  await expect.element(dialog).toBeVisible();
  textContrast(dialog.getByRole("heading").element());
  controlContrast(
    dialog.getByRole("button", { name: "Start", exact: true }).element(),
  );
  await userEvent.keyboard("{Escape}");
  await expect.element(dialog).not.toBeInTheDocument();

  await page.getByRole("button", { name: "Preparation badge legend" }).click();
  await expect
    .element(dialog.getByRole("heading", { name: "Preparation badges" }))
    .toBeVisible();
  for (const label of ["Not refined", "Ready for execution", "Slice planned"]) {
    textContrast(dialog.getByText(label, { exact: true }).element());
  }
  await userEvent.keyboard("{Escape}");
  await openSystemSettings();
  textContrast(settingsHeading.element());
  expectNoAppearanceSwitch();
  await userEvent.click(backToDashboard);
  await expect.element(settingsHeading).not.toBeInTheDocument();

  await userEvent.click(sessions);
  const sessionsHeading = sidebar.getByRole("heading", {
    name: "Sessions",
    exact: true,
  });
  await expect.element(sessionsHeading).toBeVisible();
  textContrast(sessionsHeading.element());
  await userEvent.click(sessions);
  await expect.element(sidebar).not.toBeInTheDocument();

  await userEvent.click(sessions);
  await openSidebarSession(running.title);
  const panelHeading = terminal.getByRole("heading", {
    name: running.title,
    exact: true,
  });
  if (!sidebar.query()?.checkVisibility()) await userEvent.click(sessions);
  await expect.element(sessionsHeading).toBeVisible();

  const intentChoice = page.getByRole("radio", { name: "Intent", exact: true });
  const development = page.getByRole("radio", {
    name: "Development",
    exact: true,
  });
  await userEvent.click(intentChoice);
  await intent
    .getByRole("button", { name: "Project Intent", exact: true })
    .click();
  const source = highlightedSourceReading(await openHighlightedSource(), {
    keyword: /^export$/,
    comment: /greets the reader/,
  });
  const expectedSource = 'export const message = "hello";';
  await source.expectText(expectedSource);
  const darkTokens = await source.visibleTokens();
  textContrast(darkTokens.keyword);
  textContrast(darkTokens.comment);
  source.expectReadableLineNumber();
  const darkKeyword = getComputedStyle(darkTokens.keyword).color;

  expectReadablePlainSource(await openPlainSource(), plainText);

  await openHighlightedSource();
  const tokens = await source.visibleTokens();
  const fileReadsBefore = [...reads];
  for (const scheme of ["light", "dark"] as const) {
    await setScheme(scheme);
    await expect
      .poll(() => matchMedia(`(prefers-color-scheme: ${scheme})`).matches)
      .toBe(true);
    expectSurface(scheme);
    await expect
      .poll(() => {
        const radio = page
          .getByRole("radio", { name: "Open Dough", exact: true })
          .query();
        const compact = page
          .getByRole("button", { name: "Project", exact: true })
          .query();
        return (
          (radio instanceof HTMLInputElement && radio.checked) ||
          compact?.textContent.trim() === "Open Dough"
        );
      })
      .toBe(true);
    await expect.element(intentChoice).toBeChecked();
    await expect.element(development).not.toBeChecked();
    await expect.element(intent).toBeVisible();
    await expect.element(panelHeading).toBeVisible();
    textContrast(panelHeading.element());

    await expect.element(sessionsHeading).toBeVisible();
    textContrast(sessionsHeading.element());
    await source.expectText(expectedSource);
    expect(source.keyword()).toBe(tokens.keyword);
    const actual = getComputedStyle(tokens.keyword).color;
    if (scheme === "light") expect(actual).not.toBe(darkKeyword);
    else expect(actual).toBe(darkKeyword);
    textContrast(tokens.keyword);
    textContrast(tokens.comment);
    expect(reads).toEqual(fileReadsBefore);
  }
  expectNoAppearanceSwitch();
  await closeTerminal();
});
