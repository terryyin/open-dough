// Dashboard callers do not inherit the shell runner's disabled maintenance.
// Observe real Git children while building, copying, and using queued trunks.
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { exec } from "./publication-test-fixtures.mjs";

const fixtureModule = new URL(
  "./workspace-publication-fixtures.mjs",
  import.meta.url,
).href;

for (const durableCommandEvidence of [false, true]) {
  test(`queued trunks stay free of automatic Git maintenance with durable evidence ${durableCommandEvidence}`, async (t) => {
    const parent = mkdtempSync(join(tmpdir(), "queued-trunk-maintenance-"));
    t.after(() => rmSync(parent, { recursive: true, force: true }));
    const trace = join(parent, "git-trace.jsonl");
    const source = `
      import assert from 'node:assert/strict';
      import { writeFileSync } from 'node:fs';
      import { join } from 'node:path';
      import { createQueuedTrunk } from ${JSON.stringify(fixtureModule)};
      import { git, lsRemoteSha, revParse } from ${JSON.stringify(new URL("./publication-test-fixtures.mjs", import.meta.url).href)};
      let base;
      for (let copy = 0; copy < 2; copy++) {
        const trunk = await createQueuedTrunk({
          parent: ${JSON.stringify(parent)},
          durableCommandEvidence: ${durableCommandEvidence},
        });
        try {
          if (${durableCommandEvidence}) base = trunk.trunkSha;
          base ??= trunk.trunkSha;
          assert.equal(trunk.trunkSha, base);
          assert.equal(await lsRemoteSha(trunk.origin, 'refs/heads/main'), base);
          assert.equal((await git(trunk.integration, 'status', '--porcelain')).stdout, '');
          writeFileSync(join(trunk.integration, 'trunk.txt'), 'copy ' + copy + '\\n');
          await git(trunk.integration, 'add', 'trunk.txt');
          await git(trunk.integration, 'commit', '--quiet', '-m', 'advance copy');
          await git(trunk.integration, 'push', '--quiet', 'origin', 'main');
          assert.equal(await lsRemoteSha(trunk.origin, 'refs/heads/main'), await revParse(trunk.integration, 'HEAD'));
          await git(trunk.integration, 'fsck', '--full');
          await git(trunk.origin, 'fsck', '--full');
        } finally {
          await trunk.cleanup();
        }
      }
    `;
    // Fresh process/cache and default Git maintenance, as under Playwright.
    const { stdout, stderr } = await exec(
      process.execPath,
      ["--input-type=module", "--eval", source],
      {
        env: {
          ...process.env,
          TMPDIR: parent,
          GIT_CONFIG_COUNT: "0",
          GIT_TRACE2_EVENT: trace,
        },
      },
    );
    assert.equal(stdout, "");
    assert.equal(stderr, "");
    const events = readFileSync(trace, "utf8")
      .trim()
      .split("\n")
      .map((line) => JSON.parse(line));
    const automatic = events.filter(
      (event) =>
        event.event === "child_start" &&
        event.argv.includes("maintenance") &&
        event.argv.includes("--auto"),
    );
    assert.deepEqual(
      automatic.map(({ argv }) => argv),
      [],
      "queued trunk construction and copies must not leave Git maintenance racing their object directories",
    );
  });
}
