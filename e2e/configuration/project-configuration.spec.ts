// Real server configuration, selection and storage; fake GitHub supplies published facts.
import { mkdirSync, readFileSync } from "node:fs";
import { expect, test } from "../../dashboard/tests/support/pageTest.ts";
import { projectConfigurationMachine } from "../../dashboard/tests/support/projectConfigurationMachine.ts";
import { rawRequest } from "../../dashboard/tests/support/rawHttp.ts";
import { makeMe } from "../../tests/support/makeMe.mjs";
import {
  daysAgo,
  machineHome,
} from "../../dashboard/tests/machineLaunchRecords.ts";
import {
  keepLaunchStore,
  launchStoreFile,
} from "../../dashboard/tests/support/launchStore.ts";
import { identity, title } from "../../dashboard/tests/agentLaunchBoundary.ts";
import { settings } from "../../dashboard/tests/support/systemSettingsPage.ts";
import { expectFrameIconControl } from "../../dashboard/tests/frameIconControl.ts";
import { openUntilRead } from "../../dashboard/tests/pageRequestNotes.ts";

let fixture: ReturnType<typeof projectConfigurationMachine>;
test.beforeEach(() => {
  fixture = projectConfigurationMachine();
});
test.afterEach(async () => fixture.close());

test("production seeds its four projects and shows a previously saved session", async ({
  page,
}) => {
  keepLaunchStore(machineHome(fixture.machine), {
    "open-dough": [
      makeMe.aLaunchRecord
        .executing({ identity, title })
        .inClaudeSession({ sessionId: "01234567-previous-session" })
        .launchedAt(daysAgo(1))
        .please(),
    ],
  });
  const records = readFileSync(launchStoreFile(machineHome(fixture.machine)));
  const server = await fixture.start("preview");
  await openUntilRead(page, server.baseURL);
  await expect(
    page.getByRole("radiogroup", { name: "Project" }).getByRole("radio"),
  ).toHaveCount(4);
  await expect(
    page.getByRole("radio", { name: "Open Dough", exact: true }),
  ).toBeChecked();
  await expect(
    page.getByRole("region", { name: "Taken", exact: true }),
  ).toContainText(title);
  expect(
    JSON.parse(readFileSync(fixture.configurationFile("preview"), "utf8")),
  ).toEqual([
    {
      id: "open-dough",
      label: "Open Dough",
      repository: "terryyin/open-dough",
      ref: "main",
      backlogPath: ".planning/PRODUCT-BACKLOG.md",
      localPath: "~/git/open-dough",
    },
    {
      id: "doughnut",
      label: "Doughnut",
      repository: "nerds-odd-e/doughnut",
      ref: "main",
      backlogPath: ".planning/PRODUCT-BACKLOG.md",
      localPath: "~/git/doughnut",
    },
    {
      id: "pygardon",
      label: "Pygardon",
      repository: "terryyin/pygardon",
      ref: "main",
      backlogPath: ".planning/PRODUCT-BACKLOG.md",
      localPath: "~/git/pygardon",
    },
    {
      id: "terry-talks",
      label: "Terry Talks",
      repository: "terryyin/terry-talks",
      ref: "master",
      backlogPath: ".planning/PRODUCT-BACKLOG.md",
      localPath: "~/git/terry-talks",
    },
  ]);
  expect(readFileSync(launchStoreFile(machineHome(fixture.machine)))).toEqual(
    records,
  );
});

// Both servers read the saved file through the same boundary
// (../../dashboard/backend-tests/runtime/serving-modes.spec.ts), so these run once, on the preview.
test("saved projects retain order and default selection across restart", async ({
  page,
}) => {
  // Unlike the seeded catalog: unsorted, on custom refs and checkouts.
  const saved = JSON.stringify([
    makeMe.aConfiguredProject
      .with({
        id: "zebra",
        label: "Zebra",
        repository: "example/zebra",
        ref: "trunk",
        localPath: "~/work/zebra",
      })
      .please(),
    makeMe.aConfiguredProject
      .with({
        id: "apple",
        label: "Apple",
        repository: "example/apple",
        ref: "default",
        localPath: "~/elsewhere/apple",
      })
      .please(),
  ]);
  fixture.save(saved);
  for (let run = 0; run < 2; run += 1) {
    const server = await fixture.start("preview");
    await openUntilRead(page, `${server.baseURL}/?project=unknown`);
    const group = page.getByRole("radiogroup", { name: "Project" });
    await expect(group.getByRole("radio")).toHaveCount(2);
    await expect(group.locator("label")).toHaveText(["Zebra", "Apple"]);
    await expect(
      group.getByRole("radio", { name: "Zebra", exact: true }),
    ).toBeChecked();
    await expect(page).toHaveURL(`${server.baseURL}/`);
    await expect(
      page.getByRole("region", { name: "Recently done", exact: true }),
    ).toBeVisible();
    expect(server.ghCalls()).toContainEqual([
      "api",
      "--include",
      "repos/example/zebra/commits/trunk",
      "--jq",
      ".sha",
    ]);
    expect(readFileSync(fixture.configurationFile("preview"), "utf8")).toBe(
      saved,
    );
    await fixture.stop(server);
  }
});

test("an existing empty list stays empty", async ({ page }) => {
  fixture.save("[]\n");
  const server = await fixture.start("preview");
  await openUntilRead(page, server.baseURL);
  await expect(
    page.getByRole("heading", { name: "No projects configured" }),
  ).toBeVisible();
  await settings(page).click();
  await expect(page.getByRole("button", { name: "Add project" })).toBeEnabled();
  expect(readFileSync(fixture.configurationFile("preview"), "utf8")).toBe(
    "[]\n",
  );
  expect(server.ghCalls()).toEqual([]);
});

test("a malformed saved file is explained and left byte-identical", async ({
  page,
}) => {
  const malformed = "{ not a project list\n";
  fixture.save(malformed);
  const server = await fixture.start("preview");
  await openUntilRead(page, server.baseURL);
  await expect(page.getByRole("status")).toContainText(
    "project configuration could not be read",
  );
  await expect(page.getByRole("status")).toContainText(
    fixture.configurationFile("preview"),
  );
  await expect(page.getByRole("radio")).toHaveCount(0);
  expect(readFileSync(fixture.configurationFile("preview"), "utf8")).toBe(
    malformed,
  );
  expect(server.ghCalls()).toEqual([]);
});

test("development first start is empty and refuses the formerly fixed project", async ({
  page,
}) => {
  const server = await fixture.start("dev");
  await openUntilRead(page, server.baseURL);
  await expect(
    page.getByRole("heading", { name: "No projects configured" }),
  ).toBeVisible();
  await expect(
    page.getByText(
      "Open System settings → Projects to add a project and see its published work and start sessions.",
    ),
  ).toBeVisible();
  await expectFrameIconControl(settings(page), "System settings");
  await settings(page).click();
  await expect(page.getByRole("button", { name: "Add project" })).toBeEnabled();
  const response = await rawRequest({
    url: `${server.baseURL}/__authenticated-read?source=open-dough`,
    headers: { Origin: server.origin },
  });
  expect(response.status).toBe(404);
  expect(server.ghCalls()).toEqual([]);
  expect(
    JSON.parse(readFileSync(fixture.configurationFile("dev"), "utf8")),
  ).toEqual([]);
});

test("a saved document with the wrong shape is reported without replacement", async ({
  page,
}) => {
  const wrongShape = '[{"id":"broken"}]\n';
  fixture.save(wrongShape);
  const server = await fixture.start("preview");
  await openUntilRead(page, server.baseURL);
  await expect(page.getByRole("status")).toContainText(
    fixture.configurationFile("preview"),
  );
  expect(readFileSync(fixture.configurationFile("preview"), "utf8")).toBe(
    wrongShape,
  );
  expect(server.ghCalls()).toEqual([]);
});

test("a file that cannot be read is reported without seeding", async ({
  page,
}) => {
  mkdirSync(fixture.configurationFile("preview"), { recursive: true });
  const server = await fixture.start("preview");
  await openUntilRead(page, server.baseURL);
  await expect(page.getByRole("status")).toContainText(
    fixture.configurationFile("preview"),
  );
  await expect(page.getByRole("radio")).toHaveCount(0);
  expect(server.ghCalls()).toEqual([]);
});
