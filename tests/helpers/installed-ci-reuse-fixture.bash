# The updated install's callable gate, exercised in each physical skill root.
assert_installed_ci_reuse() {
  local skill=$1
  node --input-type=module - "${skill}" << 'EOF'
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { pathToFileURL } from 'node:url';
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
  // Actual optional custom-provider scheduling and installed ciAdapter use.
  const script = join(skill, 'scripts/ci-reuse-custom-example.mjs');
  const state = join(temporary, 'provider.json');
  const jobPath = join(temporary, 'job.json');
  const counts = join(temporary, 'executions');
  const command = (kind) => [process.execPath, '-e',
    `require('node:fs').appendFileSync(${JSON.stringify(counts)}, ${JSON.stringify(kind + '\n')})`];
  const job = { repo: policy.repo, workflow: policy.workflow, ref: 'trusted',
    event: 'push', sha, runId: 'source:opaque', attemptId: 'source:try', policy,
    covered: command('covered'), targetOnly: command('target-only') };
  const schedule = (mode) => {
    writeFileSync(jobPath, JSON.stringify(job));
    return JSON.parse(execFileSync(process.execPath, [script, mode, state, jobPath],
      { cwd: temporary, encoding: 'utf8' }));
  };
  const direct = schedule('source');
  job.ref = 'main'; job.runId = 'target:own'; job.attemptId = 'target:try';
  const reused = schedule('target');
  assert.equal(reused.decision.reuse, true);
  assert.equal(reused.decision.source.runId, direct.attempt.runId);
  assert.notEqual(reused.attempt.runId, direct.attempt.runId);
  assert.equal(readFileSync(counts, 'utf8'), 'covered\ntarget-only\n');
  const targetReport = JSON.parse(readFileSync(new URL(reused.attempt.url)));
  assert.equal(targetReport.target.runId, reused.attempt.runId);
  assert.equal(targetReport.decision.source.context, policy.context);
  const adapter = [process.execPath, script, 'adapter', state];
  mkdirSync(join(temporary, '.planning'));
  writeFileSync(join(temporary, '.planning/open-dough.json'), JSON.stringify({ ciAdapter: adapter }));
  const { createCommandAcquisition } = await import(
    pathToFileURL(join(skill, 'scripts/ci-command-adapter.mjs')).href);
  const { readCiConfiguration } = await import(
    pathToFileURL(join(skill, 'scripts/ci-project-configuration.mjs')).href);
  const acquisition = createCommandAcquisition({ command: readCiConfiguration(temporary).adapter,
    repo: policy.repo, branch: 'main', root: temporary });
  const attempts = await acquisition.acquireRuns();
  assert.equal(attempts.length, 1);
  assert.equal(attempts[0].databaseId, reused.attempt.runId);
  job.sha = 'b'.repeat(40); job.runId = 'target:fresh';
  assert.equal(schedule('target').decision.reuse, false);
  delete job.policy; job.runId = 'target:legacy';
  assert.equal(schedule('target').decision.reason, 'invalid-policy');
  assert.equal(readFileSync(counts, 'utf8').split('\n').filter((line) => line === 'covered').length, 3);
  assert.equal(readFileSync(counts, 'utf8').split('\n').filter((line) => line === 'target-only').length, 3);
  // Repeated target SHA: its current failed aggregate replaces older success.
  job.runId = 'target:legacy'; job.attemptId = 'rerun:failed';
  job.covered = [process.execPath, '-e', 'process.exit(1)'];
  writeFileSync(jobPath, JSON.stringify(job));
  let failed;
  try {
    execFileSync(process.execPath, [script, 'target', state, jobPath], {cwd: temporary});
    assert.fail('failed covered command must exit nonzero');
  } catch (error) {
    assert.equal(error.status, 1);
    failed = JSON.parse(error.stdout);
  }
  const current = await acquisition.acquireRuns();
  const repeated = current.filter((attempt) => attempt.headSha === job.sha);
  assert.equal(repeated.length, 1);
  assert.equal(repeated[0].conclusion, 'failure');
  assert.equal(repeated[0].attempt, failed.attempt.attemptId);
  assert.equal(JSON.parse(readFileSync(new URL(reused.attempt.url))).target.outcome, 'success');
} finally { rmSync(temporary, { recursive: true, force: true }); }
EOF
}
