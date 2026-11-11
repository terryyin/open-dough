// Real evidence provider updates retain observation identity and reject late replies.
import { makeMe } from "../../tests/support/makeMe.mjs";
import { shortSha } from "../src/baseCiWording.ts";
import {
  expect,
  test,
  mountComparison,
  updateComparison,
} from "../tests/support/comparisonMountPage.ts";
import {
  givePageItsTurns,
  untilPageReadsAnswered,
} from "../tests/pageRequestNotes.ts";
import { summaryScopeFacts } from "../tests/support/comparisonScopeFacts.ts";
import {
  scopeHistoryPoint,
  serveUnreadProjectCi,
} from "../tests/support/projectScopeHistoryFacts.ts";

test("a newer timestamp at the same head issues no history read, and a late old endpoint reply cannot replace the new one", async ({
  page,
  comparisonServer,
}) => {
  const facts = summaryScopeFacts();
  const first = "a".repeat(40);
  const next = "b".repeat(40);
  const initial = makeMe.aPublishedWork
    .with({
      ...facts.work,
      revision: first,
      retrievedAt: new Date("2026-11-11T07:00:00Z"),
    })
    .please();
  await serveUnreadProjectCi(page, "c".repeat(40));
  let release: (() => void) | undefined;
  const held = new Promise<void>((resolve) => {
    release = resolve;
  });
  let answered: (() => void) | undefined;
  const oldAnswered = new Promise<void>((resolve) => {
    answered = resolve;
  });
  const requests: string[] = [];
  await page.route(/intent=ci-history/, async (route) => {
    const params = new URL(route.request().url()).searchParams;
    if (!params.has("scope")) {
      await route.fulfill({
        status: 502,
        json: { error: "No wall history arranged" },
      });
      return;
    }
    const revision = params.get("revision") ?? "";
    requests.push(revision);
    if (revision === first) await held;
    await route.fulfill({
      json: scopeHistoryPoint(
        revision,
        params.get("scope") ?? "",
        revision === first ? 8000 : 11000,
      ),
    });
    if (revision === first) answered?.();
  });
  const project = { ...facts, identity: undefined, work: initial };
  try {
    await mountComparison(page, comparisonServer, project);
    const history = page.getByRole("region", {
      name: "Test execution time history",
      exact: true,
    });
    await expect.poll(() => requests).toEqual([first]);
    await updateComparison(page, {
      ...project,
      work: makeMe.aPublishedWork
        .with({ ...initial, retrievedAt: new Date("2026-11-11T07:02:00Z") })
        .please(),
    });
    await givePageItsTurns(page);
    await expect(history.locator("time").first()).toHaveAttribute(
      "datetime",
      "2026-11-11T07:00:00.000Z",
    );
    expect(requests).toEqual([first]);
    await updateComparison(page, {
      ...project,
      work: makeMe.aPublishedWork
        .with({
          ...initial,
          revision: next,
          retrievedAt: new Date("2026-11-11T07:03:00Z"),
        })
        .please(),
    });
    await expect(history).toContainText(
      `Observed trunk endpoint main ${shortSha(next)}`,
    );
    await expect(history.getByRole("listitem")).toContainText("11.0 s");
    release?.();
    await oldAnswered;
    await untilPageReadsAnswered(page);
    await expect(history).not.toContainText("8.0 s");
    await expect(history.getByRole("listitem")).toContainText("11.0 s");
    expect(requests).toEqual([first, next]);
  } finally {
    release?.();
  }
});
