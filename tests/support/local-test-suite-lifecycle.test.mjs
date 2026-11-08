import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { setTimeout as delay } from "node:timers/promises";
import { test } from "node:test";
import {
  fixture,
  gateRef,
  repository,
  succeeded,
  until,
} from "./local-test-suite-fixtures.mjs";

for (const endedBy of ["failure", "SIGTERM", "SIGINT", "SIGKILL"]) {
  test(`${endedBy} releases admission and stale retirement finishes before competing waiters enter`, async (t) => {
    const { project, linked, observe } = await fixture(t);
    const first = observe("owner"),
      second = observe("second"),
      third = observe("third");
    const owner = repository(
      t,
      project,
      first,
      endedBy === "failure" ? { PROBE_EXIT: "7" } : {},
    );
    await until("owner check entered", () =>
      existsSync(path.join(first, "start-0")),
    );
    const predecessor = { PREVIOUS_CHECK: path.join(first, "pid-0") };
    const waiting = repository(t, linked, second, predecessor);
    const competing = repository(t, project, third, predecessor);
    if (endedBy === "failure") writeFileSync(path.join(first, "release"), "");
    else owner.child.kill(endedBy);
    const result = await owner.result;
    if (endedBy === "failure") assert.equal(result.code, 1, result.output);
    else if (endedBy !== "SIGKILL")
      assert.equal(
        result.code,
        endedBy === "SIGINT" ? 130 : 143,
        result.output,
      );
    await until(
      "one waiter entered",
      () =>
        existsSync(path.join(second, "start-0")) ||
        existsSync(path.join(third, "start-0")),
    );
    const entered = existsSync(path.join(second, "start-0")) ? second : third;
    const other = entered === second ? third : second;
    assert.match(
      readFileSync(path.join(entered, "predecessor-state"), "utf8").trim(),
      /^(?:[EZ].*)?$/,
      "the next suite entered while its predecessor's check was still running",
    );
    await delay(150);
    assert.ok(
      !existsSync(path.join(other, "start-0")),
      "competing stale reclaimers both entered",
    );
    writeFileSync(path.join(entered, "release"), "");
    await until("remaining waiter entered", () =>
      existsSync(path.join(other, "start-0")),
    );
    writeFileSync(path.join(other, "release"), "");
    await Promise.all([succeeded(waiting), succeeded(competing)]);
    assert.equal(
      spawnSync("git", [
        "-C",
        project,
        "rev-parse",
        "--verify",
        "--quiet",
        gateRef,
      ]).status,
      1,
    );
  });
}

test("a reclaimer killed during retirement leaves predecessor cleanup owned by its successor", async (t) => {
  const { project, linked, observe } = await fixture(t);
  const first = observe("owner"),
    recovering = observe("recovering"),
    final = observe("final");
  const owner = repository(t, project, first, { IGNORE_TERM: "1" });
  await until("owner entered", () => existsSync(path.join(first, "start-0")));
  owner.child.kill("SIGKILL");
  const reclaimer = repository(t, linked, recovering);
  await until("first reclaimer owns unfinished retirement", () => {
    const result = spawnSync("git", ["-C", project, "show", gateRef], {
      encoding: "utf8",
    });
    if (result.status !== 0) return false;
    const record = JSON.parse(result.stdout);
    return record.pid === reclaimer.child.pid && record.tokens.length > 1;
  });
  reclaimer.child.kill("SIGKILL");
  const successor = repository(t, project, final, {
    PREVIOUS_CHECK: path.join(first, "pid-0"),
  });
  await until("successor retired the original check before entry", () =>
    existsSync(path.join(final, "start-0")),
  );
  assert.match(
    readFileSync(path.join(final, "predecessor-state"), "utf8").trim(),
    /^(?:[EZ].*)?$/,
  );
  assert.ok(!existsSync(path.join(recovering, "start-0")));
  writeFileSync(path.join(final, "release"), "");
  await Promise.all([owner.result, reclaimer.result, succeeded(successor)]);
});
