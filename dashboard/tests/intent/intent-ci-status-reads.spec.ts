// Reading Intent's CI status (../../src/IntentCiStatus.tsx) again and from its
// configured source: a 404 on main's history or runs is Could not be read
// with its reason, Check again replaces a judgment that could not be read, and
// a ciAdapter project is judged from its discover attempts (SEED-219 example
// 8) with a story branch that also counts main's discover results of shared
// commits, run on main (SEED-219#ci-status-review-corrections). Boundary
// refusals and the kept form are in ./intent-ci-status-read-boundary.spec.ts.
// The tab itself is in ./intent-ci-status.spec.ts; a running head with its
// nearest completed ancestor, and Check again after it finishes showing Passed
// (SEED-219 example 7), is the "a running head…" step of
// ./intent-ci-status-story.spec.ts.

import {
  chmodSync,
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import { expect, test } from "../dashboardTest.ts";
import { parts } from "../dashboardPage.ts";
import { openDough } from "../intentCodeBrowseFixtures.ts";
import {
  chooseCiStatus,
  expectChecked,
  judged,
  publishProject,
  runUrl,
  trunkCi,
} from "../intentCiStatusPage.ts";
import { failing, planningOnly } from "../intentCiStoryBoard.ts";
import {
  branchJudgmentCalls,
  broken,
  expectNamed,
  failedRun,
  login,
  mainRun,
  publishStoryCi,
  toggleOnDevelopment,
  trunkHead,
} from "../intentCiStoryRecords.ts";
import { openUntilRead } from "../pageRequestNotes.ts";
import { httpErrorAnswer } from "../originAnswers.ts";

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

test("a ciAdapter project is judged from its discover attempts, and a story branch counts main's discover results of shared commits", async ({
  page,
  dashboard,
}) => {
  test.setTimeout(90_000);
  await page.setViewportSize({ width: 1280, height: 800 });
  const project = path.join(dashboard.home, "git", "open-dough");
  const adapter = "scripts/ci-status-fixture-adapter.mjs";
  const asked = path.join(dashboard.home, "ci-status-adapter-asked.log");
  const attempt = (sha: string, outcome: string, url: string) => ({
    runId: url,
    attemptId: "1",
    sha,
    outcome,
    url,
    time: "2026-10-01T00:00:00Z",
  });
  // Each discover answered by the branch asked: main's head fails (a commit
  // on main only), main's "Add login" passes, the failing story's own head
  // fails, and the planning-only story has no result of its own.
  const answers = {
    main: [
      attempt(trunkHead, "failure", "https://ci.invalid/adapter"),
      attempt(login, "success", mainRun),
    ],
    [failing.branch]: [attempt(broken, "failure", failedRun)],
  };
  mkdirSync(path.join(project, "scripts"), { recursive: true });
  mkdirSync(path.join(project, ".planning"), { recursive: true });
  writeFileSync(
    path.join(project, adapter),
    `import { appendFileSync } from 'node:fs';
let input = '';
for await (const chunk of process.stdin) input += chunk;
const request = JSON.parse(input);
if (request.operation !== 'discover') process.exit(1);
appendFileSync(${JSON.stringify(asked)}, request.check.branch + '\\n');
const attempts = (${JSON.stringify(answers)})[request.check.branch] ?? [];
process.stdout.write(JSON.stringify({ attempts: attempts.map((each) => ({ ...each, branch: request.check.branch })) }));
`,
  );
  chmodSync(path.join(project, adapter), 0o700);
  writeFileSync(
    path.join(project, ".planning", "open-dough.json"),
    `${JSON.stringify({ ciAdapter: [process.execPath, adapter] })}\n`,
  );
  const askedBranches = () =>
    existsSync(asked)
      ? readFileSync(asked, "utf8").trim().split("\n").sort()
      : [];
  const ci = publishStoryCi(page);
  const calls = ci.published.requests;
  await openUntilRead(page, "/?project=open-dough&perspective=intent");
  const trunkPanel = await chooseCiStatus(parts(page).intent);

  await test.step("main is judged from its own discover (SEED-219 example 8)", async () => {
    await expectNamed(trunkPanel, "main");
    await expect(trunkPanel.locator(".intent-ci-state")).toHaveText(
      "Failed at e1e1e1e (Plan the next story)",
    );
    await expect(
      trunkPanel.getByRole("link", { name: "https://ci.invalid/adapter" }),
    ).toBeVisible();
    await expect(trunkPanel).not.toContainText("run on");
    expect(askedBranches()).toEqual(["main"]);
  });

  await test.step("a story branch with no result of its own: Passed at the shared commit, run on main; main's head is not in its history", async () => {
    const before = calls.length;
    const panel = await toggleOnDevelopment(page, planningOnly.title);
    await expectNamed(panel, planningOnly.branch);
    await expect(panel.locator(".intent-ci-state")).toHaveText(
      "Passed at 4774f60 (Add login), run on main",
    );
    await expect(panel.getByRole("link", { name: mainRun })).toBeVisible();
    await expect(panel).not.toContainText("e1e1e1e");
    // Only the branch's history from GitHub; the discovers answer the runs.
    expect(branchJudgmentCalls(calls.slice(before))).toEqual([
      `commit-list ${planningOnly.branch}`,
    ]);
    expect(askedBranches()).toEqual(["codex/planning-only", "main", "main"]);
  });

  await test.step("a failed result of the story branch's own nearer the head reads Failed", async () => {
    const panel = await toggleOnDevelopment(page, failing.title);
    await expectNamed(panel, failing.branch);
    await expect(panel.locator(".intent-ci-state")).toHaveText(
      "Failed at fa11ed0 (Break the login)",
    );
    await expect(panel.getByRole("link", { name: failedRun })).toBeVisible();
    await expect(panel).not.toContainText("run on");
  });
  expect(
    calls.filter(({ request }) => request.kind.startsWith("actions-")),
  ).toEqual([]);
});
