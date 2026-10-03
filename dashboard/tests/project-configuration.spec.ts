// Real server starts read/write isolated machine configuration. The fake GitHub
// supplies only published facts; project loading, selection and storage are real.
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { expect, test } from "./support/pageTest.ts";
import {
  builtDashboardDir,
  startDashboardServer,
  type DashboardServer,
} from "./support/dashboardServer.ts";
import { everyRepository, publishes } from "./support/fakeGitHub.ts";
import { rawRequest } from "./support/rawHttp.ts";
import {
  recordLaunchedDaysAgo,
  seedStore,
  storeFile,
} from "./machineLaunchRecords.ts";
import { title } from "./agentLaunchBoundary.ts";
import { settings } from "./support/systemSettingsPage.ts";
import { customSavedProjects } from "./support/projectConfiguration.ts";

const backlog = "# Product backlog\n\n## Taken\n\n## Backlog list\n";
let machine: string;
const servers: DashboardServer[] = [];

test.beforeEach(() => {
  machine = mkdtempSync(path.join(tmpdir(), "dough-project-configuration-"));
});

test.afterEach(async () => {
  await Promise.all(servers.splice(0).map((server) => server.close()));
  rmSync(machine, { recursive: true, force: true });
});

function configurationFile(mode: "dev" | "preview"): string {
  return path.join(
    machine,
    "home/.open-dough/dashboard",
    `projects-${mode === "dev" ? "development" : "production"}.json`,
  );
}

function save(mode: "dev" | "preview", text: string): void {
  const file = configurationFile(mode);
  mkdirSync(path.dirname(file), { recursive: true });
  writeFileSync(file, text);
}

async function start(mode: "dev" | "preview"): Promise<DashboardServer> {
  const server = await startDashboardServer({
    mode,
    machine,
    prebuilt: builtDashboardDir,
    configureDevelopmentProjects: false,
  });
  server.github.serve(
    everyRepository,
    publishes({ revision: "ab".repeat(20), backlog }),
  );
  servers.push(server);
  return server;
}

test("production seeds its four projects and shows a previously saved session", async ({
  page,
}) => {
  seedStore(
    machine,
    JSON.stringify({
      "open-dough": [recordLaunchedDaysAgo(1, "01234567-previous-session")],
    }),
  );
  const records = readFileSync(storeFile(machine));
  const server = await start("preview");
  await page.goto(server.baseURL);
  await expect(
    page.getByRole("radiogroup", { name: "Project" }).getByRole("radio"),
  ).toHaveCount(4);
  await expect(
    page.getByRole("radio", { name: "Open Dough", exact: true }),
  ).toBeChecked();
  await expect(
    page.getByRole("region", { name: "Recent sessions" }),
  ).toContainText(title);
  expect(
    JSON.parse(readFileSync(configurationFile("preview"), "utf8")),
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
  expect(readFileSync(storeFile(machine))).toEqual(records);
});

for (const mode of ["dev", "preview"] as const) {
  test(`saved projects retain order and default selection across restart (${mode})`, async ({
    page,
  }) => {
    const saved = JSON.stringify(customSavedProjects);
    save(mode, saved);
    for (let run = 0; run < 2; run += 1) {
      const server = await start(mode);
      await page.goto(`${server.baseURL}/?project=unknown`);
      const group = page.getByRole("radiogroup", { name: "Project" });
      await expect(group.getByRole("radio")).toHaveCount(2);
      await expect(group.locator("label")).toHaveText(["Zebra", "Apple"]);
      await expect(
        group.getByRole("radio", { name: "Zebra", exact: true }),
      ).toBeChecked();
      await expect(page).toHaveURL(`${server.baseURL}/`);
      await expect(
        page.getByRole("region", { name: "Recent sessions" }),
      ).toBeVisible();
      expect(server.ghCalls()).toContainEqual([
        "api",
        "repos/example/zebra/commits/trunk",
        "--jq",
        ".sha",
      ]);
      expect(readFileSync(configurationFile(mode), "utf8")).toBe(saved);
      await server.close();
      servers.pop();
    }
  });

  test(`an existing empty list stays empty (${mode})`, async ({ page }) => {
    save(mode, "[]\n");
    const server = await start(mode);
    await page.goto(server.baseURL);
    await expect(
      page.getByRole("heading", { name: "No projects configured" }),
    ).toBeVisible();
    await expect(settings(page)).toBeEnabled();
    await settings(page).click();
    await expect(
      page.getByRole("button", { name: "Add project" }),
    ).toBeEnabled();
    expect(readFileSync(configurationFile(mode), "utf8")).toBe("[]\n");
    expect(server.ghCalls()).toEqual([]);
  });

  test(`a malformed saved file is explained and left byte-identical (${mode})`, async ({
    page,
  }) => {
    const malformed = "{ not a project list\n";
    save(mode, malformed);
    const server = await start(mode);
    await page.goto(server.baseURL);
    await expect(page.getByRole("status")).toContainText(
      "project configuration could not be read",
    );
    await expect(page.getByRole("status")).toContainText(
      configurationFile(mode),
    );
    await expect(page.getByRole("radio")).toHaveCount(0);
    expect(readFileSync(configurationFile(mode), "utf8")).toBe(malformed);
    expect(server.ghCalls()).toEqual([]);
  });
}

test("development first start is empty and refuses the formerly fixed project", async ({
  page,
}) => {
  const server = await start("dev");
  await page.goto(server.baseURL);
  await expect(
    page.getByRole("heading", { name: "No projects configured" }),
  ).toBeVisible();
  await expect(
    page.getByText(
      "Open System settings → Projects to add a project and see its published work and start sessions.",
    ),
  ).toBeVisible();
  await expect(settings(page)).toBeEnabled();
  await settings(page).click();
  await expect(page.getByRole("button", { name: "Add project" })).toBeEnabled();
  const response = await rawRequest({
    url: `${server.baseURL}/__authenticated-read?source=open-dough`,
    headers: { Origin: server.origin },
  });
  expect(response.status).toBe(404);
  expect(server.ghCalls()).toEqual([]);
  expect(JSON.parse(readFileSync(configurationFile("dev"), "utf8"))).toEqual(
    [],
  );
});

test("a saved document with the wrong shape is reported without replacement", async ({
  page,
}) => {
  save("preview", '[{"id":"broken"}]\n');
  const server = await start("preview");
  await page.goto(server.baseURL);
  await expect(page.getByRole("status")).toContainText(
    configurationFile("preview"),
  );
  expect(readFileSync(configurationFile("preview"), "utf8")).toBe(
    '[{"id":"broken"}]\n',
  );
  expect(server.ghCalls()).toEqual([]);
});

test("a file that cannot be read is reported without seeding", async ({
  page,
}) => {
  mkdirSync(configurationFile("preview"), { recursive: true });
  const server = await start("preview");
  await page.goto(server.baseURL);
  await expect(page.getByRole("status")).toContainText(
    configurationFile("preview"),
  );
  await expect(page.getByRole("radio")).toHaveCount(0);
  expect(server.ghCalls()).toEqual([]);
});
