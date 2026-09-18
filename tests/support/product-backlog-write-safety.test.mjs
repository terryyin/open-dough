// Establishes that cooperating runs of the real backlog CLI against one file
// never lose an update, and that an unavailable lock writes nothing.
import assert from "node:assert/strict";
import {
  existsSync,
  mkdirSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { setTimeout as delay } from "node:timers/promises";
import {
  added,
  addArguments,
  addedLine,
  backlog,
  queued,
  run,
  scratchProject,
} from "./product-backlog-fixture.mjs";

test("write safety: concurrent cooperating runs keep every update", async (t) => {
  const project = scratchProject(t);
  const requests = ["a", "b", "c", "d"].map((suffix) => ({
    identity: `SEED-00${suffix.charCodeAt(0) - 96}#concurrent-${suffix}`,
    title: `Concurrent story ${suffix}`,
    link: `seeds/SEED-00${suffix.charCodeAt(0) - 96}-concurrent.md#concurrent-${suffix}`,
  }));

  const results = await Promise.all(
    requests.map((request) =>
      run(project, addArguments(request, ["--position", "last"])),
    ),
  );
  for (const [index, result] of results.entries()) {
    assert.equal(
      result.code,
      0,
      `${requests[index].identity}: ${result.stderr}`,
    );
  }

  const lines = project.read().split("\n");
  for (const request of requests) {
    const line = `- [${request.title}](${request.link}) — ${request.identity.split("#")[0]}`;
    assert.equal(
      lines.filter((candidate) => candidate === line).length,
      1,
      `${request.identity} was lost or duplicated`,
    );
  }
  assert.deepEqual(
    lines.filter((line) => queued.includes(line)),
    queued,
  );
});

test("write safety: a waiting run applies to the newest file content", async (t) => {
  const project = scratchProject(t);
  mkdirSync(`${project.file}.lock`);

  const waiting = run(project, addArguments(added, ["--position", "last"]), {
    DOUGH_BACKLOG_LOCK_TIMEOUT_MS: "20000",
  });
  await delay(400);
  const newerLine =
    "- [Written while the lock was held](seeds/SEED-006-newer.md#newer) — SEED-006";
  const newer = `${backlog}${newerLine}\n`;
  writeFileSync(project.file, newer, "utf8");
  rmSync(`${project.file}.lock`, { recursive: true });

  const result = await waiting;
  assert.equal(result.code, 0, result.stderr);
  assert.equal(project.read(), `${newer}${addedLine}\n`);
});

test("write safety: an unavailable lock refuses and writes nothing", async (t) => {
  const project = scratchProject(t);
  const lock = `${project.file}.lock`;
  mkdirSync(lock);
  t.after(() => rmSync(lock, { recursive: true, force: true }));

  const result = await run(project, addArguments(), {
    DOUGH_BACKLOG_LOCK_TIMEOUT_MS: "200",
  });
  assert.equal(result.code, 1);
  assert.match(result.stderr, /locked by another run/);
  assert.match(result.stderr, /remove the lock by hand/);
  assert.equal(project.read(), backlog);
});

test("write safety: a backlog path that is not there locks nothing", async (t) => {
  const project = scratchProject(t);
  const absent = [
    {
      why: "a missing file beside the real backlog",
      file: ".planning/OTHER-BACKLOG.md",
      directory: ".planning",
    },
    {
      why: "a missing directory a typo names",
      file: "docs/BACKLOG.md",
      directory: "docs",
    },
  ];

  for (const { why, file, directory } of absent) {
    const result = await run(project, [...addArguments(), "--file", file]);
    assert.equal(result.code, 1, `${why}: expected a refusal`);
    assert.match(result.stderr, /Backlog file not found: .*BACKLOG\.md/, why);
    assert.match(result.stderr, /The backlog was not changed\./, why);
    // The refusal is the actionable message, not a failure to make the lock.
    assert.doesNotMatch(result.stderr, /ENOENT|mkdirSync|at async/, why);

    // Nothing was left behind and nothing was materialised: no backlog, no
    // lock directory, no temp file, and no directory the typo named.
    const named = join(project.directory, file);
    assert.equal(existsSync(named), false, `${why}: the path was created`);
    assert.equal(existsSync(`${named}.lock`), false, `${why}: a lock is left`);
    const holder = join(project.directory, directory);
    if (directory === "docs") {
      assert.equal(existsSync(holder), false, `${why}: the directory was made`);
    } else {
      assert.deepEqual(readdirSync(holder), ["PRODUCT-BACKLOG.md"], why);
    }
  }

  // The backlog the project does have is untouched, and still usable.
  assert.equal(project.read(), backlog);
  const applied = await run(project, addArguments());
  assert.equal(applied.code, 0, applied.stderr);
  assert.equal(project.read().includes(addedLine), true);
});
