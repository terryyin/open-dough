// Changing scope/project cannot relabel an earlier local read as current proof.
import { parts } from "../tests/dashboardPage.ts";
import { chooseProject } from "../tests/projectChoice.ts";
import { fileReadingTab, proofRegion } from "../tests/intentPerspectivePage.ts";
import { openSummary } from "../tests/intentSummaryCiProofFixtures.ts";
import {
  openUntilRead,
  untilPageReadsAnswered,
} from "../tests/pageRequestNotes.ts";
import { expect, test } from "../tests/support/frontendApp.ts";
import { doughnutSource } from "../tests/support/frontendServiceState.ts";
import {
  scopeHistoryPoint,
  serveUnreadProjectCi,
} from "../tests/support/projectScopeHistoryFacts.ts";
import { childName } from "../tests/intentScopeProofPage.ts";

test("late entry history cannot replace another file or project's history while live Proof is absent", async ({
  page,
  frontendServices,
}) => {
  Object.assign(frontendServices, {
    projects: [...frontendServices.projects, doughnutSource],
  });
  const revision = frontendServices.revision;
  await serveUnreadProjectCi(page, "a".repeat(40));
  let release: (() => void) | undefined;
  let answered: (() => void) | undefined;
  const held = new Promise<void>((resolve) => {
    release = resolve;
  });
  const oldAnswered = new Promise<void>((resolve) => {
    answered = resolve;
  });
  const requests: string[] = [];
  await page.route(/intent=ci-history.*scope=/, async (route) => {
    const params = new URL(route.request().url()).searchParams;
    const source = params.get("source") ?? "";
    const path = params.get("scope") ?? "";
    requests.push(`${source}:${path}`);
    const old = source === "open-dough" && path === "dashboard/tests";
    if (old) await held;
    const duration = old ? 8000 : source === "open-dough" ? 11000 : 9000;
    await route.fulfill({ json: scopeHistoryPoint(revision, path, duration) });
    if (old) answered?.();
  });
  try {
    await openUntilRead(page, "/?project=open-dough&perspective=intent");
    const { intent } = parts(page);
    const entry = await openSummary(intent, "dashboard/tests");
    await expect.poll(() => requests).toEqual(["open-dough:dashboard/tests"]);
    const path = "dashboard/tests/example.spec.ts";
    await childName(entry, "example.spec.ts").first().click();
    await fileReadingTab(intent, "Proof").click();
    const file = proofRegion(intent);
    const history = file.getByRole("region", {
      name: "Test execution time history",
      exact: true,
    });
    await expect(history.getByRole("listitem")).toContainText("11.0 s");
    await expect(file).toContainText("Live proof unavailable");
    await chooseProject(page, "Doughnut");
    await parts(page).intentChoice.click();
    const summary = await openSummary(parts(page).intent, "dashboard/tests");
    const current = summary.getByRole("region", {
      name: "Test execution time history",
      exact: true,
    });
    await expect(current.getByRole("listitem")).toContainText("9.0 s");
    release?.();
    await oldAnswered;
    await untilPageReadsAnswered(page);
    await expect(
      current.getByRole("list", { name: "Test execution history evidence" }),
    ).not.toContainText("8.0 s");
    await expect(current.getByRole("listitem")).toContainText("9.0 s");
    expect(requests).toEqual([
      "open-dough:dashboard/tests",
      `open-dough:${path}`,
      "doughnut:dashboard/tests",
    ]);
  } finally {
    release?.();
  }
});

test("a failed new file read cannot retain the entry's answer at the same project endpoint", async ({
  page,
  frontendServices,
}) => {
  const revision = frontendServices.revision;
  await serveUnreadProjectCi(page, "a".repeat(40));
  const requests: string[] = [];
  await page.route(/intent=ci-history.*scope=/, async (route) => {
    const path = new URL(route.request().url()).searchParams.get("scope") ?? "";
    requests.push(path);
    await route.fulfill(
      path === "dashboard/tests"
        ? {
            json: scopeHistoryPoint(revision, path, 8000),
          }
        : { status: 502, json: { error: "File local history unavailable" } },
    );
  });
  await openUntilRead(page, "/?project=open-dough&perspective=intent");
  const { intent } = parts(page);
  const entry = await openSummary(intent, "dashboard/tests");
  await expect(
    entry.getByRole("list", { name: "Test execution history evidence" }),
  ).toContainText("8.0 s");
  await childName(entry, "example.spec.ts").first().click();
  await fileReadingTab(intent, "Proof").click();
  const file = proofRegion(intent);
  const history = file.getByRole("region", {
    name: "Test execution time history",
    exact: true,
  });
  await expect(history.getByRole("alert")).toContainText(
    "File local history unavailable",
  );
  await expect(
    history.getByRole("list", { name: "Test execution history evidence" }),
  ).toHaveCount(0);
  await expect(history).not.toContainText("Previously retrieved history");
  await expect(file).toContainText("Live proof unavailable");
  expect(requests).toEqual([
    "dashboard/tests",
    "dashboard/tests/example.spec.ts",
  ]);
});
