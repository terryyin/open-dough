// Browser mutations go through the real loopback server and atomic machine file.
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { expect, test } from "./support/pageTest.ts";
import { projectAddMachine } from "./support/projectAddMachine.ts";
import { addProjectOnPage } from "./support/projectAddPage.ts";
import { launchRequest } from "./agentLaunchBoundary.ts";
import { seedStore, storeFile } from "./machineLaunchRecords.ts";

let fixture: ReturnType<typeof projectAddMachine>;
test.beforeEach(() => {
  fixture = projectAddMachine();
});
test.afterEach(async () => fixture.close());

const removeButton = (
  page: import("@playwright/test").Page,
  label = "Sample App",
) => page.getByRole("button", { name: `Remove project ${label}`, exact: true });
const openSettings = (page: import("@playwright/test").Page) =>
  page.getByRole("button", { name: "System settings", exact: true }).click();
const back = (page: import("@playwright/test").Page) =>
  page.getByRole("button", { name: "Back to dashboard", exact: true }).click();

test("removing a configured project retains its checkout and records, hides sessions, persists and re-add restores them", async ({
  page,
}) => {
  const record = {
    request: {
      ...launchRequest,
      source: "sample-app",
      title: "Retained sample session",
    },
    session: {
      host: "claude",
      sessionId: "01234567-retained",
      shortId: "01234567",
      name: "Retained sample session",
    },
    launchedAt: new Date().toISOString(),
  };
  seedStore(fixture.machine, JSON.stringify({ "sample-app": [record] }));
  const records = readFileSync(storeFile(fixture.machine), "utf8");
  const marker = path.join(fixture.checkout, "keep-this.txt");
  writeFileSync(marker, "local work stays\n");
  const gitConfig = readFileSync(
    path.join(fixture.checkout, ".git/config"),
    "utf8",
  );
  let server = await fixture.start("preview");
  await page.goto(server.baseURL);
  await addProjectOnPage(page);
  const recent = page.getByRole("region", { name: "Recently done" });
  await expect(recent).toContainText("Retained sample session", {
    timeout: 5_000,
  });
  await page.getByRole("button", { name: "Sessions", exact: true }).click();
  const sidebar = page.getByRole("complementary", { name: "Sessions" });
  await expect(sidebar).toContainText("Retained sample session");
  const file = fixture.configurationFile("preview");
  const before = readFileSync(file, "utf8");
  await openSettings(page);
  for (const dismissal of ["Cancel", "Escape"]) {
    await removeButton(page).focus();
    await page.keyboard.press("Enter");
    const dialog = page.getByRole("dialog", {
      name: "Remove Sample App?",
      exact: true,
    });
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
    await expect(removeButton(page)).toBeFocused();
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
    await removeButton(page).click();
    const dialog = page.getByRole("dialog", {
      name: "Remove Sample App?",
      exact: true,
    });
    await dialog.getByRole("button", { name: "Remove", exact: true }).click();
    await expect(dialog).toBeHidden();
    await back(page);
    await expect(
      page.getByRole("radio", { name: "Sample App", exact: true }),
    ).toHaveCount(0);
    await expect(
      page.getByRole("radio", { name: "Open Dough", exact: true }),
    ).toBeChecked();
    await expect(
      page.getByRole("radio", { name: "Open Dough", exact: true }),
    ).not.toBeFocused();
    await expect(
      page.getByRole("button", { name: "System settings", exact: true }),
    ).toBeFocused();
    await expect(recent).not.toContainText("Retained sample session", {
      timeout: 1_000,
    });
    await expect(sidebar).not.toContainText("Retained sample session", {
      timeout: 1_000,
    });
    await expect.poll(() => readHeld, { timeout: 1_000 }).toBe(true);
  } finally {
    releaseSessions();
  }
  expect(readFileSync(marker, "utf8")).toBe("local work stays\n");
  expect(readFileSync(path.join(fixture.checkout, ".git/config"), "utf8")).toBe(
    gitConfig,
  );
  expect(readFileSync(storeFile(fixture.machine), "utf8")).toBe(records);
  expect(
    (JSON.parse(readFileSync(file, "utf8")) as { id: string }[]).map(
      ({ id }) => id,
    ),
  ).toEqual(["open-dough", "doughnut", "pygardon", "terry-talks"]);
  // Removing a project leaves the runner's address and log. They are not a
  // project record.
  expect(readdirSync(path.dirname(file)).sort()).toEqual([
    "agent-launches.json",
    "cursor-runner.json",
    "cursor-runner.log",
    "projects-production.json",
  ]);
  await fixture.stop(server);
  server = await fixture.start("preview");
  await page.goto(server.baseURL);
  await expect(page.getByRole("radio")).toHaveCount(4);
  await expect(page.getByRole("radio", { name: "Sample App" })).toHaveCount(0);
  await addProjectOnPage(page);
  await expect(recent).toContainText("Retained sample session", {
    timeout: 5_000,
  });
  const sessions = page.getByRole("button", { name: "Sessions", exact: true });
  if ((await sessions.getAttribute("aria-expanded")) !== "true")
    await sessions.click();
  await expect(sidebar).toContainText("Retained sample session", {
    timeout: 5_000,
  });
  expect(readFileSync(storeFile(fixture.machine), "utf8")).toBe(records);
});

test("removing the last project leaves a persistent focused empty state", async ({
  page,
}) => {
  const server = await fixture.start("dev");
  await page.goto(server.baseURL);
  await addProjectOnPage(page);
  await openSettings(page);
  await removeButton(page).click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Remove", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "System settings", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Add project", exact: true }),
  ).toBeFocused();
  await expect(removeButton(page)).toHaveCount(0);
  expect(
    JSON.parse(readFileSync(fixture.configurationFile("dev"), "utf8")),
  ).toEqual([]);
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "System settings", exact: true }),
  ).toBeVisible();
  await back(page);
  await expect(
    page.getByRole("heading", { name: "No projects configured" }),
  ).toBeVisible();
  await addProjectOnPage(page);
  await openSettings(page);
  await expect(removeButton(page)).toBeEnabled();
});

test("removing the first project selects its next neighbor and reads that project's actual repository", async ({
  page,
}) => {
  const server = await fixture.start("preview");
  await page.goto(server.baseURL);
  await expect(
    page.getByRole("radio", { name: "Open Dough", exact: true }),
  ).toBeChecked();
  await openSettings(page);
  await removeButton(page, "Open Dough").click();
  await page
    .getByRole("dialog", { name: "Remove Open Dough?", exact: true })
    .getByRole("button", { name: "Remove", exact: true })
    .click();
  await back(page);
  const next = page.getByRole("radio", { name: "Doughnut", exact: true });
  await expect(next).toBeChecked();
  await expect(
    page.getByRole("button", { name: "System settings", exact: true }),
  ).toBeFocused();
  await expect(
    page.getByRole("region", { name: "Published Git state" }),
  ).toContainText("nerds-odd-e/doughnut");
  await expect
    .poll(() => server.ghCalls(), { timeout: 5_000 })
    .toContainEqual([
      "api",
      "repos/nerds-odd-e/doughnut/commits/main",
      "--jq",
      ".sha",
    ]);
  expect(
    (
      JSON.parse(
        readFileSync(fixture.configurationFile("preview"), "utf8"),
      ) as { id: string }[]
    ).map(({ id }) => id),
  ).toEqual(["doughnut", "pygardon", "terry-talks"]);
});
