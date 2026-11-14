# Reads a custom attempt's proof through each installed root's real reader.
# shellcheck disable=SC2154 # source_dir is supplied by the sourcing test.
assert_installed_ci_proof() {
  local root=$1
  node --input-type=module - "${root}" "${source_dir}/Distribution/tests/support/makeMe.mjs" << 'EOF'
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
const [root, factory] = process.argv.slice(2);
const { makeMe } = await import(pathToFileURL(factory));
const { readCiAdapterSummary } = await import(pathToFileURL(
  join(root, 'dough-test-optimization/scripts/ci-proof-read.mjs')));
const repository = 'owner/installed-project';
const attempt = { runId: 'build:installed', attemptId: 'try:2',
  revision: 'a'.repeat(40), branch: 'main' };
const summary = makeMe.aCiProofSummary.inRepository(repository)
  .ofAdapterAttempt(attempt).please();
const temporary = mkdtempSync(join(tmpdir(), 'installed-ci-proof-'));
try {
  const request = join(temporary, 'request.json');
  const adapter = [process.execPath, '-e', `
    const fs = require('node:fs');
    let input = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', chunk => input += chunk);
    process.stdin.on('end', () => {
      fs.writeFileSync(process.argv[1], input);
      process.stdout.write(JSON.stringify({ summary: JSON.parse(process.argv[2]) }));
    });
  `, request, JSON.stringify(summary)];
  const result = await readCiAdapterSummary(adapter, repository, attempt,
    { cwd: temporary, signal: new AbortController().signal });
  assert.deepEqual(result, { summary });
  assert.deepEqual(JSON.parse(readFileSync(request, 'utf8')), {
    operation: 'proof', check: { repo: repository, branch: attempt.branch },
    attempt: { runId: attempt.runId, attemptId: attempt.attemptId, sha: attempt.revision },
  });
} finally { rmSync(temporary, { recursive: true, force: true }); }
EOF
}
