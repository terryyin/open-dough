// Changing perspective keeps sessions as they are
// (../../test-support/intentPerspectivePage.ts): a Sessions sidebar entry chosen from
// Intent opens its project's Development stories and its session, and the
// terminal, a covering one too, stays shown and attached once while the
// perspective changes beneath it; closing it keeps its story selected
// (ADR 0008). The machine's sessions read and the attached-terminal substitute
// stand in for the dashboard server and the agent.

import { expect, test } from "../../test-support/support/frontendApp.ts";
import { answerOwnPublications } from "../../test-support/support/frontendCatalogProjects.ts";
import { cardSession } from "../../test-support/support/frontendCardSessions.ts";
import { pygardonSource } from "../../test-support/support/frontendPublishedFixtures.ts";
import { installAttachedTerminalSubstitute } from "../../test-support/support/frontendTerminalSubstitute.ts";
import { echoingApplication } from "../../test-support/support/terminalSubstituteApplication.ts";
import {
  closeTerminal,
  terminalPanel,
  terminalScreenParts,
} from "../../test-support/terminalScreenPage.ts";
import {
  expectMembership,
  expectProjectChoice,
  parts,
} from "../../test-support/dashboardPage.ts";
import {
  expectAddress,
  expectNotConfiguredIntent,
} from "../../test-support/intentPerspectivePage.ts";
import { expectRoute } from "../../test-support/agentRosterRecords.ts";
import { takenIdentity, takenStory } from "../../test-support/launchJourney.ts";
import { openUntilRead } from "../../test-support/pageRequestNotes.ts";
import {
  pygardonBacklog,
  pygardonBacklogTitles,
  pygardonRevision,
  pygardonStory,
} from "../../test-support/pygardonProject.ts";
import { sessionsSidebarParts } from "../../test-support/sessionsSidebarPage.ts";
import {
  historyLength,
  keyboardInside,
  recordReveals,
  revealsOf,
} from "../../test-support/sessionNavigationJourney.ts";
import { expectCovering } from "../../test-support/sidePanelFrame.ts";
import { phoneLaunchTouchViewport } from "../../test-support/touchLaunchPage.ts";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";

const working = () => makeMe.aSessionState.loaded("working").please();

test("a Sessions sidebar entry from Intent goes to its project's Development stories and session, and the terminal stays attached across perspectives", async ({
  page,
  frontendServices,
}) => {
  await answerOwnPublications(page, frontendServices, [
    {
      ...pygardonSource,
      revision: pygardonRevision,
      files: { ".planning/PRODUCT-BACKLOG.md": pygardonBacklog },
    },
  ]);
  const pygardonSession = makeMe.anObservedLaunch
    .of(
      makeMe.aLaunchRecord
        .refining({ ...pygardonStory, source: pygardonSource.id })
        .please(),
    )
    .withSessionState(working())
    .please();
  frontendServices.answerMachine(
    makeMe.aMachineAnswer
      .observing(cardSession("Execution", takenStory, working()))
      .observing(pygardonSession)
      .please(),
  );
  const terminal = await installAttachedTerminalSubstitute(page, {
    application: echoingApplication("attached pygardon\r\n"),
  });
  await recordReveals(page);
  await openUntilRead(page);
  const { button, entries, entry } = sessionsSidebarParts(page);
  const { development, intent, intentChoice, backlog } = parts(page);
  const panel = terminalPanel(page);
  const { rows } = terminalScreenParts(panel);
  await intentChoice.click();
  await expect(intent).toBeVisible();
  await button.click();
  await expect(entries).toHaveCount(2);

  await test.step("from Open Dough's Intent, the Pygardon entry shows Pygardon's Development stories as one history entry and opens its session there", async () => {
    const before = await historyLength(page);
    await entry(pygardonStory.title).click();
    await expectProjectChoice(page, "Pygardon");
    await expect(development).toBeChecked();
    await expect(intent).toHaveCount(0);
    expect(new URL(page.url()).searchParams.get("perspective")).toBeNull();
    expectRoute(page, { project: "pygardon", view: null });
    expect(await historyLength(page)).toBe(before + 1);
    await expect(panel.getByRole("heading")).toHaveText(pygardonStory.title);
    await expect(rows).toContainText("attached pygardon");
    expect(await keyboardInside(page, "Terminal")).toBe(true);
    await expect(entry(pygardonStory.title)).toHaveAttribute(
      "aria-current",
      "true",
    );
    await expectMembership(page, { taken: [], backlog: pygardonBacklogTitles });
    const pygardonCard = backlog.getByRole("article", {
      name: pygardonStory.title,
    });
    await expect(pygardonCard).toBeInViewport();
    await expect(pygardonCard.getByText("Shown in terminal")).toBeVisible();
  });

  await test.step("Intent and back keep the terminal shown and attached once, with what was typed", async () => {
    await terminalScreenParts(panel).input.focus();
    await page.keyboard.type("before intent");
    await expect(rows).toContainText("before intent");
    await intentChoice.click();
    await expect(intent).toContainText(
      "No intent locations are configured for Pygardon.",
    );
    await expect(panel.getByRole("heading")).toHaveText(pygardonStory.title);
    await expect(rows).toContainText("before intent");
    await terminalScreenParts(panel).input.focus();
    await page.keyboard.type("during intent");
    await expect(rows).toContainText("during intent");
    await development.click();
    await expect(intent).toHaveCount(0);
    await expect(rows).toContainText("during intent");
    expect(terminal.attaches()).toBe(1);
  });

  await test.step("the entry already shown, chosen from the same project's Intent, still returns to Development and reveals its card without attaching again", async () => {
    await intentChoice.click();
    await expect(intent).toBeVisible();
    const before = await historyLength(page);
    const revealed = (await revealsOf(page)).length;
    await entry(pygardonStory.title).click();
    await expect(development).toBeChecked();
    await expect(intent).toHaveCount(0);
    expect(await historyLength(page)).toBe(before + 1);
    await expect
      .poll(async () => (await revealsOf(page)).length)
      .toBeGreaterThan(revealed);
    expect((await revealsOf(page)).at(-1)?.name).toBe(pygardonStory.title);
    await expect(
      backlog.getByRole("article", { name: pygardonStory.title }),
    ).toBeInViewport();
    expect(terminal.attaches()).toBe(1);
    await expect(entry(pygardonStory.title)).toHaveAttribute(
      "aria-current",
      "true",
    );
  });
});

test("a covering terminal at a phone width stays shown and attached while Back and Forward change the perspective beneath it, and Close shows the perspective the address names on the story it keeps selected", async ({
  page,
  frontendServices,
}) => {
  const { portrait } = phoneLaunchTouchViewport;
  await page.setViewportSize(portrait);
  Object.assign(frontendServices, {
    locations: { revision: frontendServices.revision, locations: null },
  });
  const launch = cardSession("Execution", takenStory, working());
  frontendServices.answerMachine(
    makeMe.aMachineAnswer.observing(launch).please(),
  );
  const terminal = await installAttachedTerminalSubstitute(page);
  await openUntilRead(page);
  const { development, intentChoice } = parts(page);
  // Development, Intent, then Development again, as history entries.
  await intentChoice.click();
  await expectNotConfiguredIntent(page, "Open Dough");
  await development.click();
  await expect(parts(page).intent).toHaveCount(0);

  const panel = terminalPanel(page);
  const { rows } = terminalScreenParts(panel);
  const { button, entry } = sessionsSidebarParts(page);
  await button.click();
  await entry(takenStory).click();
  await expectCovering(panel);
  await expect(rows).toContainText("attached");
  await terminalScreenParts(panel).input.focus();
  await page.keyboard.type("while covering");
  await expect(rows).toContainText("while covering");
  // The page beneath is hidden from roles while covered; its classes say
  // which perspective it shows.
  const intentBeneath = page.locator(".page-column .intent-perspective");

  await test.step("Back shows Intent beneath the covering terminal, which stays shown with its content", async () => {
    await page.goBack();
    expectAddress(page, { project: null, perspective: "intent" });
    await expect(intentBeneath).toHaveCount(1);
    await expectCovering(panel);
    await expect(panel.getByRole("heading")).toHaveText(takenStory);
    await expect(rows).toContainText("while covering");
  });

  await test.step("Forward and Back again keep the terminal covering and attached once", async () => {
    await page.goForward();
    expectAddress(page, { project: null, perspective: null });
    await expect(intentBeneath).toHaveCount(0);
    await expectCovering(panel);
    await page.goBack();
    await expect(intentBeneath).toHaveCount(1);
    await expectCovering(panel);
    await expect(rows).toContainText("while covering");
    expect(terminal.attaches()).toBe(1);
  });

  await test.step("Close shows Open Dough's Intent, as the address names, on the session's story it keeps selected", async () => {
    await closeTerminal(panel);
    const { intent } = parts(page);
    await expect(intentChoice).toBeChecked();
    await expectProjectChoice(page, "Open Dough");
    await expect(intent).toHaveAttribute("data-selected-story", takenIdentity);
    expectAddress(page, { project: null, perspective: "intent" });
    expect(terminal.attaches()).toBe(1);
  });
});
