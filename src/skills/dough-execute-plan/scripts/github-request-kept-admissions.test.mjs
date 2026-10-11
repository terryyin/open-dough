// What one request owner keeps of a rate limit's wait in its endpoint
// directory and what the owner started next begins with, without any owner
// process: the wait left, the backoff reached and the one request that goes
// first, never a wait that was not stored, and a turn held for a call at
// GitHub that is not the owner's own.
import assert from "node:assert/strict";
import {
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { until } from "./ci-github-test-fixtures.mjs";
import { AdmittedCalls } from "./github-request-calls.mjs";
import { KeptAdmissions } from "./github-request-kept-admissions.mjs";
import { log, loginMachine } from "./github-request-login-test-fixtures.mjs";
import { OwnedCalls } from "./github-request-owned-calls.mjs";

function endpointDirectory(t) {
  const directory = mkdtempSync(join(tmpdir(), "request-holds-"));
  t.after(() => rmSync(directory, { recursive: true, force: true }));
  return directory;
}

const never = () => new AbortController().signal;
const limited = (waitSeconds) => ({
  status: 403,
  headers: new Map(),
  body: "",
  failure: { kind: "rate-limited", status: 403, waitSeconds },
  askedAt: new Date().toISOString(),
});
const answered = () => ({
  status: 200,
  headers: new Map(),
  body: "",
  failure: undefined,
  askedAt: new Date().toISOString(),
});

// Whether a second request must wait for the first one's turn to end.
async function oneGoesFirst(admission) {
  const turnEnds = await admission.turn(never());
  let second = false;
  void admission.turn(never()).then((secondEnds) => {
    second = true;
    secondEnds();
  });
  await new Promise((resolve) => setImmediate(resolve));
  turnEnds();
  return !second;
}

test("a stored wait, its backoff and its one first request are what the next owner begins with, for that resource only", async (t) => {
  const directory = endpointDirectory(t);
  const first = new KeptAdmissions(directory, 60_000);
  assert.equal(first.keep("core"), true);
  assert.deepEqual(readdirSync(directory), []);

  // Two limits that direct no wait: one minute, then two.
  first.of("core").answered(limited(undefined), Date.now() - 120_000);
  const second = first.of("core").answered(limited(undefined), Date.now());
  assert.equal(second.failure.waitSeconds, 120);
  assert.equal(first.keep("core"), true);
  assert.deepEqual(readdirSync(directory), ["hold.core.json"]);

  const next = new KeptAdmissions(directory, 60_000);
  const { kind, waitSeconds } = next.refusal("core");
  assert.equal(kind, "held-back");
  assert.ok(waitSeconds > 110 && waitSeconds <= 120);
  assert.equal(next.heldBack(Date.now()).kind, "held-back");
  assert.equal(next.refusal("search"), undefined);
  // The third such limit in a row waits four minutes.
  const later = Date.now() + 121_000;
  assert.equal(next.heldBack(later), undefined);
  const third = next.of("core").answered(limited(undefined), later);
  assert.equal(third.failure.waitSeconds, 240);
});

test("a wait already over when the next owner starts still lets one request go first, and is removed once that request succeeds", async (t) => {
  const directory = endpointDirectory(t);
  const first = new KeptAdmissions(directory, 60_000);
  first.of("core").answered(limited(1), Date.now() - 2_000);
  assert.equal(first.keep("core"), true);

  const next = new KeptAdmissions(directory, 60_000);
  assert.equal(next.refusal("core"), undefined);
  assert.equal(await oneGoesFirst(next.of("core")), true);
  next.of("core").answered(answered(), Date.now());
  assert.equal(next.keep("core"), true);
  assert.deepEqual(readdirSync(directory), []);
  assert.equal(await oneGoesFirst(next.of("core")), false);
});

test("a stored wait longer than any wait may last ends when the longest would, an unreadable one is over with one request first, and a draft is no wait", async (t) => {
  const directory = endpointDirectory(t);
  const hold = (resource) => join(directory, `hold.${resource}.json`);
  writeFileSync(
    hold("core"),
    JSON.stringify({
      version: 1,
      resumesAtMs: Date.now() + 86_400_000,
      backoffStep: 0,
      resuming: true,
    }),
  );
  writeFileSync(hold("search"), '{"version":1,"resumesAtMs":');
  writeFileSync(`${hold("graphql")}.4242.draft`, readFileSync(hold("core")));

  const next = new KeptAdmissions(directory, 60_000);
  assert.ok(next.refusal("core").waitSeconds <= 3600);
  assert.equal(next.refusal("search"), undefined);
  assert.equal(await oneGoesFirst(next.of("search")), true);
  assert.equal(next.refusal("graphql"), undefined);
  assert.equal(await oneGoesFirst(next.of("graphql")), false);
  assert.deepEqual(readdirSync(directory).toSorted(), [
    "hold.core.json",
    "hold.search.json",
  ]);
});

test("a wait that cannot be stored refuses each call as failed, until it is stored", (t) => {
  const directory = endpointDirectory(t);
  const admissions = new KeptAdmissions(directory, 60_000);
  mkdirSync(join(directory, "hold.core.json", "in-the-way"), {
    recursive: true,
  });
  admissions.of("core").answered(limited(600), Date.now());

  assert.equal(admissions.keep("core"), false);
  assert.deepEqual(admissions.refusal("core"), { kind: "failed" });
  assert.deepEqual(readdirSync(directory), ["hold.core.json"]);

  rmSync(join(directory, "hold.core.json"), { recursive: true });
  assert.equal(admissions.refusal("core").kind, "held-back");
  assert.match(
    readFileSync(join(directory, "hold.core.json"), "utf8"),
    /^\{"version":1,"resumesAtMs":\d+,"backoffStep":0,"resuming":true\}$/,
  );
});

test("a call at GitHub that is not the owner's own holds one of its eight turns until it is gone", async (t) => {
  const { github } = loginMachine(t, { holdLogs: true });
  github.enter();
  const directory = endpointDirectory(t);
  const calls = new AdmittedCalls({
    admissions: new KeptAdmissions(directory, 60_000),
    owned: new OwnedCalls(directory, 1),
    loginStands: async () => true,
  });
  const leaving = Array.from(Array(8), () => Promise.withResolvers());
  for (const { promise } of leaving) calls.occupied("core", promise);

  const bounds = { boundMs: 30_000, maxBufferBytes: 1_000_000, scope: "any" };
  const waits = [1, 2].map((job) => calls.request(log(job), never(), bounds));
  leaving[0].resolve();
  await until(() => github.asked().length === 1, "one log was asked");
  github.releaseLogs();
  for (const { resolve } of leaving) resolve();
  for (const wait of waits) assert.equal((await wait).status, 200);
  assert.equal(github.mostUnderWay(), 1);
  assert.deepEqual(readdirSync(directory), []);
});
