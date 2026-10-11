// The launch-bound landing handoff against a loopback receiver: a context
// that names a story carries its identity through preparation and acceptance,
// and a context that names none (a session with no story) is retained and
// delivered by its launch reference alone.
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";
import {
  acceptsLandingWithoutIdentity,
  captureAcceptedLanding,
  reportLanding,
  retainLandingComparison,
} from "./dashboard-landing.mjs";

const base = "a".repeat(40);
const revision = "b".repeat(40);
const reference = "6f0e3c0e-6a0c-4b54-9d0b-0d3a3f0f4c11";
const publication = { remote: "origin", targetRef: "refs/heads/main" };
const accepted = {
  base,
  revision,
  remote: "origin",
  target: "refs/heads/main",
};

// A receiver that keeps each request and answers its comparison as received.
async function receiver(t) {
  const requests = [];
  const server = createServer((req, res) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
    });
    req.on("end", () => {
      const report = JSON.parse(body);
      requests.push({ url: req.url, report });
      res.setHeader("Content-Type", "application/json");
      res.end(
        JSON.stringify({
          ...report,
          receipt: "receipt-1",
          state: req.url.endsWith("/prepare") ? "prepared" : "recorded",
        }),
      );
    });
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  t.after(() => server.close());
  return { origin: `http://127.0.0.1:${server.address().port}`, requests };
}

// The context file the dashboard prepares for a launch, in its own directory.
async function contextFile(t, origin, identity) {
  const directory = await mkdtemp(path.join(os.tmpdir(), "landing-context-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const file = path.join(directory, "landing-context.json");
  await writeFile(
    file,
    JSON.stringify({
      origin,
      source: "open-dough",
      host: "claude",
      reference,
      ...(identity === undefined ? {} : { identity }),
      remote: "origin",
      target: "refs/heads/main",
    }),
  );
  return file;
}

test("this installation says it takes a context that names no story", () => {
  assert.equal(acceptsLandingWithoutIdentity, true);
});

test("a context naming no story is retained before the push and recorded after acceptance by its launch reference alone", async (t) => {
  const { origin, requests } = await receiver(t);
  const file = await contextFile(t, origin);

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
});

test("a context naming a story still carries its identity, and a comparison trunk did not accept is not recorded", async (t) => {
  const { origin, requests } = await receiver(t);
  const file = await contextFile(t, origin, "SEED-1#story");
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
  const { origin, requests } = await receiver(t);
  const pair = { candidate: revision, suffixBase: base };
  const blank = await contextFile(t, origin, "");
  await assert.rejects(
    retainLandingComparison(blank, pair, publication),
    /Missing landing identity/,
  );
  const file = await contextFile(t, origin);
  const context = JSON.parse(await readFile(file, "utf8"));
  delete context.reference;
  await writeFile(file, JSON.stringify(context));
  await assert.rejects(
    retainLandingComparison(file, pair, publication),
    /Missing landing reference/,
  );
  await assert.rejects(
    retainLandingComparison(await contextFile(t, origin), pair, {
      ...publication,
      targetRef: "refs/heads/other",
    }),
    /does not match the supplied landing context/,
  );
  assert.deepEqual(requests, []);
});

test("the reporting command's landing operation takes a comparison with no identity", async (t) => {
  const { origin, requests } = await receiver(t);
  let receipt;
  try {
    receipt = await reportLanding({
      operation: "landing-prepare",
      origin,
      source: "open-dough",
      host: "claude",
      reference,
      remote: "origin",
      target: "refs/heads/main",
      base,
      revision,
    });
  } finally {
    // The operation retains its input beside the script.
    const delivery = requests[0]?.report.delivery;
    if (delivery !== undefined)
      await rm(path.join(import.meta.dirname, `landing-${delivery}.json`), {
        force: true,
      });
  }
  assert.equal(receipt.state, "prepared");
  assert.equal("identity" in requests[0].report, false);
});
