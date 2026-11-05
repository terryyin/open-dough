// The CI proof of a ciAdapter attempt in Intent's CI status tab
// (../src/IntentCiProof.tsx, ../server/ciAdapterProof.ts): the project's own
// adapter, run from the project folder as its discover is, is asked for the
// proof of the attempt the judgment shows, and its summary is shown below the
// unchanged verdict, naming the attempt by its attemptId and short revision.
// A running result's proof is its completed ancestor attempt's. GitHub is
// asked for no proof. A GitHub Actions run's proof:
// ./intent-ci-proof.spec.ts.

import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { expect, test } from "./dashboardTest.ts";
import { parts } from "./dashboardPage.ts";
import { chooseCiStatus } from "./intentCiStatusPage.ts";
import { proofOf } from "./intentCiProofPage.ts";
import { running } from "./intentCiStoryBoard.ts";
import {
  login,
  mainRun,
  publishStoryCi,
  repository,
  signup,
  started,
  toggleOnDevelopment,
} from "./intentCiStoryRecords.ts";
import { openUntilRead } from "./pageRequestNotes.ts";
import { counts, proofSummary } from "./support/ciProofArtifacts.ts";

test.setTimeout(90_000);

const uuid = "9f1c2d3e-0000-4000-8000-000000000001";

type Answers = {
  // Each discover's attempts, by the asked branch.
  readonly discover: Readonly<Record<string, readonly unknown[]>>;
  // The answer to every proof read.
  readonly proof: unknown;
};

// A ciAdapter project folder in the test home whose adapter records each
// request it is asked, relative to the folder it runs in, and answers from
// `answer`.
function adapterProject(home: string) {
  const project = path.join(home, "git", "open-dough");
  const adapter = "scripts/ci-proof-fixture-adapter.mjs";
  mkdirSync(path.join(project, "scripts"), { recursive: true });
  mkdirSync(path.join(project, ".planning"), { recursive: true });
  writeFileSync(
    path.join(project, adapter),
    `import { appendFileSync, readFileSync } from "node:fs";
let input = "";
for await (const chunk of process.stdin) input += chunk;
const request = JSON.parse(input);
appendFileSync("adapter-requests.jsonl", JSON.stringify(request) + "\\n");
const answers = JSON.parse(readFileSync("adapter-answers.json", "utf8"));
process.stdout.write(JSON.stringify(
  request.operation === "proof"
    ? answers.proof
    : { attempts: answers.discover[request.check.branch] ?? [] },
));
`,
  );
  writeFileSync(
    path.join(project, ".planning", "open-dough.json"),
    `${JSON.stringify({ ciAdapter: [process.execPath, adapter] })}\n`,
  );
  const requestsFile = path.join(project, "adapter-requests.jsonl");
  writeFileSync(requestsFile, "");
  return {
    answer(answers: Answers) {
      writeFileSync(
        path.join(project, "adapter-answers.json"),
        JSON.stringify(answers),
      );
    },
    proofRequests(): unknown[] {
      return readFileSync(requestsFile, "utf8")
        .split("\n")
        .filter((line) => line !== "")
        .map((line) => JSON.parse(line) as { operation: string })
        .filter(({ operation }) => operation === "proof");
    },
  };
}

const passed = (
  runId: string | number,
  attemptId: string | number,
  sha: string,
  branch: string,
) => ({
  runId,
  attemptId,
  sha,
  outcome: "success",
  url: mainRun,
  time: "2026-10-01T00:00:00Z",
  branch,
});

const testsSummary = (attemptId: string, revision: string) => ({
  summary: proofSummary(
    { repository, attemptId, revision },
    [["tests", 1]],
    [["tests", 1, 1, "tests", counts(1000, 0, 3)]],
  ),
});

test("a ciAdapter attempt's proof is read through the project's adapter and shown below its verdict, named by its attemptId", async ({
  page,
  dashboard,
}) => {
  const adapter = adapterProject(dashboard.home);
  adapter.answer({
    discover: { main: [passed(uuid, uuid, login, "main")] },
    proof: testsSummary(uuid, login),
  });
  const ci = publishStoryCi(page);
  await openUntilRead(page, "/?project=open-dough&perspective=intent");
  const panel = await chooseCiStatus(parts(page).intent);
  const proof = proofOf(panel);

  await test.step("the verdict reads as before; Proof names the attempt and shows its row", async () => {
    await expect(panel.locator(".intent-ci-state")).toHaveText(
      "Passed at 4774f60 (Add login)",
    );
    await expect(proof.locator(".intent-ci-proof-run")).toHaveText(
      `Attempt ${uuid} at 4774f60.`,
    );
    await expect(proof.getByRole("link", { name: uuid })).toHaveAttribute(
      "href",
      mainRun,
    );
    await expect(proof.getByRole("listitem")).toHaveText([
      "tests: 1000 passed and 3 other tests; 1 of 1 part present.",
    ]);
    await expect(proof.locator(".intent-ci-proof-unavailable")).toHaveCount(0);
  });

  await test.step("the adapter was asked the documented proof request, and GitHub for no proof", () => {
    expect(adapter.proofRequests()).toEqual([
      {
        operation: "proof",
        check: { repo: repository, branch: "main" },
        attempt: { runId: uuid, attemptId: uuid, sha: login },
      },
    ]);
    expect(
      ci.published.requests.filter(({ request }) =>
        request.kind.startsWith("actions-"),
      ),
    ).toEqual([]);
  });

  await test.step("a numeric adapter attemptId matches the summary's text form of it", async () => {
    adapter.answer({
      discover: { main: [passed(7, 1, login, "main")] },
      proof: testsSummary("1", login),
    });
    await panel.getByRole("button", { name: "Check again" }).click();
    await expect(proof.locator(".intent-ci-proof-run")).toHaveText(
      "Attempt 1 at 4774f60.",
    );
    await expect(proof.getByRole("listitem")).toHaveText([
      "tests: 1000 passed and 3 other tests; 1 of 1 part present.",
    ]);
    expect(adapter.proofRequests().at(-1)).toEqual({
      operation: "proof",
      check: { repo: repository, branch: "main" },
      attempt: { runId: "7", attemptId: "1", sha: login },
    });
  });
});

test("a running ciAdapter story branch shows its completed ancestor attempt's proof", async ({
  page,
  dashboard,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  const adapter = adapterProject(dashboard.home);
  const ancestor = "a7c3e9d1-0000-4000-8000-000000000002";
  adapter.answer({
    discover: {
      main: [passed(ancestor, ancestor, signup, "main")],
      [running.branch]: [
        {
          runId: uuid,
          attemptId: uuid,
          sha: started,
          outcome: "pending",
          time: "2026-10-02T00:00:00Z",
          branch: running.branch,
        },
      ],
    },
    proof: testsSummary(ancestor, signup),
  });
  publishStoryCi(page);
  await openUntilRead(page, "/?project=open-dough&perspective=intent");
  await chooseCiStatus(parts(page).intent);
  const panel = await toggleOnDevelopment(page, running.title);
  const proof = proofOf(panel);

  await expect(panel.locator(".intent-ci-state")).toHaveText(
    "Running at 70a0001 (Start the story)",
  );
  await expect(proof.locator(".intent-ci-proof-run")).toHaveText(
    `Attempt ${ancestor} at d4e5f6a.`,
  );
  await expect(proof.getByRole("listitem")).toHaveText([
    "tests: 1000 passed and 3 other tests; 1 of 1 part present.",
  ]);
  await expect(proof).not.toContainText("70a0001");
  expect(adapter.proofRequests().at(-1)).toEqual({
    operation: "proof",
    check: { repo: repository, branch: "main" },
    attempt: { runId: ancestor, attemptId: ancestor, sha: signup },
  });
  expect(adapter.proofRequests()).not.toContainEqual(
    expect.objectContaining({
      attempt: expect.objectContaining({ sha: started }),
    }),
  );
});
