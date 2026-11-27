// What removing a configured project keeps and writes: its checkout and
// session records survive and return on re-add, removing development's last
// project persists an empty list, and a failed write keeps the saved file.
// Which project is selected after a removal is
// ./project-remove-selection.spec.ts.
import { chmodSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import {
  expectUnchangedMachineRecords,
  snapshotMachineRecords,
} from "../../dashboard/test-support/support/machineRecordNames.ts";
import { expect, test } from "../../dashboard/test-support/support/pageTest.ts";
import {
  addedBranch,
  addedRepository,
  projectAddMachine,
} from "../../dashboard/test-support/support/projectAddMachine.ts";
import { addProjectOnPage } from "../../dashboard/test-support/support/projectAddPage.ts";
import { makeMe } from "../../Distribution/tests/support/makeMe.mjs";
import { identity } from "../../dashboard/test-support/agentLaunchBoundary.ts";
import {
  parts,
  sessionEntryShowing,
} from "../../dashboard/test-support/dashboardPage.ts";
import { machineHome } from "../../dashboard/test-support/machineLaunchRecords.ts";
import {
  keepLaunchStore,
  launchStoreFile,
} from "../../dashboard/test-support/support/launchStore.ts";
import {
  openUntilRead,
  untilPublishedWorkRead,
} from "../../dashboard/test-support/pageRequestNotes.ts";
import { openSessionsSidebar } from "../../dashboard/test-support/sessionsSidebarPage.ts";
import {
  back,
  confirmRemoval,
  removeButton,
  removeDialog,
  removeProject,
  settings,
} from "../../dashboard/test-support/support/systemSettingsPage.ts";
let fixture: ReturnType<typeof projectAddMachine>;
test.beforeEach(() => {
  fixture = projectAddMachine();
});
test.afterEach(async () => fixture.close());

test("removing a configured project retains its checkout and records, hides sessions, persists and re-add restores them", async ({
  page,
}) => {
  const story = { identity, title: "Retained sample session" };
  const origin = makeMe.aRepository.withTrunkBranch(addedBranch);
  const record = makeMe.aLaunchRecord
    .executing({
      ...story,
      source: "sample-app",
    })
    .inClaudeSession({ sessionId: "01234567-retained" })
    .please();
  const records = keepLaunchStore(machineHome(fixture.machine), {
    "sample-app": [record],
  });
  const marker = path.join(fixture.checkout, "keep-this.txt");
  writeFileSync(marker, "local work stays\n");
  const gitConfig = readFileSync(
    path.join(fixture.checkout, ".git/config"),
    "utf8",
  );
  let server = await fixture.start("preview");
  server.github.serve(addedRepository, origin.takingStories(story).please());
  await page.goto(server.baseURL);
  await addProjectOnPage(page);
  const { taken } = parts(page);
  const retainedEntry = sessionEntryShowing(taken, "claude:01234567-retained");
  const expectRetainedStorySession = async () => {
    await expect(taken).toContainText(story.title, { timeout: 5_000 });
    await expect(retainedEntry).toBeVisible();
  };
  await expectRetainedStorySession();
  await page.getByRole("button", { name: "Sessions", exact: true }).click();
  const sidebar = page.getByRole("complementary", {
    name: "Sessions sidebar",
    exact: true,
  });
  await expect(sidebar).toContainText(story.title);
  const file = fixture.configurationFile("preview");
  const before = readFileSync(file, "utf8");
  const recordsFolder = path.dirname(file);
  // Snapshot before remove rewrites the projects file; other machine records
  // must stay put (runner/log, notifier, retained answers, launch store).
  const machineRecordsBefore = snapshotMachineRecords(recordsFolder, {
    omitContentFor: [path.basename(file)],
  });
  await settings(page).click();
  for (const dismissal of ["Cancel", "Escape"]) {
    await removeButton(page, "Sample App").focus();
    await page.keyboard.press("Enter");
    const dialog = removeDialog(page, "Sample App");
    await expect(dialog).toContainText("Nothing on disk or on GitHub changes.");
    await expect(dialog.getByRole("button", { name: "Cancel" })).toBeFocused();
    await page.keyboard.press("ArrowLeft");
    await page.keyboard.press("ArrowRight");
    await expect(
      page.getByRole("radio", {
        name: "Sample App",
        exact: true,
        includeHidden: true,
      }),
    ).toBeChecked();
    await page.keyboard.press("Tab");
    await expect(
      dialog.getByRole("button", { name: "Remove", exact: true }),
    ).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(dialog.getByRole("button", { name: "Cancel" })).toBeFocused();
    if (dismissal === "Escape") await page.keyboard.press("Escape");
    else await dialog.getByRole("button", { name: "Cancel" }).click();
    await expect(dialog).toBeHidden();
    await expect(removeButton(page, "Sample App")).toBeFocused();
    expect(readFileSync(file, "utf8")).toBe(before);
  }
  let releaseSessions!: () => void;
  const sessionGate = new Promise<void>((resolve) => {
    releaseSessions = resolve;
  });
  let readHeld = false;
  await page.route(
    (url) => url.pathname === "/__agent-launch",
    async (route) => {
      readHeld = true;
      await sessionGate;
      await route.continue();
    },
  );
  try {
    await removeProject(page, "Sample App");
    await expect(removeDialog(page, "Sample App")).toBeHidden();
    await back(page).click();
    await expect(
      page.getByRole("radio", { name: "Sample App", exact: true }),
    ).toHaveCount(0);
    const openDough = page.getByRole("radio", {
      name: "Open Dough",
      exact: true,
    });
    await expect(openDough).toBeChecked();
    await expect(openDough).not.toBeFocused();
    await expect(settings(page)).toBeFocused();
    await untilPublishedWorkRead(page);
    await expect(taken).not.toContainText(story.title, {
      timeout: 1_000,
    });
    await expect(sidebar).not.toContainText(story.title, {
      timeout: 1_000,
    });
    await expect.poll(() => readHeld, { timeout: 1_000 }).toBe(true);
  } finally {
    releaseSessions();
  }
  const launchStore = launchStoreFile(machineHome(fixture.machine));
  expect(readFileSync(marker, "utf8")).toBe("local work stays\n");
  expect(readFileSync(path.join(fixture.checkout, ".git/config"), "utf8")).toBe(
    gitConfig,
  );
  expect(readFileSync(launchStore, "utf8")).toBe(records);
  const remainingIds = (JSON.parse(before) as { id: string }[])
    .map(({ id }) => id)
    .filter((id) => id !== "sample-app");
  expect(
    (JSON.parse(readFileSync(file, "utf8")) as { id: string }[]).map(
      ({ id }) => id,
    ),
  ).toEqual(remainingIds);
  expectUnchangedMachineRecords(recordsFolder, machineRecordsBefore);
  await fixture.stop(server);
  server = await fixture.start("preview");
  server.github.serve(addedRepository, origin.takingStories(story).please());
  await openUntilRead(page, server.baseURL);
  await expect(parts(page).project.getByRole("radio")).toHaveCount(
    remainingIds.length,
  );
  await expect(page.getByRole("radio", { name: "Sample App" })).toHaveCount(0);
  await addProjectOnPage(page);
  await expectRetainedStorySession();
  await openSessionsSidebar(page);
  await expect(sidebar).toContainText(story.title, {
    timeout: 5_000,
  });
  expect(readFileSync(launchStore, "utf8")).toBe(records);
});

test("removing the last project leaves a persistent focused empty state", async ({
  page,
}) => {
  const server = await fixture.start("dev");
  await page.goto(server.baseURL);
  await addProjectOnPage(page);
  await settings(page).click();
  await removeProject(page, "Sample App");
  await expect(
    page.getByRole("heading", { name: "System settings", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Add project", exact: true }),
  ).toBeFocused();
  await expect(removeButton(page, "Sample App")).toHaveCount(0);
  expect(
    JSON.parse(readFileSync(fixture.configurationFile("dev"), "utf8")),
  ).toEqual([]);
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "System settings", exact: true }),
  ).toBeVisible();
  await back(page).click();
  await expect(
    page.getByRole("heading", { name: "No projects configured" }),
  ).toBeVisible();
  await addProjectOnPage(page);
  await settings(page).click();
  await expect(removeButton(page, "Sample App")).toBeEnabled();
});

test("failed row removal keeps configuration, confirmation feedback and retry", async ({
  page,
}) => {
  const server = await fixture.start("preview");
  await page.goto(`${server.baseURL}/?view=settings&project=pygardon`);
  const file = fixture.configurationFile("preview");
  const predecessor = readFileSync(file, "utf8");
  await removeButton(page, "Pygardon").click();
  const dialog = removeDialog(page, "Pygardon");
  chmodSync(path.dirname(file), 0o500);
  try {
    await confirmRemoval(page, "Pygardon");
    await expect(dialog.getByRole("alert")).toBeVisible();
    expect(readFileSync(file, "utf8")).toBe(predecessor);
  } finally {
    chmodSync(path.dirname(file), 0o700);
  }
  await confirmRemoval(page, "Pygardon");
  await expect(dialog).toBeHidden();
  await expect(removeButton(page, "Pygardon")).toHaveCount(0);
  await back(page).click();
  await expect(
    page.getByRole("radio", { name: "Terry Talks", exact: true }),
  ).toBeChecked();
});
