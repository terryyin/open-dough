// Separate consumer processes asking one instrumented `gh` under different
// logins -- a token variable's, or the one `gh` stores, which a test switches
// as `gh auth switch` does: each API host and login has one owner whatever
// way a process comes by it, logins share no rate-limit wait and no call,
// and a call asked under a login that has since changed answers nobody.
import assert from "node:assert/strict";
import { dirname } from "node:path";
import { test } from "node:test";
import { until } from "./ci-github-test-fixtures.mjs";
import {
  endpointOf,
  log,
  loginMachine,
} from "./github-request-login-test-fixtures.mjs";
import { EndpointBinding } from "./github-request-owner-endpoint.mjs";
import { processGone } from "./github-request-owner-test-fixtures.mjs";

test("each API host and login has one endpoint, whether a token variable or gh's stored login names it", async (t) => {
  const machine = loginMachine(t);
  const alice = machine.withToken("alice").env;
  const stored = machine.stored("alice");
  assert.equal(await endpointOf(stored.env), await endpointOf(alice));
  assert.equal(
    await endpointOf({ ...alice, GH_HOST: "GitHub.com" }),
    await endpointOf(alice),
  );
  const others = [
    machine.withToken("bob").env,
    { ...alice, GH_HOST: "github.example" },
    machine.github.env,
  ];
  for (const other of others)
    assert.notEqual(await endpointOf(other), await endpointOf(alice));

  const binding = new EndpointBinding(stored.env);
  stored.login("bob");
  assert.equal(await binding.directory(), await endpointOf(others[0]));
  // Its name and everything kept beside it say nothing of the token.
  assert.doesNotMatch(await binding.directory(), /secret|alice|bob/);
});

test("one login's rate limit holds back its processes however they come by it, and no process of another login", async (t) => {
  const machine = loginMachine(t);
  const byToken = machine.withToken("alice").consumer();
  const byStore = machine.stored("alice").consumer();
  const bob = machine.withToken("bob").consumer();

  machine.github.limit(1, "jobs/1/", 600, "bob");
  assert.equal((await bob.ask(log(1)).settled).failure.kind, "rate-limited");
  assert.equal((await byToken.ask(log(2)).settled).body, "the log for alice");

  machine.github.limit(1, "jobs/3/", 600, "alice");
  assert.equal(
    (await byToken.ask(log(3)).settled).failure.kind,
    "rate-limited",
  );
  for (const held of [byStore.ask(log(4)), bob.ask(log(5))])
    assert.equal((await held.settled).failure.kind, "held-back");

  assert.deepEqual(machine.asked("alice"), ["2", "3"]);
  assert.deepEqual(machine.asked("bob"), ["1"]);
  // One owner a login: a second for either would stand in a third record.
  const owners = machine.owners();
  assert.equal(owners.length, 2);
  assert.notEqual(owners[0].directory, owners[1].directory);
});

test("processes of one login share an outstanding call, and a process of another login asks its own", async (t) => {
  const machine = loginMachine(t, { holdLogs: true });
  const consumers = [
    machine.withToken("alice").consumer(),
    machine.stored("alice").consumer(),
    machine.withToken("bob").consumer(),
  ];
  const waits = consumers.map((entering) => entering.ask(log(1)));
  await Promise.all(consumers.map((entering) => entering.reached()));
  await until(
    () => machine.asked("alice").length + machine.asked("bob").length === 2,
    "each login's call was asked",
  );

  machine.github.releaseLogs();
  const bodies = [];
  for (const { settled } of waits) bodies.push((await settled).body);
  assert.deepEqual(bodies, [
    "the log for alice",
    "the log for alice",
    "the log for bob",
  ]);
  assert.deepEqual(machine.asked("alice"), ["1"]);
  assert.deepEqual(machine.asked("bob"), ["1"]);
});

test("a login switched while calls are outstanding answers none of them: each is asked again under the new login", async (t) => {
  const machine = loginMachine(t, { holdLogs: true });
  const stored = machine.stored("alice");
  const consumer = stored.consumer();
  const jobs = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  const waits = jobs.map((job) => consumer.ask(log(job)));
  await consumer.reached();
  await until(() => machine.asked("alice").length === 8, "eight were asked");
  const [earlier] = machine.owners();

  stored.login("bob");
  machine.github.releaseLogs();
  for (const { settled } of waits)
    assert.deepEqual(await settled, {
      settled: (await settled).settled,
      status: 200,
      body: "the log for bob",
    });
  // The ninth waited its turn under the earlier login and was never asked
  // under it; no failed call was told for an answer nobody was given.
  assert.equal(machine.asked("alice").length, 8);
  assert.deepEqual(machine.asked("bob").toSorted(), jobs.map(String));
  assert.deepEqual(consumer.failed, ["failed"]);
  await until(() => processGone(earlier.pid), "the earlier owner ended");
});

test("a rate limit holds its login after a switch away and back, and never the login switched to or a process started under it", async (t) => {
  const machine = loginMachine(t);
  const stored = machine.stored("alice");
  const consumer = stored.consumer();
  machine.github.limit(1, "jobs/1/", 600, "alice");
  assert.equal(
    (await consumer.ask(log(1)).settled).failure.kind,
    "rate-limited",
  );
  const [limited] = machine.owners();

  stored.login("bob");
  assert.equal((await consumer.ask(log(2)).settled).body, "the log for bob");
  const restarted = stored.consumer();
  assert.equal((await restarted.ask(log(3)).settled).body, "the log for bob");

  stored.login("alice");
  const held = await consumer.ask(log(4)).settled;
  assert.equal(held.failure.kind, "held-back");
  assert.ok(held.failure.waitSeconds > 590 && held.failure.waitSeconds <= 600);
  assert.equal(processGone(limited.pid), false);
  assert.deepEqual(
    machine
      .owners()
      .filter((owner) => dirname(owner.file) === limited.directory),
    [limited],
  );
  assert.deepEqual(machine.asked("alice"), ["1"]);
  assert.deepEqual(machine.asked("bob"), ["2", "3"]);
});

test("a rate limit of GitHub's search allowance holds back search reads and no other route", async (t) => {
  const machine = loginMachine(t);
  const consumer = machine.withToken("alice").consumer();
  const search = (query) => ["api", `search/code?q=${query}`];
  machine.github.limit(1, "search/", 600);
  assert.equal(
    (await consumer.ask(search("one")).settled).failure.kind,
    "rate-limited",
  );
  assert.equal(
    (await consumer.ask(search("two")).settled).failure.kind,
    "held-back",
  );
  assert.equal((await consumer.ask(log(1)).settled).status, 200);
  assert.deepEqual(machine.github.asked(), [
    "api --include search/code?q=one",
    `api --include ${log(1)[1]}`,
  ]);
});
