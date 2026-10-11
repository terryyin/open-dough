// An installed reader whose owner process starts but never publishes a record.
// The normal internal start limit expires before the reader's own deadline.
import assert from "node:assert/strict";
import {
  copyFileSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { fileURLToPath, pathToFileURL } from "node:url";
import {
  instrumentedGithubFixture,
  until,
} from "./ci-github-test-fixtures.mjs";
import {
  ownerRecords,
  processGone,
} from "./github-request-owner-test-fixtures.mjs";

test(
  "a silent owner startup remains unknown, settles failed and never invents a protocol mismatch",
  { timeout: 45_000 },
  async (t) => {
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
    const requests = new GitHubRequests({
      boundMs: 40_000,
      backoffBaseMs: 60_000,
      failed: ({ cause }) => failed.push(cause),
    });
    const answer = await requests.request(
      ["api", "repos/owner/repo/actions/workflows/ci.yml"],
      new AbortController().signal,
    );
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
  },
);
