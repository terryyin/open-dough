# The updated install's callable gate, exercised in each physical skill root.
assert_installed_ci_reuse() {
  local skill=$1
  node --input-type=module - "${skill}" << 'EOF'
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
const skill = process.argv[2];
const policy = {
  repo: 'owner/project', workflow: 'ci.yml', unit: 'covered',
  configuration: 'checks-v1', context: 'inputs-v1', targetRef: 'main',
  refs: ['trusted'], events: ['push'], maxAgeMs: 60000,
};
const sha = 'a'.repeat(40);
let executions = 0;
const check = () => {
  execFileSync(process.execPath, ['-e', 'process.exit(0)']);
  executions += 1;
};
check();
const now = Date.now();
const source = { ...policy, sha, ref: 'trusted', event: 'push',
  runId: 'source:opaque', attemptId: 'attempt:opaque',
  url: 'https://ci.example/source', outcome: 'success', direct: true,
  current: true, order: now, validatedAt: now, validUntil: now + 60000,
};
const query = { complete: true, freshOverride: false, attempts: [source] };
const gate = (revision) => JSON.parse(execFileSync(process.execPath,
  [join(skill, 'scripts/ci-reuse-gate.mjs')], {
    input: JSON.stringify({ sha: revision, targetRef: 'main', policy, query }),
    encoding: 'utf8',
  }));
const hit = gate(sha);
if (!hit.reuse) check();
assert.equal(hit.source.runId, source.runId);
assert.equal(executions, 1);
const miss = gate('b'.repeat(40));
if (!miss.reuse) check();
assert.equal(miss.reuse, false);
assert.equal(executions, 2);
// Run the GitHub recipe command too: importing its default reader exercises
// every installed runtime dependency, even when unreadable policy falls back.
const temporary = mkdtempSync(join(tmpdir(), 'installed-ci-reuse-'));
try {
  const report = join(temporary, 'decision.json');
  execFileSync(process.execPath,
    [join(skill, 'scripts/ci-reuse-github-command.mjs'), join(temporary, 'missing-policy.json'), report]);
  assert.equal(JSON.parse(readFileSync(report)).reuse, false);
} finally { rmSync(temporary, { recursive: true, force: true }); }
EOF
}
