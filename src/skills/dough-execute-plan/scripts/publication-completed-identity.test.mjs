// Real completion and manually committed merges against local bare remotes.
import assert from "node:assert/strict";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import { publishHistoryPreservingCandidate } from "./history-preserving-publication.mjs";
import { publishExecutionIncrement } from "./execution-increment-publication.mjs";
import { resumeInterruptedPublication } from "./publication-resume.mjs";
import {
  captureCheckout,
  createCleanTrunkFixture,
  exec,
  git,
  lsRemoteSha,
  revParse,
} from "./publication-test-fixtures.mjs";

const backlogCli = fileURLToPath(
  new URL(
    "../../dough-product-backlog/scripts/product-backlog.mjs",
    import.meta.url,
  ),
);
const main = "refs/heads/main";
const branch = "exec/story";
const backlog = (list, active = true) =>
  `# Product backlog\n\n## Taken\n\n${list === "Taken" && active ? "- [A](A.md#A) — A#A\n" : ""}\n## Backlog list\n\n${list === "Backlog list" && active ? "- [A](A.md#A) — A#A\n" : ""}`;

async function complete(workspace, identity, file) {
  await exec(
    process.execPath,
    [backlogCli, "complete", "--identity", identity, "--file", file],
    { cwd: workspace },
  );
  await git(workspace, "add", dirname(file));
  await git(workspace, "commit", "-m", `complete ${identity}`);
}

async function manualMerge(t, file, list, active = true) {
  const fixture = await createCleanTrunkFixture();
  t.after(fixture.cleanup);
  const { integration, execution } = fixture;
  mkdirSync(join(integration, dirname(file)), { recursive: true });
  writeFileSync(
    join(integration, file),
    backlog("Taken").replace(
      "## Backlog list",
      "- [B](B.md#B) — B#B\n\n## Backlog list",
    ),
  );
  await git(integration, "add", file);
  await git(integration, "commit", "-m", "both stories active");
  await git(integration, "push", "origin", "main");
  await git(execution, "rebase", "main");
  await complete(execution, "B#B", file);
  const publishedTip = await revParse(execution, "HEAD");
  await complete(integration, "A#A", file);
  await git(integration, "push", "origin", "main");
  const remoteTip = await revParse(integration, "HEAD");
  await git(execution, "merge", "--no-ff", "--no-commit", "main").catch(
    (error) => {
      assert.equal(error.code, 1);
    },
  );
  writeFileSync(
    join(execution, file),
    active
      ? backlog(list)
      : backlog(list, false).replace(
          "## Taken\n",
          "## Taken\n\n- [C](C.md#C) — C#C\n",
        ),
  );
  await exec(process.execPath, [backlogCli, "catalog-done", "--file", file], {
    cwd: execution,
  });
  await git(execution, "add", dirname(file));
  await git(execution, "commit", "-m", "manually resolve integration");
  const candidate = await revParse(execution, "HEAD");
  const donePath = join(dirname(file), "done/A_A.json");
  const record = JSON.parse(readFileSync(join(execution, donePath), "utf8"));
  assert.equal(record.identity, "A#A");
  return {
    ...fixture,
    file,
    publishedTip,
    remoteTip,
    candidate,
    donePath,
    record,
  };
}

for (const [file, list] of [
  [".planning/PRODUCT-BACKLOG.md", "Taken"],
  ["delivery/custom.md", "Backlog list"],
]) {
  for (const publisher of ["history", "execution", "resume"]) {
    test(`${publisher} refuses a completed identity restored in ${list} at ${file}`, async (t) => {
      const fixture = await manualMerge(t, file, list);
      const {
        execution,
        origin,
        publishedTip,
        remoteTip,
        candidate,
        donePath,
        record,
      } = fixture;
      const before = await captureCheckout(execution);
      const sourceBefore = readFileSync(join(execution, file), "utf8");
      const doneBefore = readFileSync(join(execution, donePath), "utf8");
      const publishedRevisions = [];
      const result =
        publisher === "history"
          ? await publishHistoryPreservingCandidate({
              ownedWorkspace: execution,
              publishedTip,
              branch,
              backlogPath: file,
            })
          : publisher === "execution"
            ? await publishExecutionIncrement({
                workspace: execution,
                branch,
                previouslyPublishedBase: remoteTip,
                targetRef: main,
                backlogPath: file,
              })
            : await resumeInterruptedPublication({
                ownedWorkspace: execution,
                candidateSha: candidate,
                publishedRevisions,
                backlogPath: file,
              });
      assert.equal(result.receipt ?? null, null);
      assert.equal(
        result.reason ?? result.status ?? result.held?.status,
        "completed-identity",
      );
      const error = result.error ?? result.held?.fields?.error;
      assert.match(error, /A#A/);
      assert.ok(error.includes(donePath));
      assert.ok(error.includes(record.completedAt));
      assert.equal(await lsRemoteSha(origin, main), remoteTip);
      assert.deepEqual(await captureCheckout(execution), before);
      assert.equal(
        (await git(execution, "symbolic-ref", "--short", "HEAD")).stdout.trim(),
        branch,
      );
      assert.equal(readFileSync(join(execution, file), "utf8"), sourceBefore);
      assert.equal(readFileSync(join(execution, donePath), "utf8"), doneBefore);
      assert.deepEqual(publishedRevisions, []);
    });
  }
}

for (const publisher of ["history", "execution", "resume"]) {
  test(`${publisher} still publishes unrelated active work beside completed records`, async (t) => {
    const fixture = await manualMerge(t, "delivery/custom.md", "Taken", false);
    const { execution, publishedTip, remoteTip, candidate, file } = fixture;
    const result =
      publisher === "history"
        ? await publishHistoryPreservingCandidate({
            ownedWorkspace: execution,
            publishedTip,
            branch,
            backlogPath: `./${file}`,
          })
        : publisher === "execution"
          ? await publishExecutionIncrement({
              workspace: execution,
              branch,
              previouslyPublishedBase: remoteTip,
              targetRef: main,
              backlogPath: file,
            })
          : await resumeInterruptedPublication({
              ownedWorkspace: execution,
              candidateSha: candidate,
              publishedRevisions: [],
              backlogPath: file,
            });
    assert.equal(result.acceptedSha ?? result.receipt?.sha, fixture.candidate);
    assert.equal(await lsRemoteSha(fixture.origin, main), fixture.candidate);
  });
}
