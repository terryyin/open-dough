#!/usr/bin/env bash
# Reconstructed aggregate-text shape, not a historical application rerun.

delivery_evidence_aggregate_write_baseline() {
  local workspace=$1
  mkdir -p -- "${workspace}/lib" "${workspace}/tests" "${workspace}/e2e" "${workspace}/.planning"
  cat > "${workspace}/lib/page.mjs" << 'JS'
export function renderPage({ membership = 'Member: Ada' } = {}) {
  return `<main><section aria-label="Membership">${membership}</section><aside><h2>Recently done</h2><p>Archived session</p><h2>Running sessions</h2><p>Local session</p></aside></main>`;
}
JS
  cat > "${workspace}/tests/page.test.mjs" << 'JS'
import test from 'node:test';
import assert from 'node:assert/strict';
import { renderPage } from '../lib/page.mjs';
test('page includes both session sections', () => {
  const page = renderPage();
  assert.match(page, /<h2>Recently done<\/h2>/);
  assert.match(page, /<h2>Running sessions<\/h2>/);
});
JS
  cat > "${workspace}/e2e/membership.test.mjs" << 'JS'
import test from 'node:test';
import assert from 'node:assert/strict';
import { renderPage } from '../lib/page.mjs';
const claimsBeyondMembership = /\b(running|completed|live)\b/i;
function membershipText(page) {
  return page.replace(/<[^>]*>/g, ' ').split('Recently done')[0];
}
test('membership makes no live or completion claim', () => {
  assert.doesNotMatch(membershipText(renderPage()), claimsBeyondMembership);
});
test('membership observation rejects actual live and completion claims', () => {
  for (const claim of ['running', 'completed', 'live']) {
    assert.match(membershipText(renderPage({ membership: `Ada: ${claim}` })), claimsBeyondMembership);
  }
});
JS
  cat > "${workspace}/README.md" << 'MD'
# Session page

`lib/page.mjs` renders a membership section and a local-session sidebar.
Membership says who belongs; it makes no live or completion claim about that
member. Local sessions have their own running and archived sections.

Run the focused page tests with `node --test tests/page.test.mjs`.
Run the repository suite with `node --test tests/*.test.mjs e2e/*.test.mjs`.
There are no dependencies or build steps. Failed affected proof prevents delivery.
MD
}

delivery_evidence_aggregate_write_reorder() {
  node --input-type=module - "$1/lib/page.mjs" << 'JS'
import { readFileSync, writeFileSync } from 'node:fs';
const path = process.argv[2];
writeFileSync(path, readFileSync(path, 'utf8').replace('<h2>Recently done</h2><p>Archived session</p><h2>Running sessions</h2><p>Local session</p>', '<h2>Running sessions</h2><p>Local session</p><h2>Recently done</h2><p>Archived session</p>'));
JS
}

delivery_evidence_aggregate_write_correction() {
  node --input-type=module - "$1/e2e/membership.test.mjs" << 'JS'
import { readFileSync, writeFileSync } from 'node:fs';
const path = process.argv[2];
writeFileSync(path, readFileSync(path, 'utf8').replace("page.replace(/<[^>]*>/g, ' ').split('Recently done')[0]", "page.match(/<section aria-label=\"Membership\">(.*?)<\\/section>/s)[1].replace(/<[^>]*>/g, ' ')"));
JS
}

delivery_evidence_aggregate_populate_fixture() {
  delivery_evidence_aggregate_write_baseline "$1"
  delivery_evidence_git "$1" add lib tests e2e README.md
  delivery_evidence_git "$1" commit --quiet -m 'baseline membership and session page'
}
