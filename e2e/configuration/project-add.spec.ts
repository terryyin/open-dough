// The Add dialog uses a real execution checkout and keeps machine settings
// through restart. The fake host observes its actual working directory.
import { chmodSync, mkdirSync, readFileSync, realpathSync } from "node:fs";
import { git } from "../../dashboard/test-support/support/startOriginObservation.ts";
import path from "node:path";
import { makeMe } from "../../Distribution/tests/support/makeMe.mjs";
import { identity } from "../../dashboard/test-support/agentLaunchBoundary.ts";
import {
  daysAgo,
  machineHome,
} from "../../dashboard/test-support/machineLaunchRecords.ts";
import {
  keepLaunchStore,
  launchStoreFile,
} from "../../dashboard/test-support/support/launchStore.ts";
import { rawRequest } from "../../dashboard/test-support/support/rawHttp.ts";
import { addProjectOnPage } from "../../dashboard/test-support/support/projectAddPage.ts";
import { expect, test } from "../../dashboard/test-support/support/pageTest.ts";
import {
  startSessionDialog,
  startSessionField,
} from "../../dashboard/test-support/launchStoryCardPage.ts";
import {
  openUntilRead,
  reloadUntilRead,
} from "../../dashboard/test-support/pageRequestNotes.ts";
import {
  expectProjectChoice,
  shortRevision,
  parts,
} from "../../dashboard/test-support/dashboardPage.ts";
import {
  projectAddMachine,
  addedRepository,
  addedBranch,
  addedLocalPath,
} from "../../dashboard/test-support/support/projectAddMachine.ts";

let fixture: ReturnType<typeof projectAddMachine>;
test.beforeEach(() => {
  fixture = projectAddMachine();
});
test.afterEach(async () => fixture.close());

test("Add selects, reads the repository's default branch, launches in its execution checkout and survives restart", async ({
  page,
}) => {
  await fixture.installAddedProject();
  const before = fixture.addedTip();
  let server = await fixture.start("preview");
  await openUntilRead(page, server.baseURL);
  await expect(
    page.getByRole("radio", { name: "Open Dough", exact: true }),
  ).toBeChecked();
  await addProjectOnPage(page);
  fixture.routeAddedCheckout();
  const { readRevision } = parts(page);
  await expectProjectChoice(page, "Sample App");
  await expect(readRevision).toContainText(shortRevision(before));
  expect(server.ghCalls()).toContainEqual([
    "api",
    "--include",
    `repos/${addedRepository}`,
    "--jq",
    ".default_branch",
  ]);
  expect(server.ghCalls()).toContainEqual([
    "api",
    "--include",
    `repos/${addedRepository}/commits/${encodeURIComponent(addedBranch)}`,
    "--jq",
    ".sha",
  ]);
  expect(
    server
      .ghCalls()
      .some((call) => call.includes(`repos/${addedRepository}/commits/main`)),
  ).toBe(false);
  const saved = readFileSync(fixture.configurationFile("preview"), "utf8");
  expect((JSON.parse(saved) as readonly unknown[]).at(-1)).toEqual({
    id: "sample-app",
    label: "Sample App",
    repository: addedRepository,
    ref: addedBranch,
    backlogPath: ".planning/PRODUCT-BACKLOG.md",
    localPath: addedLocalPath,
  });

  server.claudeScenario("launched");
  await page
    .getByRole("button", { name: "Start session in Sample App" })
    .click();
  const launch = startSessionDialog(page, "Sample App");
  await startSessionField(launch).fill("Work in this checkout");
  await launch.getByRole("button", { name: "Start", exact: true }).click();
  await expect(launch).toBeHidden();
  await expect.poll(() => server.claudeLaunchCalls().length).toBe(1);
  expect(server.claudeLaunchCalls()[0]?.cwd).toBe(
    realpathSync(fixture.checkout),
  );
  await expect(
    page.getByRole("region", { name: "Taken", exact: true }),
  ).toContainText("Work in this checkout");
  const published = fixture.addedTip();
  expect(published).not.toBe(before);
  expect(await git(fixture.checkout, "branch", "--show-current")).toBe(
    "local-checkout",
  );
  expect(await git(fixture.checkout, "rev-parse", "HEAD")).toBe(before);

  await fixture.stop(server);
  server = await fixture.start("preview");
  await openUntilRead(page, `${server.baseURL}/?project=sample-app`);
  await expect(
    page.getByRole("radio", { name: "Sample App", exact: true }),
  ).toBeChecked();
  await expect(parts(page).readRevision).toContainText(
    shortRevision(published),
  );
  expect(readFileSync(fixture.configurationFile("preview"), "utf8")).toBe(
    saved,
  );
  expect(server.ghCalls()).toContainEqual([
    "api",
    "--include",
    `repos/${addedRepository}/commits/${encodeURIComponent(addedBranch)}`,
    "--jq",
    ".sha",
  ]);
});

test("Add in empty development leaves the production list on the same machine unchanged", async ({
  page,
}) => {
  const production = await fixture.start("preview");
  const productionPage = await page.context().newPage();
  await openUntilRead(productionPage, production.baseURL);
  await expect(parts(productionPage).project.getByRole("radio")).toHaveCount(4);
  const productionFile = readFileSync(
    fixture.configurationFile("preview"),
    "utf8",
  );
  const development = await fixture.start("dev");
  await openUntilRead(page, development.baseURL);
  await expect(
    page.getByRole("heading", { name: "No projects configured" }),
  ).toBeVisible();
  await addProjectOnPage(page);
  expect(
    JSON.parse(readFileSync(fixture.configurationFile("dev"), "utf8")),
  ).toHaveLength(1);
  expect(readFileSync(fixture.configurationFile("preview"), "utf8")).toBe(
    productionFile,
  );
  await reloadUntilRead(productionPage);
  await expect(parts(productionPage).project.getByRole("radio")).toHaveCount(4);
  await expect(
    productionPage.getByRole("radio", { name: "Sample App" }),
  ).toHaveCount(0);
  await productionPage.close();
});

test("retained workspace explanations use the execution checkout and keep actual start and stored evidence intact", async ({
  page,
}) => {
  const workspace = path.join(fixture.checkout, ".worktrees", "topic");
  mkdirSync(workspace, { recursive: true });
  const record = makeMe.aLaunchRecord
    .executing({
      identity,
      title: "Existing custom workspace",
      source: "sample-app",
    })
    .inClaudeSession({ sessionId: "01234567-retained-custom" })
    .onStoryBranch({ workspace, branch: "claude/topic" })
    .launchedAt(daysAgo(1))
    .please();
  keepLaunchStore(machineHome(fixture.machine), { "sample-app": [record] });
  const kept = readFileSync(
    launchStoreFile(machineHome(fixture.machine)),
    "utf8",
  );
  const server = await fixture.start("preview");
  await page.goto(server.baseURL);
  await addProjectOnPage(page);
  await expect(
    page.getByRole("region", { name: "Taken", exact: true }),
  ).toContainText("Workspace ~/work/private-checkout/.worktrees/topic");
  const response = await rawRequest({
    url: `${server.baseURL}/__agent-launch`,
    headers: { Origin: server.origin },
  });
  expect(response.status).toBe(200);
  const answer = JSON.parse(response.body) as {
    records: { start: { workspace: string }; shownWorkspace: string }[];
  };
  expect(answer.records[0]?.start.workspace).toBe(workspace);
  expect(answer.records[0]?.shownWorkspace).toBe(
    "~/work/private-checkout/.worktrees/topic",
  );
  expect(
    readFileSync(launchStoreFile(machineHome(fixture.machine)), "utf8"),
  ).toBe(kept);
});

test("project settings errors retain the form draft and predecessor and allow explicit retry", async ({
  page,
}) => {
  const server = await fixture.start("preview");
  // Production's seeded project list is the predecessor every failed add
  // must leave byte for byte.
  const file = fixture.configurationFile("preview");
  const predecessor = readFileSync(file, "utf8");
  await page.goto(`${server.baseURL}/?view=settings`);
  await page.getByRole("button", { name: "Add project", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "Add project", exact: true });
  const url = dialog.getByRole("textbox", { name: "GitHub URL" });
  await url.fill("not a repository");
  await dialog
    .getByRole("textbox", { name: "Execution checkout" })
    .fill("~/work/private-checkout");
  await dialog.getByRole("button", { name: "Add", exact: true }).click();
  await expect(dialog.getByRole("alert")).toBeVisible();
  await expect(url).toHaveValue("not a repository");
  expect(readFileSync(file, "utf8")).toBe(predecessor);
  await url.fill("https://github.com/example/sample-app");
  await dialog
    .getByRole("textbox", { name: "Execution checkout" })
    .fill("~/work/private-checkout");
  chmodSync(path.dirname(file), 0o500);
  try {
    await dialog.getByRole("button", { name: "Add", exact: true }).click();
    await expect(dialog.getByRole("alert")).toBeVisible();
    await expect(url).toHaveValue("https://github.com/example/sample-app");
    await expect(
      dialog.getByRole("textbox", { name: "Execution checkout" }),
    ).toHaveValue("~/work/private-checkout");
    expect(readFileSync(file, "utf8")).toBe(predecessor);
  } finally {
    chmodSync(path.dirname(file), 0o700);
  }
  await dialog.getByRole("button", { name: "Add", exact: true }).click();
  await expect(dialog).toBeHidden();
  await expect(
    page.getByRole("heading", { name: "Sample App", exact: true }),
  ).toBeVisible();
  expect(JSON.parse(readFileSync(file, "utf8"))).toHaveLength(
    (JSON.parse(predecessor) as unknown[]).length + 1,
  );
});
