import {
  scopeHistory,
  scopeHistoryReading,
} from "../tests/intentScopeHistoryPage.ts";
// Same-head reads, snapshot timestamps and refresh failures use only local history.
import { shortSha } from "../src/baseCiWording.ts";
import { parts } from "../tests/dashboardPage.ts";
import { pausePageClockAt } from "../tests/dashboardTest.ts";
import { activateIntentHome } from "../tests/intentCiStatusPage.ts";
import { openSummary } from "../tests/intentSummaryCiProofFixtures.ts";
import {
  openUntilRead,
  passCheckPace,
  untilPageReadsAnswered,
} from "../tests/pageRequestNotes.ts";
import { expect, test } from "../tests/support/frontendApp.ts";
import {
  scopeHistoryPoint,
  serveUnreadProjectCi,
} from "../tests/support/projectScopeHistoryFacts.ts";

test("Check again refreshes the same observed head, while time-only checks and failed reads keep their own freshness", async ({
  page,
  frontendServices,
}) => {
  await pausePageClockAt(page, new Date("2026-11-11T07:00:00Z"));
  const revision = frontendServices.revision;
  await serveUnreadProjectCi(page, "a".repeat(40));
  // Frontend app pages hold a real stream slot; answer that boundary as SSE.
  await page.route(
    (url) => url.searchParams.has("since") || url.searchParams.has("at"),
    async (route) => {
      const params = new URL(route.request().url()).searchParams;
      const answer = {
        revision: frontendServices.revision,
        changed:
          frontendServices.revision !==
          (params.get("since") ?? params.get("at")),
        branches: [],
      };
      await route.fulfill(
        params.has("at")
          ? {
              contentType: "text/event-stream",
              body: `data: ${JSON.stringify(answer)}\n\n`,
            }
          : { json: answer },
      );
    },
  );
  let duration = 8000;
  let fail = false;
  let release: (() => void) | undefined;
  let held: Promise<void> | undefined;
  const endpoints: string[] = [];
  await page.route(/intent=ci-history.*scope=/, async (route) => {
    const params = new URL(route.request().url()).searchParams;
    const endpoint = params.get("revision") ?? "";
    endpoints.push(endpoint);
    await held;
    await route.fulfill(
      fail
        ? { status: 502, json: { error: "Matching history refresh failed" } }
        : {
            json: scopeHistoryPoint(
              endpoint,
              params.get("scope") ?? "",
              duration,
            ),
          },
    );
  });
  await openUntilRead(page, "/?project=open-dough&perspective=intent");
  const { intent } = parts(page);
  const summary = await openSummary(intent, "dashboard/tests");
  const history = scopeHistory(summary);
  const evidence = scopeHistoryReading(history).evidence;
  await expect(evidence).toContainText("8.0 s");
  await expect(history).toContainText("History read");
  const observed =
    await scopeHistoryReading(history).endpointTime.getAttribute("datetime");
  const firstAnswer =
    await scopeHistoryReading(history).answeredAt.getAttribute("datetime");
  await untilPageReadsAnswered(page);
  await passCheckPace(page);
  await untilPageReadsAnswered(page);
  expect(endpoints).toEqual([revision]);
  await expect(scopeHistoryReading(history).endpointTime).toHaveAttribute(
    "datetime",
    observed ?? "",
  );

  duration = 11000;
  const home = await activateIntentHome(intent);
  await home.getByRole("button", { name: "Check again", exact: true }).click();
  held = new Promise<void>((resolve) => {
    release = resolve;
  });
  try {
    await openSummary(intent, "dashboard/tests");
    await expect.poll(() => endpoints.length).toBe(2);
    await expect(evidence).toContainText("8.0 s");
    await expect(history).toContainText("Previously retrieved history");
  } finally {
    release?.();
    held = undefined;
  }
  await expect(evidence).toContainText("11.0 s");
  await expect(history).not.toContainText("Previously retrieved history");
  await expect(scopeHistoryReading(history).answeredAt).not.toHaveAttribute(
    "datetime",
    firstAnswer ?? "",
  );

  await activateIntentHome(intent);
  await home.getByRole("button", { name: "Check again", exact: true }).click();
  fail = true;
  await openSummary(intent, "dashboard/tests");
  await expect(scopeHistoryReading(history).failure).toContainText(
    "Matching history refresh failed",
  );
  await expect(evidence).toContainText("11.0 s");
  await expect(history).toContainText("Previously retrieved history");
  await expect(summary.getByRole("table")).toBeVisible();
  fail = false;
  duration = 9000;
  await scopeHistoryReading(history).retry.click();
  await expect(evidence).toContainText("9.0 s");
  await expect(scopeHistoryReading(history).failure).toHaveCount(0);
  expect(endpoints).toEqual([revision, revision, revision, revision]);

  const next = "b".repeat(40);
  Object.assign(frontendServices, { revision: next });
  await passCheckPace(page);
  await untilPageReadsAnswered(page);
  await expect(history).toContainText(
    `Observed trunk endpoint main ${shortSha(next)}`,
  );
  expect(endpoints).toEqual([revision, revision, revision, revision, next]);
  await expect(evidence).toContainText("9.0 s");
  await expect(scopeHistoryReading(history).endpointTime).not.toHaveAttribute(
    "datetime",
    observed ?? "",
  );
});
