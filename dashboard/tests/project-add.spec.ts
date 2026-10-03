// Real browser, local Git checkout, loopback boundary and saved machine settings.
// Fake GitHub supplies only repository/default-branch/published facts; the fake
// host records the actual cwd chosen by the product.
import { mkdirSync, readFileSync, realpathSync } from "node:fs";
import path from "node:path";
import { launchRequest } from "./agentLaunchBoundary.ts";
import {
  recordLaunchedDaysAgo,
  seedStore,
  storeFile,
} from "./machineLaunchRecords.ts";
import { rawRequest } from "./support/rawHttp.ts";
import { addProjectOnPage } from "./support/projectAddPage.ts";
import { expect, test } from "./support/pageTest.ts";
import { startSessionDialog, startSessionField } from "./launchCardPage.ts";
import {
  projectAddMachine,
  addedRepository,
  addedRevision,
  addedBranch,
  addedLocalPath,
} from "./support/projectAddMachine.ts";

let fixture: ReturnType<typeof projectAddMachine>;
test.beforeEach(() => {
  fixture = projectAddMachine();
});
test.afterEach(async () => fixture.close());

test("Add selects, reads the repository's default branch, launches in its configured folder and survives restart", async ({
  page,
}) => {
  let server = await fixture.start("preview");
  await page.goto(server.baseURL);
  await expect(
    page.getByRole("radio", { name: "Open Dough", exact: true }),
  ).toBeChecked();
  await addProjectOnPage(page);
  const source = page.getByRole("region", { name: "Published Git state" });
  await expect(source).toContainText(addedRepository);
  await expect(source).toContainText(addedRevision);
  expect(server.ghCalls()).toContainEqual([
    "api",
    `repos/${addedRepository}`,
    "--jq",
    ".default_branch",
  ]);
  expect(server.ghCalls()).toContainEqual([
    "api",
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
    page.getByRole("region", { name: "Recent sessions" }),
  ).toContainText("Work in this checkout");

  await fixture.stop(server);
  server = await fixture.start("preview");
  await page.goto(`${server.baseURL}/?project=sample-app`);
  await expect(
    page.getByRole("radio", { name: "Sample App", exact: true }),
  ).toBeChecked();
  await expect(
    page.getByRole("region", { name: "Published Git state" }),
  ).toContainText(addedRevision);
  expect(readFileSync(fixture.configurationFile("preview"), "utf8")).toBe(
    saved,
  );
  expect(server.ghCalls()).toContainEqual([
    "api",
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
  await productionPage.goto(production.baseURL);
  await expect(productionPage.getByRole("radio")).toHaveCount(4);
  const productionFile = readFileSync(
    fixture.configurationFile("preview"),
    "utf8",
  );
  const development = await fixture.start("dev");
  await page.goto(development.baseURL);
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
  await productionPage.reload();
  await expect(productionPage.getByRole("radio")).toHaveCount(4);
  await expect(
    productionPage.getByRole("radio", { name: "Sample App" }),
  ).toHaveCount(0);
  await productionPage.close();
});

for (const mode of ["preview", "dev"] as const) {
  test(`Cancel and Escape save nothing, return focus and keep project arrows inside the modal (${mode})`, async ({
    page,
  }) => {
    const server = await fixture.start(mode);
    await page.goto(server.baseURL);
    await page
      .getByRole("button", { name: "System settings", exact: true })
      .click();
    const button = page.getByRole("button", {
      name: "Add project",
      exact: true,
    });
    await expect(button).toBeEnabled();
    const file = readFileSync(fixture.configurationFile(mode), "utf8");
    for (const dismissal of ["Escape", "Cancel"] as const) {
      await button.click();
      const dialog = page.getByRole("dialog", {
        name: "Add project",
        exact: true,
      });
      await dialog
        .getByRole("textbox", { name: "GitHub URL" })
        .fill(`https://github.com/${addedRepository}`);
      await dialog
        .getByRole("textbox", { name: "Local path" })
        .fill(addedLocalPath);
      await dialog.getByRole("button", { name: "Cancel" }).focus();
      await page.keyboard.press("ArrowRight");
      await page.keyboard.press("ArrowLeft");
      if (mode === "preview")
        await expect(
          page.getByRole("radio", {
            name: "Open Dough",
            exact: true,
            includeHidden: true,
          }),
        ).toBeChecked();
      if (dismissal === "Escape") await page.keyboard.press("Escape");
      else await dialog.getByRole("button", { name: "Cancel" }).click();
      await expect(dialog).toBeHidden();
      await expect(button).toBeFocused();
      expect(readFileSync(fixture.configurationFile(mode), "utf8")).toBe(file);
      expect(
        server
          .ghCalls()
          .some((call) => call.includes(`repos/${addedRepository}`)),
      ).toBe(false);
    }
  });
}

test("retained workspace explanations use the configured folder and keep actual start and stored evidence intact", async ({
  page,
}) => {
  const workspace = path.join(fixture.checkout, ".worktrees", "topic");
  mkdirSync(workspace, { recursive: true });
  const record = {
    ...recordLaunchedDaysAgo(1, "01234567-retained-custom"),
    request: {
      ...launchRequest,
      source: "sample-app",
      title: "Existing custom workspace",
    },
    start: {
      identity: launchRequest.identity,
      publisherId: "custom-publisher",
      workspace,
      branch: "claude/topic",
      mode: "story-branch",
      remote: "origin",
      target: "main",
      publishedSha: "ab".repeat(20),
    },
  };
  seedStore(fixture.machine, JSON.stringify({ "sample-app": [record] }));
  const kept = readFileSync(storeFile(fixture.machine), "utf8");
  const server = await fixture.start("preview");
  await page.goto(server.baseURL);
  await addProjectOnPage(page);
  await expect(
    page.getByRole("region", { name: "Recent sessions" }),
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
  expect(readFileSync(storeFile(fixture.machine), "utf8")).toBe(kept);
});
