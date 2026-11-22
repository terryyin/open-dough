import { makeMe } from "../../Distribution/tests/support/makeMe.mjs";
import { catalogPublications } from "../../dashboard/test-support/catalogProjectRecords.ts";
import { expectProjectChoice } from "../../dashboard/test-support/dashboardPage.ts";
import { expect, test } from "../../dashboard/test-support/dashboardTest.ts";
import { expectAddress } from "../../dashboard/test-support/intentPerspectivePage.ts";
import { openDoughProject } from "../../dashboard/test-support/projectKeyboardNavigationJourney.ts";
import { publishFiles } from "../../dashboard/test-support/publishedFiles.ts";
import { expectCovering } from "../../dashboard/test-support/sidePanelFrame.ts";
import { sidePanelPages } from "../../dashboard/test-support/sidePanelPages.ts";
import { keepLaunchRecords } from "../../dashboard/test-support/support/launchStore.ts";
import { terminalScreen } from "../../dashboard/test-support/terminalScreen.ts";

test.use({
  projectFolders: ["open-dough", "doughnut"],
  viewport: { width: 1440, height: 900 },
});

test.beforeEach(async ({ page }) => {
  for (const publication of [
    catalogPublications.openDough,
    catalogPublications.doughnut,
  ])
    await publishFiles(page, publication);
});

const queuedIdentity = "SEED-301#queued";
const queuedTitle = openDoughProject.queued;

test("perspective and covering history keep the same terminal attachment and selected story", async ({
  dashboard,
  page,
}) => {
  const { shortId, attaches, view, screen, intentBeneath } =
    await test.step("Given a working session on the published Open Dough story", () => {
      const id = dashboard.claudeListsSession({
        name: queuedTitle,
        cwd: dashboard.home,
        startedAt: Date.now(),
      });
      keepLaunchRecords(dashboard, [
        makeMe.aLaunchRecord
          .executing({ title: queuedTitle, identity: queuedIdentity })
          .inClaudeSession({ sessionId: id })
          .please(),
      ]);
      return {
        shortId: id.slice(0, 8),
        attaches: () =>
          dashboard
            .claudeAttaches()
            .filter((attach) => attach.id === id.slice(0, 8)),
        view: sidePanelPages(page),
        screen: terminalScreen(page),
        intentBeneath: page.locator(".page-column .intent-perspective"),
      };
    });
  await test.step("When I open the terminal from Sessions and type a line", async () => {
    await page.goto("/");
    await view.phase("Attach the listed session", ({ sessionsSidebar }) =>
      sessionsSidebar
        .toggle()
        .openEntry(queuedTitle)
        .expectText(`attached ${shortId}`),
    );
    await screen.typeLine("before intent");
  });
  await test.step("Then the attached session echoes the line", () =>
    screen.expectText("echo before intent"));
  await test.step("When I switch to Intent, the project, selected story and output stay", async () => {
    await view.phase(
      "Choose Intent beside the terminal",
      ({ perspective, intent, terminal }) => {
        perspective.choose("Intent").expectChosen("Intent");
        intent.expectSelectedStory(queuedIdentity);
        terminal.expectText("echo before intent");
      },
    );
    await expectProjectChoice(page, "Open Dough");
  });
  await test.step("And I focus the terminal and type again", async () => {
    await screen.focusInput();
    await screen.typeLine("during intent");
    await screen.expectText("echo during intent");
  });
  await test.step("When I return to Development, the terminal keeps the new output", () =>
    view.phase(
      "Choose Development beside the terminal",
      ({ perspective, intent, terminal }) => {
        perspective.choose("Development");
        intent.expectNotShown();
        terminal.expectText("echo during intent");
      },
    ));

  await test.step("When I narrow the window, the terminal covers the page", async () => {
    await page.setViewportSize({ width: 390, height: 844 });
    await expectCovering(screen.panel);
  });
  await test.step("And I go Back to Intent under the terminal", async () => {
    await page.goBack();
    expectAddress(page, { project: null, perspective: "intent" });
    await expect(intentBeneath).toHaveAttribute(
      "data-selected-story",
      queuedIdentity,
    );
  });
  await test.step("Then the covering terminal retains its output", async () => {
    await expectCovering(screen.panel);
    await screen.expectText("echo during intent");
  });
  await test.step("When I go Forward to Development under the terminal", async () => {
    await page.goForward();
    expectAddress(page, { project: null, perspective: null });
    await expect(intentBeneath).toHaveCount(0);
  });
  await test.step("Then the terminal still covers the page", () =>
    expectCovering(screen.panel));
  await test.step("When I go Back again, Intent still reads the selected story", async () => {
    await page.goBack();
    await expect(intentBeneath).toHaveAttribute(
      "data-selected-story",
      queuedIdentity,
    );
    await expectCovering(screen.panel);
  });
  await test.step("Then the covering terminal retains both lines", async () => {
    await screen.expectText("echo before intent");
    await screen.expectText("echo during intent");
  });
  await test.step("And one host attachment received both lines", () => {
    expect(attaches()).toHaveLength(1);
    expect(attaches()[0]?.lines).toEqual(["before intent", "during intent"]);
  });
  await test.step("When I close the terminal", async () => {
    await screen.close();
    await screen.expectClosed();
  });
  await test.step("Then the visible Intent reads the same selected story", () =>
    view.phase("The addressed Intent is visible", ({ perspective, intent }) => {
      perspective.expectChosen("Intent");
      intent.expectSelectedStory(queuedIdentity);
    }));
  await test.step("And the address, project and attachment count are preserved", async () => {
    await expectProjectChoice(page, "Open Dough");
    expectAddress(page, { project: null, perspective: "intent" });
    expect(attaches()).toHaveLength(1);
  });
});
