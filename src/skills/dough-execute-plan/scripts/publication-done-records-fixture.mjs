// A manually committed integration against local bare remotes, published
// through each publisher: real `complete`, real catalog rebuild, and the
// publisher's own hold report.
import assert from "node:assert/strict";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { publishHistoryPreservingCandidate } from "./history-preserving-publication.mjs";
import { publishExecutionIncrement } from "./execution-increment-publication.mjs";
import { resumeInterruptedPublication } from "./publication-resume.mjs";
import { renderAgentProfile } from "../../dough-product-backlog/scripts/product-backlog-agent-profile.mjs";
import { makeMe } from "../../../../tests/support/makeMe.mjs";
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
export const main = "refs/heads/main";
export const branch = "exec/story";
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

// With `misplace`, both sides hold C's live profile and the manual resolution
// moves it into done/, as a resolution following Git's inferred
// `agents/ → done/` rename does.
export async function manualMerge(
  t,
  file,
  list,
  { active = true, misplace = false } = {},
) {
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
  const profile = join(dirname(file), "agents/joey-chan.json");
  if (misplace) {
    mkdirSync(join(integration, dirname(profile)), { recursive: true });
    writeFileSync(
      join(integration, profile),
      renderAgentProfile(
        makeMe.anAgentProfile
          .executing({
            name: "joey",
            identity: "C#C",
            mode: "story-branch",
            branch: "story-c",
            host: "claude",
            model: "opus",
          })
          .please(),
      ),
    );
  }
  await git(integration, "add", dirname(file));
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
  const misplacedPath = join(dirname(file), "done/joey-chan.json");
  if (misplace) await git(execution, "mv", profile, misplacedPath);
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
    profile,
    misplacedPath,
  };
}

export async function publish(
  publisher,
  fixture,
  { publishedRevisions = [], backlogPath = fixture.file } = {},
) {
  const { execution, publishedTip, remoteTip, candidate } = fixture;
  return publisher === "history"
    ? publishHistoryPreservingCandidate({
        ownedWorkspace: execution,
        publishedTip,
        branch,
        backlogPath,
      })
    : publisher === "execution"
      ? publishExecutionIncrement({
          workspace: execution,
          branch,
          previouslyPublishedBase: remoteTip,
          targetRef: main,
          backlogPath,
        })
      : resumeInterruptedPublication({
          ownedWorkspace: execution,
          candidateSha: candidate,
          publishedRevisions,
          backlogPath,
        });
}

// A held publication pushes nothing and leaves the owned checkout and branch
// as they were. Returns the hold's fields, wherever the publisher reports them.
export async function assertHeld(
  result,
  status,
  fixture,
  before,
  publishedRevisions,
) {
  const { execution, origin, remoteTip } = fixture;
  assert.equal(result.receipt ?? null, null);
  assert.equal(result.reason ?? result.status ?? result.held?.status, status);
  assert.equal(await lsRemoteSha(origin, main), remoteTip);
  assert.deepEqual(await captureCheckout(execution), before);
  assert.equal(
    (await git(execution, "symbolic-ref", "--short", "HEAD")).stdout.trim(),
    branch,
  );
  assert.deepEqual(publishedRevisions, []);
  return result.held?.fields ?? result;
}
