// The default preview compares real checkout jobs with the last fetched trunk.
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import { makeMe } from "./makeMe.mjs";
import { durationListText } from "./job-duration-list.mjs";
import {
  materializeRepository,
  materializeLocalCheckout,
} from "./repository-fixture.mjs";

const copyHelper = fileURLToPath(
  new URL("../helpers/copy-runner.bash", import.meta.url),
);
const durations = () =>
  makeMe.jobDurations
    .with([
      ["Distribution/tests/feature/recorded.sh", 9],
      ["scripts/check-self-installation.sh", 1],
    ])
    .please();
const description = () =>
  makeMe.aRepository
    .withRevision("trunk", {
      files: {
        "Distribution/tests/feature/recorded.sh": "#!/usr/bin/env bash\n",
        "Distribution/tests/feature/stale.sh": "#!/usr/bin/env bash\n",
        "Distribution/tests/support/stale.test.mjs": "",
        "Distribution/tests/support/promoted.mjs": "",
        "Distribution/tests/support/.hidden.test.mjs": "",
        "Distribution/tests/git-publication/git-publication-native-one-shot.sh":
          "#!/usr/bin/env bash\n",
        "Distribution/tests/support/helper.sh": "#!/usr/bin/env bash\n",
        "Distribution/tests/node-test-files":
          "Distribution/tests/support/*.test.mjs\n",
        "Distribution/tests/longest-first": durationListText(durations()),
        "Distribution/tests/time-budget":
          "per-job-seconds=10\ntotal-job-seconds=30\n",
        "scripts/check-self-installation.sh": "#!/usr/bin/env bash\n",
      },
    })
    .please();

function copyRunner(checkout) {
  const copied = spawnSync(
    "bash",
    ["-c", 'source "$1"; copy_runner "$2"', "copy", copyHelper, checkout],
    { encoding: "utf8" },
  );
  assert.equal(copied.status, 0, copied.stderr);
}
const preview = (checkout, args = [], options = {}) =>
  spawnSync(
    process.execPath,
    ["scripts/test-shares.mjs", "preview", "--split-count", "2", ...args],
    { cwd: checkout, encoding: "utf8", ...options },
  );

test("default preview marks trunk shell and Node jobs stale while added and newly selected files stay estimates", async (t) => {
  const repository = await materializeRepository(description());
  t.after(repository.cleanup);
  const checkout = repository.integration;
  copyRunner(checkout);
  writeFileSync(
    join(checkout, "Distribution/tests/feature/added.sh"),
    "#!/usr/bin/env bash\n",
  );
  // The file already existed on trunk, but only this change runs it.
  writeFileSync(
    join(checkout, "Distribution/tests/node-test-files"),
    "Distribution/tests/support/*.test.mjs\nDistribution/tests/support/promoted.mjs\nDistribution/tests/support/.hidden.test.mjs\nDistribution/tests/git-publication/git-publication-native-one-shot.sh\n",
  );
  const result = preview(checkout);
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stderr, "");
  assert.match(
    result.stdout,
    /^Stale duration list .*: 2 jobs already on trunk lack recorded seconds\.\n/,
  );
  assert.match(
    result.stdout,
    /Distribution\/tests\/feature\/stale\.sh \(stale; assumed 5\.0 s\)/,
  );
  assert.match(
    result.stdout,
    /Distribution\/tests\/support\/stale\.test\.mjs \(stale; assumed 5\.0 s\)/,
  );
  assert.match(
    result.stdout,
    /Distribution\/tests\/feature\/added\.sh \(estimate at 5\.0 s\)/,
  );
  assert.match(
    result.stdout,
    /Distribution\/tests\/support\/promoted\.mjs \(estimate at 5\.0 s\)/,
  );
  assert.match(
    result.stdout,
    /Distribution\/tests\/support\/\.hidden\.test\.mjs \(estimate at 5\.0 s\)/,
  );
  assert.match(
    result.stdout,
    /git-publication-native-one-shot\.sh \(estimate at 5\.0 s\)/,
  );
  assert.doesNotMatch(result.stdout, /helper\.sh/);
  assert.match(result.stdout, /headroom .*\(rests on assumed seconds\)/);
  // An inherited split may select current jobs, but must not split membership again.
  const selected = preview(checkout, [], {
    env: { ...process.env, OPEN_DOUGH_TEST_SPLIT: "2/2" },
  });
  assert.equal(selected.status, 0, selected.stderr);
  assert.match(
    selected.stdout,
    /^Stale duration list .*: 2 jobs already on trunk lack recorded seconds\.\n/,
  );
});

test("an unreadable trunk names origin/main and the explicit override; substitutes remain usable", async (t) => {
  const repository = await materializeLocalCheckout(t, description());
  const checkout = repository.integration;
  copyRunner(checkout);
  const missing = preview(checkout);
  assert.equal(missing.status, 1);
  assert.equal(missing.stdout, "");
  assert.equal(
    missing.stderr,
    "FAIL: origin/main cannot be read; fetch it or supply --trunk-labels FILE.\n",
  );
  const labels = join(checkout, "labels");
  writeFileSync(labels, "Distribution/tests/feature/recorded.sh\n");
  const explicit = preview(checkout, ["--trunk-labels", labels]);
  assert.equal(explicit.status, 0, explicit.stderr);
  assert.match(explicit.stdout, /\(estimate at 5\.0 s\)/);
  for (const args of [
    ["--labels", labels],
    ["--test-dir", "Distribution/tests"],
  ]) {
    const substitute = preview(checkout, args);
    assert.equal(substitute.status, 0, substitute.stderr);
    assert.doesNotMatch(
      substitute.stdout,
      /Stale duration list|\(estimate at|\(stale;/,
    );
  }
});
