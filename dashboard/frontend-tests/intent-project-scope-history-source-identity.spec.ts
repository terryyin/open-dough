import {
  scopeHistory,
  scopeHistoryReading,
} from "../tests/intentScopeHistoryPage.ts";
// Same-ID source configuration changes cannot inherit a different source's answer.
import { makeMe } from "../../tests/support/makeMe.mjs";
import {
  expect,
  test,
  mountComparison,
} from "../tests/support/comparisonMountPage.ts";
import { summaryScopeFacts } from "../tests/support/comparisonScopeFacts.ts";
import {
  scopeHistoryPoint,
  serveUnreadProjectCi,
} from "../tests/support/projectScopeHistoryFacts.ts";

for (const changed of ["repository", "ref"] as const) {
  test(`a changed ${changed} with the same project ID and endpoint does not keep another source's history`, async ({
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
      await route.fulfill(
        reads === 1
          ? {
              json: scopeHistoryPoint(
                work.revision,
                params.get("scope") ?? "",
                8000,
              ),
            }
          : { status: 502, json: { error: "New source history unavailable" } },
      );
    });
    await mountComparison(page, comparisonServer, project);
    const history = scopeHistory(page);
    const evidence = scopeHistoryReading(history).readout;
    await expect(evidence).toContainText("8.0 s");
    const source = makeMe.aPublishedSource
      .with({
        ...facts.source,
        ...(changed === "repository"
          ? { repository: "example/another-repository" }
          : { ref: "trunk" }),
      })
      .please();
    // Keep the page and disposable reading place mounted while configuration
    // supplies another source under the same ID; this is a provider boundary.
    await page.evaluate(
      (value) => {
        window.mountCiComparison(value);
      },
      { source, work, identity: undefined, scope: project.scope },
    );
    await expect(scopeHistoryReading(history).failure).toContainText(
      "New source history unavailable",
    );
    await expect(evidence).toHaveCount(0);
    await expect(history).not.toContainText("Previously retrieved history");
    expect(reads).toBe(2);
  });
}
