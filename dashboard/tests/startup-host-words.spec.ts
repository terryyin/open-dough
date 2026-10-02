// Recovery presentation can read a known host with no native-check advice.
// This machine-evidence fixture supplies only an eligible attempt; it does
// not offer or invoke a Cursor launch or continuation operation.
import {
  agentLaunchEndpoint,
  launchRecordsSchema,
} from "../src/agentLaunch.ts";
import { expect, test } from "./dashboardTest.ts";
import { openTakenBacklog } from "./launchCardPage.ts";
import {
  publishLaunchJourney,
  readyStory,
  type LaunchJourney,
} from "./launchJourney.ts";
import { recoveryOf } from "./responsiveRecovery.ts";

let journey: LaunchJourney;
test.beforeAll(async () => {
  test.setTimeout(120_000);
  journey = await publishLaunchJourney();
});
test.afterAll(() => (journey as LaunchJourney | undefined)?.cleanup());
test.afterEach(async ({ page }) => {
  // Background session reads can outlive the last assertion. Finish their
  // intercepted answers before Playwright disposes the context's responses.
  await page.unrouteAll({ behavior: "wait" });
});

test.afterEach(async ({ page }) => {
  // The page keeps reading startup evidence; finish its route callbacks before
  // the context fixture disposes their fetched responses.
  await page.unrouteAll({ behavior: "wait" });
});

test("without a reported phase, story startup keeps its host and the installed start's Preparing versus Starting choice", async ({
  page,
}) => {
  // Supply only accepted, owned startup evidence and the installed capability.
  // No native launch is performed and no running start reports a phase.
  let host: "claude" | "codex" = "claude";
  let workflow: "execution" | "refinement" = "execution";
  let establishes = false;
  await page.route(`**${agentLaunchEndpoint}`, async (route) => {
    const response = await route.fetch({
      headers: {
        ...route.request().headers(),
        Origin: new URL(route.request().url()).origin,
      },
    });
    expect(response.status()).toBe(200);
    await route.fulfill({
      response,
      json: {
        ...launchRecordsSchema.parse(await response.json()),
        starts: [],
        establishing:
          establishes && workflow === "execution" ? ["open-dough"] : [],
        establishingPreparation:
          establishes && workflow === "refinement" ? ["open-dough"] : [],
        establishingHosts: establishes
          ? [{ source: "open-dough", host, workflow }]
          : [],
        attempts: [
          {
            id: "12345678-1234-4123-8123-123456789abc",
            request: {
              source: "open-dough",
              identity: "SEED-B#b",
              title: readyStory,
              host,
              workflow,
            },
            acceptedAt: "2026-10-02T00:00:00.000Z",
            publication: { kind: "none" },
            owned: true,
          },
        ],
      },
    });
  });
  const { card } = await openTakenBacklog(page, journey);
  const starting = card(readyStory);
  for (host of ["claude", "codex"] as const) {
    for (workflow of ["execution", "refinement"] as const) {
      for (establishes of [false, true]) {
        await page.reload();
        const words = establishes
          ? `Preparing ${workflow}…`
          : `Starting ${workflow} in ${host === "claude" ? "Claude Code" : "Codex"}…`;
        await expect(starting.locator(".launch-answer")).toHaveText(words);
        await expect(starting).toContainText(
          "Local startup in progress; this story's actions are unavailable until it settles.",
        );
        await expect(
          starting.getByRole("button", { name: "Start execution" }),
        ).toBeDisabled();
        await expect(
          starting.getByRole("button", { name: "Start refinement" }),
        ).toBeDisabled();
        await expect(starting).not.toContainText(
          "Startup needs reconciliation",
        );
        await expect(starting).not.toContainText(
          "Waiting for published story state",
        );
      }
    }
  }
});

test("a recovery host without native-check advice keeps its controls without borrowed advice or a description reference", async ({
  page,
}) => {
  await page.route(`**${agentLaunchEndpoint}`, async (route) => {
    const response = await route.fetch({
      headers: {
        ...route.request().headers(),
        Origin: new URL(route.request().url()).origin,
      },
    });
    expect(response.status()).toBe(200);
    await route.fulfill({
      response,
      json: {
        ...launchRecordsSchema.parse(await response.json()),
        attempts: [
          {
            id: "12345678-1234-4123-8123-123456789abc",
            request: {
              source: "open-dough",
              host: "cursor",
              workflow: "ad-hoc",
            },
            acceptedAt: "2026-10-02T00:00:00.000Z",
            publication: { kind: "none" },
            owned: false,
          },
        ],
      },
    });
  });
  await openTakenBacklog(page, journey);
  const recovery = recoveryOf(page);
  await expect(recovery).toContainText(
    "Ad hoc session · session start in Cursor",
  );
  await expect(recovery).toContainText("It never settled.");
  await expect(
    recovery.getByRole("button", { name: "Recheck Ad hoc session" }),
  ).toBeEnabled();
  const continueStart = recovery.getByRole("button", {
    name: "Continue session start of Ad hoc session",
  });
  await expect(continueStart).toBeEnabled();
  await expect(recovery).not.toContainText("before continuing");
  await expect(recovery.locator('[id$="-check"]')).toHaveCount(0);
  await expect(continueStart).not.toHaveAttribute("aria-describedby");
  await expect(continueStart).toHaveAccessibleDescription("");
});
