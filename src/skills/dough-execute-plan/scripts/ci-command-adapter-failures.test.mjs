import assert from "node:assert/strict";
import {
  chmodSync,
  mkdirSync,
  mkdtempSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { diagnosticExcerptBytes } from "./ci-command-adapter.mjs";
import { watchCiExecution } from "./watch-ci.mjs";

const checkedSha = "d".repeat(40);

function failureFixture(t) {
  const root = mkdtempSync(join(tmpdir(), "ci-command-failure-test-"));
  const planning = join(root, ".planning");
  const bin = join(root, "bin");
  mkdirSync(planning);
  mkdirSync(bin);
  const log = join(root, "ci.log");
  const adapter = join(bin, "adapter.mjs");
  writeFileSync(
    log,
    [
      ...Array.from(Array(4000).keys(), (index) => `noise ${index}`),
      "ERROR known semantic failure",
      ...Array.from(Array(2000).keys(), (index) => `ERROR related ${index}`),
    ].join("\n"),
  );
  writeFileSync(
    adapter,
    `#!${process.execPath}
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
let input = '';
for await (const chunk of process.stdin) input += chunk;
const request = JSON.parse(input);
const countPath = ${JSON.stringify(join(root, "discover-count"))};
if (request.operation === 'discover') {
  const count = existsSync(countPath) ? Number(readFileSync(countPath, 'utf8')) + 1 : 1;
  writeFileSync(countPath, String(count));
  const attemptId = count < 3 ? 'attempt/repeated' : 'attempt:distinct';
  process.stdout.write(JSON.stringify({ attempts: [{ runId: 'run:opaque', attemptId, sha: ${JSON.stringify(checkedSha)}, outcome: 'failure' }] }));
} else {
  const key = request.attempt.attemptId;
  if (key === 'attempt:distinct') {
    process.stdout.write(JSON.stringify({ unavailable: 'diagnostic endpoint returned no excerpt', rawLogs: 'must not escape' }));
  } else {
    const useful = readFileSync(${JSON.stringify(log)}, 'utf8').split('\\n').filter((line) => line.includes('ERROR')).join('\\n');
    process.stdout.write(JSON.stringify({ excerpt: useful, rawLogs: 'raw noise must not escape' }));
  }
}
`,
  );
  chmodSync(adapter, 0o700);
  writeFileSync(
    join(planning, "open-dough.json"),
    JSON.stringify({ ciAdapter: [process.execPath, adapter] }),
  );
  t.after(() => rmSync(root, { recursive: true, force: true }));
  return root;
}

test("custom failures deliver locally filtered bounded evidence once per attempt", async (t) => {
  const root = failureFixture(t);
  const controller = new AbortController();
  const events = [];
  let polls = 0;

  await watchCiExecution({
    repo: "owner/project",
    branch: "feature/custom",
    root,
    signal: controller.signal,
    emit: (event) => events.push(event),
    sleep: async () => {
      polls += 1;
      if (polls === 3) controller.abort();
    },
  });

  assert.equal(events.length, 2);
  assert.deepEqual(
    events.map(({ runId, attempt, sha }) => ({ runId, attempt, sha })),
    [
      { runId: "run:opaque", attempt: "attempt/repeated", sha: checkedSha },
      { runId: "run:opaque", attempt: "attempt:distinct", sha: checkedSha },
    ],
  );
  const [first, second] = events;
  assert.match(first.diagnostic.excerpt, /^ERROR known semantic failure/);
  assert.equal(
    Buffer.byteLength(first.diagnostic.excerpt),
    diagnosticExcerptBytes,
  );
  assert.equal(first.diagnostic.truncated, true);
  assert.equal(JSON.stringify(first).includes("noise 1"), false);
  assert.equal(JSON.stringify(first).includes("rawLogs"), false);
  assert.equal(
    JSON.stringify(first).includes("raw noise must not escape"),
    false,
  );
  assert.deepEqual(second.diagnostic, {
    unavailable: "diagnostic endpoint returned no excerpt",
    truncated: false,
  });
  assert.equal(JSON.stringify(second).includes("must not escape"), false);
});
