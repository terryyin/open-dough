import assert from "node:assert/strict";
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { publishExecutionIncrement } from "../../../src/skills/dough-execute-plan/scripts/execution-increment-publication.mjs";
import { makeMe } from "../../support/makeMe.mjs";
import { materializeRepository } from "../../support/repository-fixture.mjs";
import {
  authorizedRemote,
  trunkWithOneUnpublishedIncrement,
} from "./publication-clean-trunk-fixtures.mjs";
import {
  assertCheckoutUnchanged,
  captureCheckout,
  git,
  lsRemoteSha,
  revParse,
} from "./publication-test-fixtures.mjs";

const targetRef = "refs/heads/main";
const branch = "exec/story";

async function publicationFixture(t) {
  const fixture = await materializeRepository(trunkWithOneUnpublishedIncrement);
  t.after(fixture.cleanup);
  const publish = (options) =>
    publishExecutionIncrement({
      workspace: fixture.execution,
      ...makeMe.anIncrementPublication
        .with({ branch, previouslyPublishedBase: fixture.trunkSha, targetRef })
        .please(),
      ...options,
    });
  return { ...fixture, publish };
}

test("successful publication confirms the named remote target with a custom tracking ref", async (t) => {
  const fixture = await publicationFixture(t);
  const { origin, execution, integration, trunkSha, candidateSha, publish } =
    fixture;
  const remote = "delivery";
  const delivery = await authorizedRemote(fixture, remote, "main");
  const tracking = "refs/remotes/delivery/published";
  await git(
    execution,
    "config",
    "--replace-all",
    "remote.delivery.fetch",
    `+${targetRef}:${tracking}`,
  );
  await git(execution, "push", remote, `${trunkSha}:${targetRef}`);
  const before = await captureCheckout(integration);

  const result = await publish({ remote, defaultCheckout: integration });

  assert.deepEqual(result.receipt, { sha: candidateSha, target: targetRef });
  assert.equal(result.remoteTip, candidateSha);
  assert.equal(await lsRemoteSha(delivery, targetRef), candidateSha);
  assert.equal(await lsRemoteSha(origin, targetRef), trunkSha);
  assert.equal(await revParse(execution, tracking), candidateSha);
  await assert.rejects(revParse(execution, "refs/remotes/delivery/main"));
  assert.equal(result.maintenance, "deferred");
  assertCheckoutUnchanged(before, await captureCheckout(integration));
});

test("a disappeared target is not confirmed by a different remote ref holding the candidate", async (t) => {
  const { origin, execution, candidateSha, publish } =
    await publicationFixture(t);
  const hooks = join(origin, "hooks");
  const saved = "refs/tags/saved/refs/heads/main";
  await git(origin, "config", "core.hooksPath", hooks);
  writeFileSync(
    join(hooks, "post-receive"),
    `#!/bin/sh
read -r old new ref
git update-ref ${saved} "$new" &&
  git update-ref -d "$ref" "$new"
`,
    { mode: 0o755 },
  );

  await assert.rejects(publish(), /remote did not accept the candidate/);

  assert.equal(await revParse(execution, branch), candidateSha);
  const { stdout } = await git(execution, "ls-remote", "origin", targetRef);
  assert.equal(stdout.trim(), `${candidateSha}\t${saved}`);
});
