// Reading Intent's CI status (../src/IntentCiStatus.tsx) again and from its
// configured source: a 404 on main's history or runs is Could not be read
// with its reason, Check again replaces a judgment that could not be read, a
// ciAdapter project is judged from its discover attempts (SEED-219 example
// 8), and the boundary read refuses unsafe judged branch names, the shared
// branch-read parameter, and a pinned revision before asking GitHub. The tab
// itself is in ./intent-ci-status.spec.ts; a running head with its nearest
// completed ancestor, and Check again after it finishes showing Passed
// (SEED-219 example 7), is the "a running head…" step of
// ./intent-ci-status-story.spec.ts.

import { writeFileSync, mkdirSync, chmodSync } from "node:fs";
import path from "node:path";
import { expect, test } from "./dashboardTest.ts";
import { parts } from "./dashboardPage.ts";
import { openDough } from "./intentCodeBrowseFixtures.ts";
import {
  chooseCiStatus,
  expectChecked,
  judged,
  judgmentCalls,
  publishProject,
  runUrl,
  trunkCi,
} from "./intentCiStatusPage.ts";
import { openUntilRead } from "./pageRequestNotes.ts";
import { httpErrorAnswer } from "./originAnswers.ts";
import { authenticatedReadEndpoint } from "../src/authenticatedReadRules.ts";

test("CI status that could not be read names main and the reason; Check again reads it again", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  let historyMissing = true;
  let runsMissing = true;
  const published = publishProject(page, openDough);
  const ci = trunkCi(openDough.revision, () =>
    runsMissing
      ? httpErrorAnswer(404, "Not Found")
      : [{ headSha: judged, conclusion: "success", url: runUrl }],
  );
  published.serveCi((call) =>
    historyMissing &&
    call.request.kind === "commit-list" &&
    call.request.revision === "main"
      ? httpErrorAnswer(404, "Not Found")
      : ci(call),
  );
  await openUntilRead(page);
  const { intent, intentChoice } = parts(page);
  await intentChoice.click();
  const panel = await chooseCiStatus(intent);
  const heading = panel.getByRole("heading", { name: "CI status of main" });

  await test.step("a 404 on main's history is Could not be read with its reason, never not published", async () => {
    await expect(heading).toBeVisible();
    await expect(panel.locator(".intent-ci-state")).toHaveText(
      "Could not be read",
    );
    const reason = panel.locator(".intent-ci-reason");
    await expect(reason).toContainText("404");
    await expect(reason).toContainText("/commits?sha=main");
    await expect(panel).not.toContainText("not published");
    await expect(panel).not.toContainText(/passed/i);
    await expectChecked(panel);
  });

  await test.step("a 404 on the runs is Could not be read with its reason", async () => {
    historyMissing = false;
    await panel.getByRole("button", { name: "Check again" }).click();
    await expect(panel.locator(".intent-ci-reason")).toContainText(
      /\/actions\/.*failed: HTTP 404/,
    );
    await expect(panel.locator(".intent-ci-state")).toHaveText(
      "Could not be read",
    );
    await expect(heading).toBeVisible();
    await expect(panel).not.toContainText(/passed/i);
    await expect(panel.getByRole("link")).toHaveCount(0);
    await expectChecked(panel);
  });

  await test.step("Check again after the runs are readable shows Passed", async () => {
    runsMissing = false;
    await panel.getByRole("button", { name: "Check again" }).click();
    await expect(panel.locator(".intent-ci-state")).toHaveText(
      "Passed at a1b2c3d (Add login)",
    );
    await expect(heading).toBeVisible();
    await expect(panel.locator(".intent-ci-reason")).toHaveCount(0);
    await expectChecked(panel);
  });
});

test("a project with a ciAdapter is judged from its discover attempts", async ({
  page,
  dashboard,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  const project = path.join(dashboard.home, "git", "open-dough");
  const adapter = "scripts/ci-status-fixture-adapter.mjs";
  mkdirSync(path.join(project, "scripts"), { recursive: true });
  mkdirSync(path.join(project, ".planning"), { recursive: true });
  writeFileSync(
    path.join(project, adapter),
    `let input = '';
for await (const chunk of process.stdin) input += chunk;
const request = JSON.parse(input);
if (request.operation !== 'discover') process.exit(1);
process.stdout.write(JSON.stringify({ attempts: [{
  runId: 'adapter-run', attemptId: '1', sha: ${JSON.stringify(judged)},
  outcome: 'failure', url: 'https://ci.invalid/adapter', time: '2026-10-01T00:00:00Z',
}] }));
`,
  );
  chmodSync(path.join(project, adapter), 0o700);
  writeFileSync(
    path.join(project, ".planning", "open-dough.json"),
    `${JSON.stringify({ ciAdapter: [process.execPath, adapter] })}\n`,
  );
  const published = publishProject(page, openDough);
  published.serveCi(trunkCi(openDough.revision, () => []));
  await openUntilRead(page);
  const { intent, intentChoice } = parts(page);
  await intentChoice.click();
  const panel = await chooseCiStatus(intent);
  await expect(panel.locator(".intent-ci-state")).toHaveText(
    "Failed at a1b2c3d (Add login)",
  );
  await expect(
    panel.getByRole("link", { name: "https://ci.invalid/adapter" }),
  ).toBeVisible();
  expect(
    published.requests.filter(({ request }) =>
      request.kind.startsWith("actions-"),
    ),
  ).toEqual([]);
});

test("the CI status read refuses an unsafe branch name and a pinned revision before asking GitHub", async ({
  page,
}) => {
  const published = publishProject(page, openDough);
  published.serveCi(trunkCi(openDough.revision, () => []));
  await openUntilRead(page);
  const before = published.requests.length;
  // Asked from the page, as the page's own reads are.
  const ask = (query: string) =>
    page.evaluate(async (url) => {
      const response = await fetch(url);
      return {
        status: response.status,
        body: (await response.json()) as unknown,
      };
    }, `${authenticatedReadEndpoint}?source=open-dough&${query}`);
  for (const query of [
    "intent=ci-status&judged=main..other",
    "intent=ci-status&judged=has%20space",
    "intent=ci-status&judged=main&judged=other",
    // The shared `branch` parameter names only a branch read.
    "intent=ci-status&branch=main",
    `intent=ci-status&revision=${openDough.revision}`,
  ]) {
    const answer = await ask(query);
    expect(answer.status, query).toBe(400);
  }
  const answer = await ask("intent=ci-status");
  expect(answer.status).toBe(200);
  expect(answer.body).toMatchObject({
    branch: "main",
    state: "unread",
  });
  expect(judgmentCalls(published.requests.slice(before))).toEqual([
    "actions-runs",
    "actions-workflow",
    "commit-list main",
  ]);
});
