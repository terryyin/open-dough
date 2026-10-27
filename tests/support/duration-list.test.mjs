// Composite duration lists retain ordinary TSV rows and the existing refresh CLI.
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { readDurationList } from "../../scripts/share-deal.mjs";

function fixture(t, files) {
  const directory = mkdtempSync(join(tmpdir(), "duration-list-"));
  t.after(() => rmSync(directory, { recursive: true, force: true }));
  for (const [name, text] of Object.entries(files)) {
    writeFileSync(join(directory, name), text);
  }
  return directory;
}

function refresh(directory, list) {
  const result = spawnSync(
    process.execPath,
    [
      "scripts/test-shares.mjs",
      "refresh",
      "--list",
      join(directory, list),
      "--source",
      "new run",
      join(directory, "times"),
    ],
    { encoding: "utf8" },
  );
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stdout, "");
}

test("refresh preserves indexed parts, merges every duration, and records new jobs in the index", (t) => {
  const directory = fixture(t, {
    index:
      "# kept\n# Include: agents\n# Include: boundary\n# Source: old run\n1.0\tgeneral\n",
    agents: "# agent journeys\n# Source: old run\n2.0\tlaunch\n",
    boundary: "# boundary checks\n# Source: old run\n3.0\tread\n",
    times: "4.0\tlaunch\n5.0\tread\n2.0\tgeneral\n6.0\tnew\n1.0\tnew\n",
  });
  assert.deepEqual(
    [...readDurationList(join(directory, "index")).seconds],
    [
      ["general", 1],
      ["launch", 2],
      ["read", 3],
    ],
  );
  refresh(directory, "index");
  const contents = (name) => readFileSync(join(directory, name), "utf8");
  assert.equal(
    contents("index"),
    "# kept\n# Include: agents\n# Include: boundary\n# Source: new run\n6.0\tnew\n2.0\tgeneral\n",
  );
  assert.equal(
    contents("agents"),
    "# agent journeys\n# Source: new run\n4.0\tlaunch\n",
  );
  assert.equal(
    contents("boundary"),
    "# boundary checks\n# Source: new run\n5.0\tread\n",
  );
  const refreshed = [...readDurationList(join(directory, "index")).seconds];
  refresh(directory, "index");
  assert.deepEqual(
    [...readDurationList(join(directory, "index")).seconds],
    refreshed,
  );
});

test("ordinary and newly created single-file lists keep their TSV refresh form", (t) => {
  const directory = fixture(t, {
    plain: "# plain list\n# Source: old run\n1.0\tjob\n",
    times: "2.0\tjob\n3.0\tnew\n",
  });
  refresh(directory, "plain");
  assert.equal(
    readFileSync(join(directory, "plain"), "utf8"),
    "# plain list\n# Source: new run\n3.0\tnew\n2.0\tjob\n",
  );
  refresh(directory, "created");
  assert.deepEqual(
    [...readDurationList(join(directory, "created")).seconds],
    [
      ["new", 3],
      ["job", 2],
    ],
  );
});

test("unreadable, malformed, repeated, or nested parts fail before a partial duration map can be used", (t) => {
  const directory = fixture(t, {
    index: "# Include: part\n",
    part: "bad row\n",
  });
  const read = () => readDurationList(join(directory, "index"));
  assert.throws(read, /part:1: "bad row" is not <seconds><TAB><label>/);
  rmSync(join(directory, "part"));
  assert.throws(read, /part cannot be read \(ENOENT\)/);
  writeFileSync(join(directory, "part"), "# Include: index\n");
  assert.throws(read, /parts must contain rows only/);
  writeFileSync(join(directory, "index"), "# Include: part\n# Include: part\n");
  assert.throws(read, /repeats a duration-list part/);
});
