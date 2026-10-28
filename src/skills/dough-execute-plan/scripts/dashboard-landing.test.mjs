// The launch-bound landing handoff against a loopback receiver: a context
// that names a story carries its identity through preparation and acceptance,
// and a context that names none (a session with no story) is retained and
// delivered by its launch reference alone.
import assert from "node:assert/strict";
import { mkdtemp, readdir, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";
import {
  acceptsLandingWithoutIdentity,
  captureAcceptedLanding,
  reportLanding,
  retainLandingComparison,
} from "./dashboard-landing.mjs";
import {
  landingContextFile,
  landingReceiver,
  landingReference as reference,
} from "./dashboard-landing-test-fixtures.mjs";
import {
  firstLandingExpectationPath,
  openFirstLandingExpectation,
} from "./first-landing-expectation.mjs";

const base = "a".repeat(40);
const revision = "b".repeat(40);
const publication = { remote: "origin", targetRef: "refs/heads/main" };
const accepted = {
  base,
  revision,
  remote: "origin",
  target: "refs/heads/main",
};

async function plantedExpectationKeys(t, branch) {
  const management = await mkdtemp(path.join(os.tmpdir(), "landing-mgmt-"));
  t.after(() => rm(management, { recursive: true, force: true }));
  return {
    repository: path.join(management, "repo.git"),
    workspace: path.join(management, "workspace"),
    branch,
  };
}

test("this installation says it takes a context that names no story", () => {
  assert.equal(acceptsLandingWithoutIdentity, true);
});

test("a context naming no story is retained before the push and recorded after acceptance by its launch reference alone", async (t) => {
  const { origin, requests } = await landingReceiver(t);
  const expectation = await plantedExpectationKeys(t, "claude/unattached");
  const file = await landingContextFile(t, origin, undefined, expectation);
  assert.deepEqual(await openFirstLandingExpectation(expectation), {
    workspace: expectation.workspace,
    branch: expectation.branch,
    landingContext: file,
  });

  const pending = await retainLandingComparison(
    file,
    { candidate: revision, suffixBase: base },
    publication,
  );
  const retained = JSON.parse(await readFile(pending, "utf8"));
  assert.equal("identity" in retained, false);
  assert.deepEqual(
    { ...retained, delivery: undefined },
    {
      origin,
      source: "open-dough",
      host: "claude",
      reference,
      remote: "origin",
      target: "refs/heads/main",
      base,
      revision,
      delivery: undefined,
    },
  );

  const landing = await captureAcceptedLanding(file, accepted);
  assert.equal(landing.state, "recorded");
  assert.equal(landing.receipt.reference, reference);
  assert.deepEqual(
    requests.map(({ url }) => url),
    ["/__agent-launch/landing/prepare", "/__agent-launch/landing"],
  );
  for (const { report } of requests) {
    assert.equal("identity" in report, false);
    assert.equal(report.delivery, retained.delivery);
  }
  // Accepted capture clears the open expectation; unacknowledged would not.
  assert.equal(await openFirstLandingExpectation(expectation), undefined);
  assert.equal(
    await readFile(
      firstLandingExpectationPath(
        expectation.repository,
        expectation.workspace,
        expectation.branch,
      ),
      "utf8",
    ).then(
      () => "present",
      (error) => error.code,
    ),
    "ENOENT",
  );
});

test("unacknowledged capture leaves the first-landing expectation open", async (t) => {
  const { origin } = await landingReceiver(t);
  const expectation = await plantedExpectationKeys(t, "claude/unack");
  const file = await landingContextFile(t, origin, "SEED-1#story", expectation);
  await retainLandingComparison(
    file,
    { candidate: revision, suffixBase: base },
    publication,
  );
  const mismatched = await captureAcceptedLanding(file, {
    ...accepted,
    revision: "c".repeat(40),
  });
  assert.equal(mismatched.state, "unacknowledged");
  assert.deepEqual(await openFirstLandingExpectation(expectation), {
    workspace: expectation.workspace,
    branch: expectation.branch,
    landingContext: file,
  });
});

test("a context naming a story still carries its identity, and a comparison trunk did not accept is not recorded", async (t) => {
  const { origin, requests } = await landingReceiver(t);
  const file = await landingContextFile(t, origin, "SEED-1#story");
  await retainLandingComparison(
    file,
    { candidate: revision, suffixBase: base },
    publication,
  );
  assert.equal(requests[0].report.identity, "SEED-1#story");
  assert.equal(
    (await captureAcceptedLanding(file, accepted)).receipt.identity,
    "SEED-1#story",
  );

  // The retained comparison must match what trunk accepted.
  const mismatched = await captureAcceptedLanding(file, {
    ...accepted,
    revision: "c".repeat(40),
  });
  assert.equal(mismatched.state, "unacknowledged");
  assert.match(mismatched.error, /does not match revision/);
});

test("a context still needs its launch, its target, and a nonblank identity when it names one", async (t) => {
  const { origin, requests } = await landingReceiver(t);
  const pair = { candidate: revision, suffixBase: base };
  const blank = await landingContextFile(t, origin, "");
  await assert.rejects(
    retainLandingComparison(blank, pair, publication),
    /Missing landing identity/,
  );
  const file = await landingContextFile(t, origin);
  const context = JSON.parse(await readFile(file, "utf8"));
  delete context.reference;
  await writeFile(file, JSON.stringify(context));
  await assert.rejects(
    retainLandingComparison(file, pair, publication),
    /Missing landing reference/,
  );
  await assert.rejects(
    retainLandingComparison(await landingContextFile(t, origin), pair, {
      ...publication,
      targetRef: "refs/heads/other",
    }),
    /does not match the supplied landing context/,
  );
  assert.deepEqual(requests, []);
});

test("the reporting command's landing operation takes a comparison with no identity", async (t) => {
  const { origin, requests } = await landingReceiver(t);
  // Retained away from the scripts other tests copy while this one runs.
  const retained = await mkdtemp(path.join(os.tmpdir(), "landing-retained-"));
  t.after(() => rm(retained, { recursive: true, force: true }));
  const receipt = await reportLanding(
    {
      operation: "landing-prepare",
      origin,
      source: "open-dough",
      host: "claude",
      reference,
      remote: "origin",
      target: "refs/heads/main",
      base,
      revision,
    },
    retained,
  );
  assert.deepEqual(await readdir(retained), [
    `landing-${requests[0].report.delivery}.json`,
  ]);
  assert.equal(receipt.state, "prepared");
  assert.equal("identity" in requests[0].report, false);
});
