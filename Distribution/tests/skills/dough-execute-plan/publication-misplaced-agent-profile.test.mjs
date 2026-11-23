// A candidate whose integration moved a live agent profile into done/ is held
// by every publisher, naming the profile and its home in agents/. Real
// completion and manually committed merges against local bare remotes.
import assert from "node:assert/strict";
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { publishExecutionIncrement } from "../../../src/skills/dough-execute-plan/scripts/execution-increment-publication.mjs";
import { makeMe } from "../../support/makeMe.mjs";
import { materializeRepository } from "../../support/repository-fixture.mjs";
import {
  captureCheckout,
  git,
  lsRemoteSha,
  revParse,
} from "./publication-test-fixtures.mjs";
import {
  assertHeld,
  branch,
  liveProfileOfC,
  main,
  manualMerge,
  publish,
  storyA,
  storyB,
  trunkWithBacklogAt,
} from "./publication-done-records-fixture.mjs";

for (const file of [".planning/PRODUCT-BACKLOG.md", "delivery/custom.md"]) {
  for (const publisher of ["history", "execution", "resume"]) {
    test(`${publisher} holds a candidate with a live profile under done/ beside ${file}`, async (t) => {
      const fixture = await manualMerge(t, file, "Taken", {
        description: trunkWithBacklogAt(file, {
          backlog: { taken: [storyA, storyB] },
          agentProfiles: [liveProfileOfC],
        }),
        active: false,
        misplace: true,
      });
      const { profile, misplacedPath } = fixture;
      const before = await captureCheckout(fixture.execution);

      const result = await publish(publisher, fixture);

      const { misplaced, error } = await assertHeld(
        result,
        "misplaced-agent-profile",
        fixture,
        before,
      );
      assert.deepEqual(misplaced, [{ path: misplacedPath, home: profile }]);
      assert.ok(error.includes(misplacedPath), error);
      assert.ok(error.includes(profile), error);
    });
  }
}

const home = ".planning/agents/joey-chan.json";
const misplacedPath = ".planning/done/joey-chan.json";

async function incrementWithLiveProfile(t) {
  const fixture = await materializeRepository(
    makeMe.aRepository
      .withRevision("active stories", {
        backlog: { taken: [storyA, storyB] },
        agentProfiles: [liveProfileOfC],
      })
      .withWorkspace(branch, { from: "active stories" })
      .withUnpublishedRevision("owned increment", {
        files: { "increment.txt": "owned increment\n" },
      })
      .please(),
  );
  t.after(fixture.cleanup);
  const publication = {
    workspace: fixture.execution,
    ...makeMe.anIncrementPublication
      .with({
        branch,
        previouslyPublishedBase: fixture.trunkSha,
        targetRef: main,
      })
      .please(),
    validate: async () => ({ ok: true }),
  };
  return { ...fixture, publication };
}

async function misplaceProfileOnTrunk(integration) {
  mkdirSync(join(integration, ".planning/done"), { recursive: true });
  await git(integration, "mv", home, misplacedPath);
  await git(integration, "commit", "-m", "misplace the live profile");
  await git(integration, "push", "origin", `HEAD:${main}`);
  return revParse(integration, "HEAD");
}

async function assertHeldRewrite(result, fixture, remoteTip) {
  assert.equal(result.status, "misplaced-agent-profile");
  assert.deepEqual(result.misplaced, [{ path: misplacedPath, home }]);
  assert.equal(result.preRebaseSha, fixture.candidateSha);
  assert.notEqual(result.candidate, fixture.candidateSha);
  assert.equal(result.candidate, await revParse(fixture.execution, branch));
  assert.equal(result.suffixBase, remoteTip);
  assert.equal(result.reconciliations, 1);
  assert.equal(await lsRemoteSha(fixture.origin, main), remoteTip);
}

test("execution holds the rewritten candidate when trunk misplaces a profile before fetch", async (t) => {
  const fixture = await incrementWithLiveProfile(t);
  const remoteTip = await misplaceProfileOnTrunk(fixture.integration);
  const pushAttempts = [];

  const result = await publishExecutionIncrement({
    ...fixture.publication,
    beforePush: ({ attempt }) => pushAttempts.push(attempt),
  });

  await assertHeldRewrite(result, fixture, remoteTip);
  assert.deepEqual(pushAttempts, []);
});

test("execution holds the rewritten candidate when trunk misplaces a profile before first push", async (t) => {
  const fixture = await incrementWithLiveProfile(t);
  const pushAttempts = [];
  let remoteTip;

  const result = await publishExecutionIncrement({
    ...fixture.publication,
    beforePush: async ({ attempt }) => {
      pushAttempts.push(attempt);
      if (attempt === 0)
        remoteTip = await misplaceProfileOnTrunk(fixture.integration);
    },
  });

  await assertHeldRewrite(result, fixture, remoteTip);
  assert.deepEqual(pushAttempts, [0]);
});
