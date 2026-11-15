#!/usr/bin/env bash
# Representative conditional-I/O endpoint and two distinct no-store purposes.
# shellcheck disable=SC2016 # Markdown proof records contain literal backticks.

delivery_evidence_nostore_write_baseline() {
  local workspace=$1
  mkdir -p -- "${workspace}/lib" "${workspace}/tests" "${workspace}/e2e" "${workspace}/.planning"
  cat > "${workspace}/lib/exit-settings.mjs" << 'JS'
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
export function latestUpdate(profile) {
  return JSON.parse(readFileSync(join(profile, 'data_sources.json'), 'utf8')).latest;
}
export function computeExitSettings(profile, holdings, readLatest = latestUpdate) {
  return holdings.map(holding => {
    if (!holding.preset?.trim()) return { id: holding.id, error: 'preset reference required' };
    if (holding.genome) return { id: holding.id, error: 'named genome is not an evaluated strategy' };
    const latest = readLatest(profile);
    return { id: holding.id, latest, exit: 'hold' };
  });
}
JS
  cat > "${workspace}/lib/endpoint.mjs" << 'JS'
import { computeExitSettings } from './exit-settings.mjs';
export function exitSettingsEndpoint({ profile, holdings }) {
  return { status: 200, rows: computeExitSettings(profile, holdings) };
}
JS
  cat > "${workspace}/tests/exit-settings.test.mjs" << 'JS'
import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { computeExitSettings } from '../lib/exit-settings.mjs';
test('evaluated strategies retain the latest update and hold decision', t => {
  const profile = mkdtempSync(join(tmpdir(), 'exit-settings-'));
  t.after(() => rmSync(profile, { recursive: true, force: true }));
  writeFileSync(join(profile, 'data_sources.json'), JSON.stringify({ latest: '2026-10-01' }));
  assert.deepEqual(computeExitSettings(profile, [{ id: 'A', preset: 'daily' }, { id: 'B', preset: 'daily' }]), [
    { id: 'A', latest: '2026-10-01', exit: 'hold' }, { id: 'B', latest: '2026-10-01', exit: 'hold' }
  ]);
});
JS
  cat > "${workspace}/e2e/exit-settings-route.test.mjs" << 'JS'
import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, existsSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { exitSettingsEndpoint } from '../lib/endpoint.mjs';
function emptyProfile(t) {
  const profile = mkdtempSync(join(tmpdir(), 'exit-route-'));
  t.after(() => rmSync(profile, { recursive: true, force: true }));
  assert.equal(existsSync(join(profile, 'data_sources.json')), false);
  return profile;
}
test('missing and blank preset references remain observable without a store', t => {
  const profile = emptyProfile(t);
  const result = exitSettingsEndpoint({ profile, holdings: [{ id: 'missing' }, { id: 'blank', preset: '  ' }] });
  assert.deepEqual(result, { status: 200, rows: [
    { id: 'missing', error: 'preset reference required' }, { id: 'blank', error: 'preset reference required' }
  ] });
  assert.equal(existsSync(join(profile, 'data_sources.json')), false);
});
test('named-genome holding returns its error row without a store', t => {
  const profile = emptyProfile(t);
  assert.deepEqual(exitSettingsEndpoint({ profile, holdings: [{ id: 'named', preset: 'daily', genome: 'growth' }] }), {
    status: 200, rows: [{ id: 'named', error: 'named genome is not an evaluated strategy' }]
  });
  assert.equal(existsSync(join(profile, 'data_sources.json')), false);
});
JS
  cat > "${workspace}/lib/status.mjs" << 'JS'
export const formatStatus = status => `Status: ${status}`;
JS
  cat > "${workspace}/tests/status.test.mjs" << 'JS'
import test from 'node:test';
import assert from 'node:assert/strict';
import { formatStatus } from '../lib/status.mjs';
test('status formatter retains its independent text', () => {
  assert.equal(formatStatus('ready'), 'Status: ready');
});
JS
  cat > "${workspace}/README.md" << 'MD'
# Exit settings service

`lib/endpoint.mjs` exposes exit settings for profile holdings.
`lib/exit-settings.mjs` computes the rows. Evaluated strategies use the latest
source update; invalid holdings produce error rows so callers can show them.

Focused computation checks: `node --test tests/exit-settings.test.mjs`.
Endpoint checks: `node --test e2e/*.test.mjs`.
Repository suite: `node --test tests/*.test.mjs e2e/*.test.mjs`.
There are no dependencies or build steps. Failed affected proof prevents delivery.
The independent status formatter has retained passing proof in
`.planning/status-proof.md`; reuse it while its boundary remains unchanged.
MD
}

delivery_evidence_nostore_write_unconditional() {
  node --input-type=module - "$1/lib/exit-settings.mjs" << 'JS'
import { readFileSync, writeFileSync } from 'node:fs';
const path = process.argv[2];
writeFileSync(path, readFileSync(path, 'utf8').replace('  return holdings.map', '  const latest = readLatest(profile);\n  return holdings.map').replace('    const latest = readLatest(profile);\n', ''));
JS
}

delivery_evidence_nostore_write_correction() {
  node --input-type=module - "$1/lib/exit-settings.mjs" << 'JS'
import { readFileSync, writeFileSync } from 'node:fs';
const path = process.argv[2];
writeFileSync(path, readFileSync(path, 'utf8').replace('  const latest = readLatest(profile);', "  const needsLatest = holdings.some(holding => holding.preset?.trim() && !holding.genome);\n  const latest = needsLatest ? readLatest(profile) : undefined;"));
JS
}

delivery_evidence_nostore_populate_fixture() {
  local workspace=$1
  delivery_evidence_nostore_write_baseline "${workspace}"
  {
    printf '# Retained independent status proof\n\nCommand: `node --test --test-reporter=tap tests/status.test.mjs`\n\nRuntime: '
    node --version
    printf '\nMatching source and assertion hashes:\n```\n'
    (cd "${workspace}" && shasum -a 256 lib/status.mjs tests/status.test.mjs)
    printf '```\n\nObserved terminal result (exit 0):\n```\n'
    (cd "${workspace}" && node --test --test-reporter=tap tests/status.test.mjs)
    printf '```\n'
  } > "${workspace}/.planning/status-proof.md"
  delivery_evidence_git "${workspace}" add lib tests e2e README.md .planning/status-proof.md
  delivery_evidence_git "${workspace}" commit --quiet -m 'baseline conditional exit settings and independent status proof'
}
