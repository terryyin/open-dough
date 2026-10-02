// Recovery presentation can read a known host with no native-check advice.
// This machine-evidence fixture supplies only an eligible attempt; it does
// not offer or invoke a Cursor launch or continuation operation.
import {
  agentLaunchEndpoint,
  launchRecordsSchema,
} from "../src/agentLaunch.ts";
import { expect, test } from "./dashboardTest.ts";
import { openTakenBacklog } from "./launchCardPage.ts";
import { publishLaunchJourney, type LaunchJourney } from "./launchJourney.ts";
import { recoveryOf } from "./responsiveRecovery.ts";

let journey: LaunchJourney;
test.beforeAll(async () => {
  test.setTimeout(120_000);
  journey = await publishLaunchJourney();
});
test.afterAll(() => (journey as LaunchJourney | undefined)?.cleanup());

test("a recovery host without native-check advice keeps its controls without borrowed advice or a description reference", async ({
  page,
}) => {
  await page.route(
    (url) => url.pathname === agentLaunchEndpoint,
    async (route) => {
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
    },
  );
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
