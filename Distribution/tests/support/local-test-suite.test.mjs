import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  realpathSync,
  writeFileSync,
} from "node:fs";
import { availableParallelism } from "node:os";
import path from "node:path";
import { test } from "node:test";
import { fullDashboardSuite } from "../../../dashboard/tests/support/fullSuiteSelection.mjs";
import {
  dashboard,
  fixture,
  gateRef,
  git,
  repository,
  succeeded,
  until,
} from "./local-test-suite-fixtures.mjs";
import {
  repositoryAtAdmissionGate,
  repositoryAtSlotGate,
  startedChecks,
} from "./local-test-suite-gates.mjs";

test("local repository defaults to four jobs; explicit overrides and CI keep their concurrency", async (t) => {
  const cores = Number(
    spawnSync("getconf", ["_NPROCESSORS_ONLN"], { encoding: "utf8" }).stdout,
  );
  const cases = Math.max(cores, 4) + 1;
  const { project, observe } = await fixture(t, cases);
  for (const [name, expected, env] of [
    ["local", 4, {}],
    ["override", 2, { OPEN_DOUGH_TEST_JOBS: "2" }],
    ["ci", cores, { CI: "true" }],
  ]) {
    const observation = observe(name);
    // Every slot stays held until the runner, with checks still queued, finds
    // none free: the jobs it had started then are all it may start.
    const run = repositoryAtSlotGate(t, project, observation, expected, env);
    const started = () => startedChecks(observation);
    assert.equal(await run.gate, expected, `${name}: jobs dispatched`);
    await until(
      `${name}: ${expected} jobs entered`,
      () => started() === expected || run.child.exitCode !== null,
    );
    assert.equal(started(), expected, run.output());
    writeFileSync(path.join(observation, "release"), "");
    await succeeded(run);
    assert.equal(started(), cases);
  }
});

test("repository full suites serialize across spaced worktrees while focused and CI runs remain independent", async (t) => {
  const { project, linked, observe } = await fixture(t);
  const first = observe("first"),
    second = observe("second");
  const owner = repository(t, project, first);
  await until("first full suite entered", () =>
    existsSync(path.join(first, "start-0")),
  );
  const original = git(project, "rev-parse", gateRef);
  const ownerRecord = JSON.parse(git(project, "cat-file", "blob", original));
  // Admission keys inherited tokens by the real Git common directory.
  const common = realpathSync(
    git(project, "rev-parse", "--path-format=absolute", "--git-common-dir"),
  );
  // A copied token is insufficient without live ancestry: the contender
  // reaches admission and the live owner blocks it. Cancelling that waiting
  // caller must leave the active owner's admission untouched.
  for (const token of ["stale-token", ownerRecord.tokens[0]]) {
    const denied = observe(`denied-${token}`);
    const pretender = repositoryAtAdmissionGate(t, linked, denied, {
      DOUGH_LOCAL_SUITE_OWNERS: Buffer.from(
        JSON.stringify({ [common]: token }),
      ).toString("base64url"),
      DOUGH_LOCAL_SUITE_IDS: token,
    });
    assert.equal(await pretender.gate, original, `${token}: blocked by owner`);
    pretender.child.kill("SIGTERM");
    const cancelled = await pretender.result;
    assert.ok(
      cancelled.code === 143 || cancelled.signal === "SIGTERM",
      cancelled.output,
    );
    assert.equal(startedChecks(denied), 0);
    assert.equal(git(project, "rev-parse", gateRef), original);
  }
  const waiter = repositoryAtAdmissionGate(t, linked, second);
  assert.equal(await waiter.gate, original);
  const outsideChecks = path.join(
    path.dirname(project),
    "outside-checkout-checks",
  );
  mkdirSync(outsideChecks);
  writeFileSync(
    path.join(outsideChecks, "probe-0.sh"),
    readFileSync(path.join(project, "checks/probe-0.sh"), "utf8"),
  );
  for (const [name, env, args] of [
    ["focus", {}, ["checks/probe-0.sh"]],
    ["share", { OPEN_DOUGH_TEST_SPLIT: "1/1" }, []],
    ["ci", { CI: "true" }, []],
    ["outside-pathless", { OPEN_DOUGH_TEST_DIR: outsideChecks }, []],
  ]) {
    const observation = observe(name);
    writeFileSync(path.join(observation, "release"), "");
    await succeeded(repository(t, linked, observation, env, args));
    assert.ok(existsSync(path.join(observation, "start-0")));
    assert.ok(!existsSync(path.join(second, "start-0")));
  }
  writeFileSync(path.join(first, "release"), "");
  await succeeded(owner);
  await until("waiting full suite entered", () =>
    existsSync(path.join(second, "start-0")),
  );
  writeFileSync(path.join(second, "release"), "");
  await succeeded(waiter);
});

test("native Playwright config shares repository admission and preserves dashboard defaults and overrides", async (t) => {
  const { project, linked, observe } = await fixture(t);
  const first = observe("dashboard"),
    second = observe("repository");
  const owner = dashboard(t, linked, first);
  await until(
    "dashboard started",
    () =>
      existsSync(path.join(first, "start")) || owner.child.exitCode !== null,
  );
  assert.ok(existsSync(path.join(first, "start")), owner.output());
  assert.equal(readFileSync(path.join(first, "workers"), "utf8"), "2");
  const waiter = repository(t, project, second);
  for (const [name, args, env, expected] of [
    ["focus", ["--grep", "needle"], {}, 2],
    ["override", ["--workers=3", "--grep=needle"], {}, 3],
    ["ci", [], { CI: "true" }, availableParallelism()],
  ]) {
    const observation = observe(name);
    writeFileSync(path.join(observation, "release"), "");
    await succeeded(dashboard(t, project, observation, args, env));
    assert.equal(
      Number(readFileSync(path.join(observation, "workers"), "utf8")),
      expected,
    );
    assert.ok(!existsSync(path.join(second, "start-0")));
  }
  const listing = observe("list");
  await succeeded(dashboard(t, project, listing, ["--list"]));
  assert.ok(!existsSync(path.join(listing, "workers")));
  writeFileSync(path.join(first, "release"), "");
  await succeeded(owner);
  await until("repository entered after dashboard", () =>
    existsSync(path.join(second, "start-0")),
  );
  writeFileSync(path.join(second, "release"), "");
  await succeeded(waiter);
});

test("nested full invocations inherit actual ancestry without releasing their parent's admission", async (t) => {
  const { project, linked, observe } = await fixture(t);
  const first = observe("outer"),
    second = observe("waiter");
  const owner = repository(t, project, first, {
    NESTED_WORKTREE: linked,
    TZ: "Pacific/Auckland",
  });
  await until(
    "nested full invocation completed",
    () =>
      existsSync(path.join(first, "nested-returned")) ||
      owner.child.exitCode !== null,
  );
  assert.ok(existsSync(path.join(first, "nested/start")), owner.output());
  // The nested suite returned without releasing the outer suite's admission.
  const held = git(project, "rev-parse", gateRef);
  assert.equal(
    JSON.parse(git(project, "cat-file", "blob", held)).pid,
    owner.child.pid,
  );
  const waiter = repositoryAtAdmissionGate(t, linked, second);
  assert.equal(await waiter.gate, held);
  assert.equal(startedChecks(second), 0);
  writeFileSync(path.join(first, "release"), "");
  await succeeded(owner);
  await until("waiter entered", () => existsSync(path.join(second, "start-0")));
  writeFileSync(path.join(second, "release"), "");
  await succeeded(waiter);
});

test("independent repositories and copied non-Git runner fixtures remain usable", async (t) => {
  const first = await fixture(t),
    second = await fixture(t);
  const held = first.observe("held"),
    parallel = second.observe("parallel");
  const owner = repository(t, first.project, held);
  await until("owner entered", () => existsSync(path.join(held, "start-0")));
  writeFileSync(path.join(parallel, "release"), "");
  await succeeded(repository(t, second.project, parallel));
  const outside = path.join(second.root, "outside Git");
  cpSync(second.project, outside, {
    recursive: true,
    filter: (entry) => path.basename(entry) !== ".git",
  });
  const isolated = second.observe("outside");
  writeFileSync(path.join(isolated, "release"), "");
  await succeeded(repository(t, outside, isolated));
  writeFileSync(path.join(held, "release"), "");
  await succeeded(owner);
});

test("only an unfiltered dashboard run takes admission, including explicit worker and reporter settings", () => {
  const split = "OPEN_DOUGH_DASHBOARD_INTEGRATED_SPLIT";
  for (const args of [
    [],
    ["test"],
    ["test", "--workers", "2", "--reporter=list"],
    ["test", "-j3", "--timeout=1000"],
  ])
    assert.equal(
      fullDashboardSuite(args, {}, split),
      true,
      JSON.stringify(args),
    );
  for (const args of [
    ["probe"],
    ["--grep=needle"],
    ["-g", "needle"],
    ["--grep-invert", "skip"],
    ["--project", "chromium"],
    ["--shard=1/2"],
    ["--test-list", "cases.txt"],
    ["--test-list-invert=x"],
    ["--last-failed"],
    ["--only-changed"],
    ["--list"],
    ["--ui"],
    ["--", "probe"],
  ])
    assert.equal(
      fullDashboardSuite(["test", ...args], {}, split),
      false,
      JSON.stringify(args),
    );
  assert.equal(fullDashboardSuite(["test"], { [split]: "1/2" }, split), false);
});
