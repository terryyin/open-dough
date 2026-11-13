import {
  scopeHistory,
  scopeHistoryReading,
} from "../tests/intentScopeHistoryPage.ts";
// The page keeps disposable reading state when the Intent provider unmounts.
import { makeMe } from "../../tests/support/makeMe.mjs";
import {
  expect,
  test,
  mountComparison,
  updateComparison,
} from "../tests/support/comparisonMountPage.ts";
import { summaryScopeFacts } from "../tests/support/comparisonScopeFacts.ts";
import {
  scopeHistoryPoint,
  serveUnreadProjectCi,
} from "../tests/support/projectScopeHistoryFacts.ts";

test("reentering Intent after a same-head snapshot refresh keeps the observed endpoint and prior answer when local history fails", async ({
  page,
  comparisonServer,
}) => {
  const facts = summaryScopeFacts();
  const work = makeMe.aPublishedWork
    .with({ ...facts.work, retrievedAt: new Date("2026-11-11T07:00:00Z") })
    .please();
  const project = { ...facts, work, identity: undefined };
  await serveUnreadProjectCi(page, "a".repeat(40));
  let reads = 0;
  const through: string[] = [];
  await page.route(/intent=ci-history/, async (route) => {
    const params = new URL(route.request().url()).searchParams;
    if (!params.has("scope")) {
      await route.fulfill({
        status: 502,
        json: { error: "No wall history arranged" },
      });
      return;
    }
    reads += 1;
    through.push(params.get("through") ?? "");
    await route.fulfill(
      reads === 1
        ? {
            json: scopeHistoryPoint(
              work.revision,
              params.get("scope") ?? "",
              8000,
            ),
          }
        : {
            status: 502,
            json: { error: "Local history failed after reentry" },
          },
    );
  });
  await mountComparison(page, comparisonServer, project);
  const history = scopeHistory(page);
  await expect(scopeHistoryReading(history).selected).toContainText("8.0 s");
  await updateComparison(page, { ...project, shown: false });
  await expect(history).toHaveCount(0);
  const refreshed = makeMe.aPublishedWork
    .with({ ...work, retrievedAt: new Date("2026-11-11T07:03:00Z") })
    .please();
  await updateComparison(page, { ...project, shown: false, work: refreshed });
  await updateComparison(page, { ...project, work: refreshed });
  await expect(scopeHistoryReading(history).failure).toContainText(
    "Local history failed after reentry",
  );
  await expect(scopeHistoryReading(history).endpointTime).toHaveAttribute(
    "datetime",
    "2026-11-11T07:00:00.000Z",
  );
  await expect(scopeHistoryReading(history).selected).toContainText("8.0 s");
  await expect(history).toContainText("Previously retrieved history");
  expect(through).toEqual([
    "2026-11-11T07:00:00.000Z",
    "2026-11-11T07:00:00.000Z",
  ]);
});
