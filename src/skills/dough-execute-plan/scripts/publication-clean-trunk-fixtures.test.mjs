// A local push drops the test runner's Git configuration. Observe the bare
// remotes before another writer clones their object directories.
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { exec } from "./publication-test-fixtures.mjs";

test("publication fixture remotes do not start maintenance while another writer clones them", async (t) => {
  const parent = mkdtempSync(join(tmpdir(), "publication-maintenance-"));
  t.after(() => rmSync(parent, { recursive: true, force: true }));
  const trace = join(parent, "git-trace.jsonl");
  const source = `
    import assert from 'node:assert/strict';
    import { createCleanTrunkFixture, authorizedRemote } from ${JSON.stringify(new URL("./publication-clean-trunk-fixtures.mjs", import.meta.url).href)};
    import { advanceOriginBacklog, backlogPath } from ${JSON.stringify(new URL("./publication-racing-suffix-fixtures.mjs", import.meta.url).href)};
    import { git, lsRemoteSha } from ${JSON.stringify(new URL("./publication-test-fixtures.mjs", import.meta.url).href)};
    const fixture = await createCleanTrunkFixture();
    try {
      for (const [remote, branch] of [['origin', 'main'], ['upstream', 'trunk']]) {
        const url = await authorizedRemote(fixture, remote, branch);
        if (remote !== 'origin') await git(fixture.integration, 'push', remote, 'main:refs/heads/' + branch);
        for (const title of ['ancestor', 'sibling']) {
          const body = '# ' + title + '\\n';
          const sha = await advanceOriginBacklog(url, body, title + ' backlog', branch);
          assert.equal(await lsRemoteSha(url, 'refs/heads/' + branch), sha);
          assert.equal((await git(url, 'show', sha + ':' + backlogPath)).stdout, body);
          await git(url, 'fsck', '--full');
        }
      }
    } finally {
      fixture.cleanup();
    }
  `;
  const { stdout, stderr } = await exec(
    process.execPath,
    ["--input-type=module", "--eval", source],
    { env: { ...process.env, TMPDIR: parent, GIT_TRACE2_EVENT: trace } },
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
    "publication fixture pushes must not leave maintenance racing another writer's local clone",
  );
});
