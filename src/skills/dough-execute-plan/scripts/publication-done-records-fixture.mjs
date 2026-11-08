// A manually committed integration against local bare remotes, published
// through each publisher: real `complete`, real catalog rebuild, and the
// publisher's own hold report.
import assert from "node:assert/strict";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { publishHistoryPreservingCandidate } from "./history-preserving-publication.mjs";
import { publishExecutionIncrement } from "./execution-increment-publication.mjs";
import { resumeInterruptedPublication } from "./publication-resume.mjs";
import {
  agentIdentity,
  renderAgentProfile,
} from "../../dough-product-backlog/scripts/product-backlog-agent-profile.mjs";
import { makeMe } from "../../../../tests/support/makeMe.mjs";
import { renderPublishedBacklog } from "../../../../tests/support/published-backlog.mjs";
import {
  captureCheckout,
  exec,
  git,
  lsRemoteSha,
  revParse,
} from "./publication-test-fixtures.mjs";
import { materializeRepository } from "../../../../tests/support/repository-fixture.mjs";

const backlogCli = fileURLToPath(
  new URL(
    "../../dough-product-backlog/scripts/product-backlog.mjs",
    import.meta.url,
  ),
);
export const main = "refs/heads/main";
export const branch = "exec/story";
export const storyA = makeMe.aBacklogEntry
  .with({ identity: "A#A", href: "A.md#A", title: "A" })
  .please();
export const storyB = makeMe.aBacklogEntry
  .with({ identity: "B#B", href: "B.md#B", title: "B" })
  .please();
const storyC = makeMe.aBacklogEntry
  .with({ identity: "C#C", href: "C.md#C", title: "C" })
  .please();

// C's live profile, which a resolution may move into done/.
export const liveProfileOfC = makeMe.anAgentProfile
  .executing({
    name: "joey",
    identity: "C#C",
    mode: "story-branch",
    branch: "story-c",
    host: "claude",
    model: "opus",
  })
  .please();

// The published trunk the stories start from: the backlog at `file` holds
// the membership `backlog`, and `agentProfiles` beside it. The exec/story
// workspace starts on that trunk.
export function trunkWithBacklogAt(file, { backlog, agentProfiles = [] }) {
  const facts =
    file === ".planning/PRODUCT-BACKLOG.md"
      ? { backlog, agentProfiles }
      : {
          backlog: undefined,
          files: {
            [file]: renderPublishedBacklog(backlog),
            ...Object.fromEntries(
              agentProfiles.map((profile) => [
                join(dirname(file), agentIdentity(profile.name).path),
                renderAgentProfile(profile),
              ]),
            ),
          },
        };
  return makeMe.aRepository
    .withRevision("stories active", {
      ...facts,
      message: "both stories active",
    })
    .withWorkspace(branch, { from: "stories active" })
    .please();
}

async function complete(workspace, identity, file) {
  await exec(
    process.execPath,
    [backlogCli, "complete", "--identity", identity, "--file", file],
    { cwd: workspace },
  );
  await git(workspace, "add", dirname(file));
  await git(workspace, "commit", "-m", `complete ${identity}`);
}

// `description` is the published trunk on which both stories are active,
// with the backlog at `file`. With `misplace`, both sides hold C's live
// profile and the manual resolution moves it into done/, as a resolution
// following Git's inferred `agents/ → done/` rename does.
export async function manualMerge(
  t,
  file,
  list,
  { description, active = true, misplace = false },
) {
  const fixture = await materializeRepository(description);
  t.after(fixture.cleanup);
  const { integration, execution } = fixture;
  const profile = join(dirname(file), agentIdentity(liveProfileOfC.name).path);
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
    active && list === "Backlog list"
      ? renderPublishedBacklog({ queued: [storyA] })
      : renderPublishedBacklog({ taken: [active ? storyA : storyC] }),
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
        ...makeMe.aPublishedIntegration.with({ publishedTip, branch }).please(),
        backlogPath,
      })
    : publisher === "execution"
      ? publishExecutionIncrement({
          workspace: execution,
          ...makeMe.anIncrementPublication
            .with({
              branch,
              previouslyPublishedBase: remoteTip,
              targetRef: main,
            })
            .please(),
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
