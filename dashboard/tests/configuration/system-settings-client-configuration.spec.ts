import { chmodSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { expect, test } from "../support/pageTest.ts";
import { projectConfigurationMachine } from "../support/projectConfigurationMachine.ts";
import { rawRequest } from "../support/rawHttp.ts";
import { makeMe } from "../../../tests/support/makeMe.mjs";
import { machineHome } from "../machineLaunchRecords.ts";
import {
  back,
  hideButton,
  projectRow,
  removeButton,
  showButton,
} from "../support/systemSettingsPage.ts";

const alphaText = '{\n  "project": "alpha-config",\n  "extra": true\n}\n';
const betaText = '{\n  "project": "beta-config"\n}\n';
const invalidText = "{ not valid json for inspection\n";
const absentExplanation =
  "The Client configuration file (.planning/open-dough.json) is absent.";
const unreadableExplanation =
  "The Client configuration could not be read from this project's local checkout.";

let fixture: ReturnType<typeof projectConfigurationMachine>;
test.beforeEach(() => {
  fixture = projectConfigurationMachine();
});
test.afterEach(async () => {
  try {
    chmodSync(checkoutFile(machineHome(fixture.machine), "delta"), 0o644);
  } catch {
    // The unreadable fixture may already be gone with the machine.
  }
  await fixture.close();
});

function checkoutFile(home: string, folder: string): string {
  return path.join(home, "git", folder, ".planning", "open-dough.json");
}

function writeClientConfiguration(home: string, folder: string, text: string) {
  const file = checkoutFile(home, folder);
  mkdirSync(path.dirname(file), { recursive: true });
  writeFileSync(file, text);
  return file;
}

test("each Projects entry shows that project's Client configuration text or its own absence or unreadability", async ({
  page,
}) => {
  const home = machineHome(fixture.machine);
  const alphaFile = writeClientConfiguration(home, "alpha", alphaText);
  writeClientConfiguration(home, "beta", betaText);
  mkdirSync(path.join(home, "git", "gamma", ".planning"), { recursive: true });
  const deltaFile = writeClientConfiguration(home, "delta", alphaText);
  chmodSync(deltaFile, 0o000);
  writeClientConfiguration(home, "epsilon", invalidText);
  const beforeAlpha = readFileSync(alphaFile);
  fixture.save(
    JSON.stringify([
      makeMe.aConfiguredProject
        .with({
          id: "alpha",
          label: "Alpha",
          repository: "example/alpha",
          localPath: "~/git/alpha",
        })
        .please(),
      makeMe.aConfiguredProject
        .with({
          id: "beta",
          label: "Beta",
          repository: "example/beta",
          localPath: "~/git/beta",
        })
        .please(),
      makeMe.aConfiguredProject
        .with({
          id: "gamma",
          label: "Gamma",
          repository: "example/gamma",
          localPath: "~/git/gamma",
        })
        .please(),
      makeMe.aConfiguredProject
        .with({
          id: "delta",
          label: "Delta",
          repository: "example/delta",
          localPath: "~/git/delta",
        })
        .please(),
      makeMe.aConfiguredProject
        .with({
          id: "epsilon",
          label: "Epsilon",
          repository: "example/epsilon",
          localPath: "~/git/epsilon",
        })
        .please(),
      makeMe.aConfiguredProject
        .with({
          id: "missing",
          label: "Missing",
          repository: "example/missing",
          localPath: "~/git/missing-checkout",
        })
        .please(),
    ]),
  );
  const server = await fixture.start("preview");
  await page.goto(`${server.baseURL}/?view=settings`);
  await expect(
    page.getByRole("heading", { name: "System settings", exact: true }),
  ).toBeVisible();
  const alpha = projectRow(page, "Alpha");
  const beta = projectRow(page, "Beta");
  const gamma = projectRow(page, "Gamma");
  const delta = projectRow(page, "Delta");
  const epsilon = projectRow(page, "Epsilon");
  const missing = projectRow(page, "Missing");
  await expect(alpha).toContainText(alphaText.trim());
  await expect(alpha).not.toContainText(betaText.trim());
  await expect(beta).toContainText(betaText.trim());
  await expect(beta).not.toContainText(alphaText.trim());
  await expect(gamma).toContainText(absentExplanation);
  await expect(gamma).not.toContainText(alphaText.trim());
  await expect(delta).toContainText(unreadableExplanation);
  await expect(delta).not.toContainText(alphaText.trim());
  await expect(missing).toContainText(unreadableExplanation);
  await expect(missing).not.toContainText(alphaText.trim());
  await expect(epsilon).toContainText(invalidText.trim());
  await expect(epsilon).not.toContainText(alphaText.trim());
  await expect(alpha).toContainText("~/git/alpha");
  await expect(page.getByRole("button", { name: "Add project" })).toBeVisible();
  await expect(hideButton(page, "Alpha")).toBeVisible();
  await expect(removeButton(page, "Alpha")).toBeVisible();
  await expect(showButton(page, "Alpha")).toHaveCount(0);
  await expect(
    page.getByRole("heading", { name: "OpenAI", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Terminal theme", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Feedback maintenance", exact: true }),
  ).toBeVisible();
  for (const row of [alpha, beta, gamma, delta, epsilon, missing]) {
    await expect(row.getByRole("textbox")).toHaveCount(0);
    await expect(row.locator("textarea")).toHaveCount(0);
    await expect(
      row.getByRole("button", { name: /save|edit|write/i }),
    ).toHaveCount(0);
  }
  const facts = await rawRequest({
    url: `${server.baseURL}/__project-configuration/settings`,
    headers: { Origin: server.origin },
  });
  expect(facts.status).toBe(200);
  expect(facts.headers["cache-control"]).toBe("no-store");
  expect(JSON.parse(facts.body)).toEqual([
    {
      id: "alpha",
      localPath: "~/git/alpha",
      clientConfiguration: { status: "readable", text: alphaText },
    },
    {
      id: "beta",
      localPath: "~/git/beta",
      clientConfiguration: { status: "readable", text: betaText },
    },
    {
      id: "gamma",
      localPath: "~/git/gamma",
      clientConfiguration: { status: "absent" },
    },
    {
      id: "delta",
      localPath: "~/git/delta",
      clientConfiguration: { status: "unreadable" },
    },
    {
      id: "epsilon",
      localPath: "~/git/epsilon",
      clientConfiguration: { status: "readable", text: invalidText },
    },
    {
      id: "missing",
      localPath: "~/git/missing-checkout",
      clientConfiguration: { status: "unreadable" },
    },
  ]);
  expect(
    (
      await rawRequest({
        url: `${server.baseURL}/__project-configuration/settings`,
        headers: { Origin: "https://example.com" },
      })
    ).status,
  ).toBe(403);
  expect(
    (
      await rawRequest({
        url: `${server.baseURL}/__project-configuration/settings`,
        method: "POST",
        headers: { Origin: server.origin },
      })
    ).status,
  ).toBe(405);
  await back(page).click();
  await expect(
    page.getByRole("heading", { name: "System settings", exact: true }),
  ).toHaveCount(0);
  expect(readFileSync(alphaFile)).toEqual(beforeAlpha);
});
