import { expect, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { judgeCommandAdapter } from "../../server/baseCiJudgment.ts";
import { repoRoot } from "../../test-support/support/repositoryRoot.ts";

test("a later passing adapter retry supplies the verdict for the revision", async () => {
  const source = makeMe.aPublishedSource.openDough.please();
  const revision = "4774f60".padEnd(40, "0");
  const pipeline = { sha: revision, branch: source.ref, runId: "pipeline" };
  const failed = makeMe.aCiAdapterAttempt
    .failed({ ...pipeline, attemptId: "1", time: "2026-10-01T00:00:00Z" })
    .please();
  const retry = makeMe.aCiAdapterAttempt
    .passedWithoutTimes({
      ...pipeline,
      attemptId: "2",
      time: "2026-10-01T01:00:00Z",
    })
    .please();
  const adapter = [
    process.execPath,
    "--input-type=module",
    "-e",
    `let request = "";
for await (const chunk of process.stdin) request += chunk;
if (JSON.parse(request).operation !== "discover") process.exit(1);
process.stdout.write(process.argv[1]);`,
    JSON.stringify({ attempts: [retry, failed] }),
  ];

  const verdict = await judgeCommandAdapter(
    [{ sha: revision, commit: { message: "Add login" } }],
    source,
    source.ref,
    repoRoot,
    adapter,
    new AbortController().signal,
  );

  expect(verdict).toMatchObject({
    state: "pass",
    revision,
    subject: "Add login",
    runBranch: "main",
    adapterAttempt: { runId: "pipeline", attemptId: "2" },
  });
});
