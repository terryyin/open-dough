// An installed reader whose owner process starts but never publishes a record.
// The normal internal start limit expires before the reader's own deadline,
// on a test-controlled clock once the silent owner has started.
import assert from "node:assert/strict";
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { setImmediate as turn } from "node:timers/promises";
import { fileURLToPath, pathToFileURL } from "node:url";
import {
  instrumentedGithubFixture,
  until,
} from "./ci-github-test-fixtures.mjs";
import {
  ownerRecords,
  processGone,
} from "./github-request-owner-test-fixtures.mjs";

test("a silent owner startup remains unknown, settles failed and never invents a protocol mismatch", async (t) => {
  const github = instrumentedGithubFixture(t, {});
  github.enter();
  const installation = join(github.env.CI_GH_FIXTURE, "installed-reader");
  mkdirSync(installation);
  const source = fileURLToPath(new URL(".", import.meta.url));
  for (const name of readdirSync(source))
    if (name.endsWith(".mjs") && !name.includes("test"))
      copyFileSync(join(source, name), join(installation, name));
  const pidFile = join(github.env.CI_GH_FIXTURE, "silent-owner.pid");
  writeFileSync(
    join(installation, "github-request-owner.mjs"),
    `
    import { writeFileSync } from "node:fs";
    writeFileSync(${JSON.stringify(pidFile)}, String(process.pid));
    setInterval(() => {}, 1_000);
  `,
  );
  github.teardown.defer(async () => {
    const pid = Number(readFileSync(pidFile, "utf8"));
    process.kill(pid, "SIGTERM");
    await until(
      () => processGone(pid),
      "the silent fixture owner ended",
      2_000,
    );
  });
  const { GitHubRequests } = await import(
    pathToFileURL(join(installation, "github-requests.mjs"))
  );
  const failed = [];
  const boundMs = 40_000;
  const requests = new GitHubRequests({
    boundMs,
    backoffBaseMs: 60_000,
    failed: ({ cause }) => failed.push(cause),
  });
  // The reader's start limit and its own bound read this clock; the owner
  // process and the fixture's files keep real time.
  t.mock.timers.enable({ apis: ["setTimeout", "Date"], now: Date.now() });
  let answer;
  try {
    const asking = requests
      .request(
        ["api", "repos/owner/repo/actions/workflows/ci.yml"],
        new AbortController().signal,
      )
      .then((settled) => {
        answer = settled;
      });
    // The reader started its owner, which never publishes a record.
    while (!existsSync(pidFile)) await turn();
    // A second at a time, so the 30 s start limit is passed before the
    // reader's own bound.
    for (
      let elapsedMs = 0;
      answer === undefined && elapsedMs <= boundMs;
      elapsedMs += 1_000
    ) {
      t.mock.timers.tick(1_000);
      await turn();
    }
    assert.notEqual(answer, undefined, "the reader settled on its clock");
    await asking;
  } finally {
    t.mock.timers.reset();
  }
  assert.deepEqual(answer.failure, {
    kind: "owner-unavailable",
    cause: "unknown",
  });
  assert.deepEqual(failed, ["owner-unavailable"]);
  assert.deepEqual(github.asked(), []);
  assert.deepEqual(
    ownerRecords(github.env.DOUGH_GITHUB_REQUEST_OWNER_ROOT),
    [],
  );
  for (const secret of [installation, pidFile, "incompatible", "timed-out"])
    assert.equal(JSON.stringify(answer).includes(secret), false);
});
