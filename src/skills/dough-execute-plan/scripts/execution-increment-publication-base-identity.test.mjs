// Git mechanics: a uniquely abbreviated previously published base resolves to
// its full commit ID after the fetch, so publication decisions, comparisons,
// stops, and receipts match those of the full ID.
import assert from "node:assert/strict";
import { test } from "node:test";
import { publishExecutionIncrement } from "./execution-increment-publication.mjs";
import {
  advanceOriginFromAnotherWriter,
  createCleanTrunkFixture,
  git,
  lsRemoteSha,
  revParse,
} from "./publication-test-fixtures.mjs";

const trunkTarget = "refs/heads/main";
const abbreviated = (sha) => sha.slice(0, 10);

// Publishes on a fresh clean-trunk fixture prepared by `arrange`, with the
// base `chooseBase` names and its abbreviation applied by `form`. Returns the
// result, its registered receipts and beforePush comparisons, and the facts
// with this fixture's commit IDs replaced by stable labels.
async function publishOnFixture(t, { arrange, chooseBase, form, targetRef }) {
  const fixture = await createCleanTrunkFixture();
  t.after(fixture.cleanup);
  const arranged = (await arrange?.(fixture)) ?? {};
  const base = chooseBase(fixture);
  const receipts = [];
  const comparisons = [];
  const published = await publishExecutionIncrement({
    workspace: fixture.execution,
    branch: "exec/story",
    previouslyPublishedBase: form(base),
    targetRef: targetRef ?? trunkTarget,
    register: (receipt) => receipts.push(receipt),
    beforePush: async (comparison) => comparisons.push(comparison),
  });
  const labels = new Map([
    [fixture.trunkSha, "<trunk>"],
    [fixture.candidateSha, "<candidate>"],
    ...Object.entries(arranged).map(([name, sha]) => [sha, `<${name}>`]),
  ]);
  if (published.candidate && !labels.has(published.candidate)) {
    labels.set(published.candidate, "<rewritten>");
  }
  let text = JSON.stringify({ published, receipts, comparisons });
  for (const [sha, label] of labels) text = text.replaceAll(sha, label);
  const facts = JSON.parse(text);
  return { fixture, base, published, receipts, comparisons, facts, arranged };
}

async function publishFullAndAbbreviated(t, scenario) {
  const full = await publishOnFixture(t, { ...scenario, form: (sha) => sha });
  const short = await publishOnFixture(t, { ...scenario, form: abbreviated });
  return { full, short };
}

test("a ten-character base on an unchanged target publishes with the full base ID, as the full ID does", async (t) => {
  const { full, short } = await publishFullAndAbbreviated(t, {
    chooseBase: ({ trunkSha }) => trunkSha,
  });
  const { published, receipts, comparisons, fixture } = short;

  assert.equal(published.ok, true, JSON.stringify(published));
  assert.equal(published.reconciliations, 0);
  assert.equal(published.suffixBase, fixture.trunkSha);
  assert.deepEqual(published.receipt, {
    sha: fixture.candidateSha,
    target: trunkTarget,
  });
  assert.deepEqual(receipts, [published.receipt]);
  assert.deepEqual(comparisons, [
    {
      attempt: 0,
      candidate: fixture.candidateSha,
      suffixBase: fixture.trunkSha,
    },
  ]);
  assert.equal(
    await lsRemoteSha(fixture.origin, trunkTarget),
    fixture.candidateSha,
  );
  assert.deepEqual(short.facts, full.facts);
});

test("an abbreviated base whose target another writer advanced reconciles onto the fetched tip and reports the full base", async (t) => {
  const { full, short } = await publishFullAndAbbreviated(t, {
    arrange: async ({ origin }) => ({
      advanced: await advanceOriginFromAnotherWriter(origin),
    }),
    chooseBase: ({ trunkSha }) => trunkSha,
  });
  const { published, fixture, arranged } = short;

  assert.equal(published.ok, false);
  assert.equal(published.status, "needs-validation");
  assert.equal(published.previouslyPublishedBase, fixture.trunkSha);
  assert.equal(published.remoteTip, arranged.advanced);
  assert.notEqual(published.candidate, fixture.candidateSha);
  assert.equal(
    (
      await git(
        fixture.execution,
        "log",
        "--format=%P",
        "-1",
        published.candidate,
      )
    ).stdout.trim(),
    arranged.advanced,
  );
  assert.equal(
    await lsRemoteSha(fixture.origin, trunkTarget),
    arranged.advanced,
  );
  assert.deepEqual(short.facts, full.facts);
});

test("an abbreviated base on a new target without a remote tip publishes with the full suffix base", async (t) => {
  const targetRef = "refs/heads/exec/story";
  const { full, short } = await publishFullAndAbbreviated(t, {
    chooseBase: ({ trunkSha }) => trunkSha,
    targetRef,
  });
  const { published, comparisons, fixture } = short;

  assert.equal(published.ok, true, JSON.stringify(published));
  assert.equal(published.suffixBase, fixture.trunkSha);
  assert.deepEqual(published.receipt, {
    sha: fixture.candidateSha,
    target: targetRef,
  });
  assert.deepEqual(comparisons, [
    {
      attempt: 0,
      candidate: fixture.candidateSha,
      suffixBase: fixture.trunkSha,
    },
  ]);
  assert.equal(
    await lsRemoteSha(fixture.origin, targetRef),
    fixture.candidateSha,
  );
  assert.deepEqual(short.facts, full.facts);
});

// The remote already holds the candidate, as after a push whose answer was
// lost; nothing is committed and the target stays where it was.
const candidateAlreadyOnTarget = async ({ execution, candidateSha }) => {
  await git(execution, "push", "origin", `${candidateSha}:${trunkTarget}`);
};

for (const [name, chooseBase] of [
  ["the older published base", ({ trunkSha }) => trunkSha],
  ["the candidate itself", ({ candidateSha }) => candidateSha],
]) {
  test(`an abbreviated base naming ${name} with the candidate already on the target classifies as the full ID does`, async (t) => {
    const { full, short } = await publishFullAndAbbreviated(t, {
      arrange: candidateAlreadyOnTarget,
      chooseBase,
    });
    const { published, fixture, base } = short;

    assert.equal(published.ok, true, JSON.stringify(published));
    assert.equal(published.suffixBase, base);
    assert.equal(published.receipt.sha, fixture.candidateSha);
    assert.equal(
      await revParse(fixture.execution, "exec/story"),
      fixture.candidateSha,
    );
    assert.equal(
      await lsRemoteSha(fixture.origin, trunkTarget),
      fixture.candidateSha,
    );
    assert.deepEqual(short.facts, full.facts);
  });
}
