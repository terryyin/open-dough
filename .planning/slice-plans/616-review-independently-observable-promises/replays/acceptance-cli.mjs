// One-off structural replay evidence; run from the repository root.
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
const root = process.cwd();
const load = path => import(pathToFileURL(resolve(root, path)).href);
const { reviewed, sourceReview } = await load('Distribution/tests/skills/dough-execute-plan/story-obligations-test-fixtures.mjs');
const cli = await load('Distribution/tests/skills/dough-execute-plan/story-obligations-test-cli.mjs');
const evidence = resolve(root, '.planning/slice-plans/616-review-independently-observable-promises/replays');
const read = name => readFileSync(join(evidence, name), 'utf8');
const cleanups = [];
const harness = { after: callback => cleanups.push(callback) };
const log = (name, result) => { console.log(JSON.stringify({ name, result })); return result; };
const call = (op, plan, ...args) => log([op, ...args].join(' '), cli[op](plan, ...args));
const small = read('small.md').split('## Actual reviewer return\n')[1].split('## Private acceptance comparison')[0].trim();
const pronunciation = read('pronunciation-return.md');
const smallRows = [...small.matchAll(/^(\d+)\. ([\s\S]*?)(?=\n\n\d+\. |\n\nUnnumbered source context:)/gm)].map(m => [m[1], m[2].trim(), '', '']);
const pronunciationRows = pronunciation.split('\n').filter(line => /^\| P\d+ \|/.test(line)).map(line => {
  const cells = line.split('|').slice(1, -1).map(cell => cell.trim());
  return [cells[0], `${cells[1]} ${cells[2]}`, '', ''];
});
assert.equal(smallRows.length, 26);
assert.equal(pronunciationRows.length, 39);
const smallSource = read('small.md').split('Original source:\n')[1].split('\n```')[0];
const pronunciationSource = read('pronunciation-input.md').split('Original source:\n')[1];
function prepare(rows, story, context) {
  const fixture = reviewed(harness, rows, { example: { story } });
  const review = join(dirname(fixture.plan), 'source-review.md');
  const escaped = rows.map(row => row.map(cell => cell.replaceAll('|', '\\|')));
  writeFileSync(review, sourceReview(escaped) + '\n## Retained return context\n\n' + context);
  for (const [id] of rows) assert.equal(call('record', fixture.plan, '--commitment', id, '--slice', '1').ok, true);
  const listed = call('list', fixture.plan, '--slice', '1');
  assert.deepEqual(listed.commitments.map(({ id, text }) => [id, text]), rows.map(([id, text]) => [id, text]));
  return { ...fixture, review };
}
try {
  const s = prepare(smallRows, smallSource, small.split('\n\n1.')[0] + '\n\n' + small.split('Unnumbered source context:')[1]);
  for (const [id] of smallRows) if (id !== '2') call('record', s.plan, '--commitment', id, '--observed', 'fixture-only retained observation marker; no archived product proof');
  cli.refusesCommitment(call('check', s.plan, '--slice', '1'), 'unobserved-commitment', '2');
  call('record', s.plan, '--commitment', '2', '--observed', 'fixture-only typed-input observation marker under retained nonblank condition');
  assert.equal(call('check', s.plan, '--slice', '1').ok, true);
  assert.equal(call('check', s.plan, '--completion').ok, true);
  writeFileSync(join(evidence, 'acceptance-small-record.md'), readFileSync(s.review));
  const p = prepare(pronunciationRows, pronunciationSource, pronunciation.split('\n\n| ID')[0] + '\n\n' + pronunciation.split('Unnumbered source context retained:')[1]);
  for (const [id] of pronunciationRows) if (id !== 'P11') call('record', p.plan, '--commitment', id, '--observed', 'fixture-only retained observation marker; no archived product proof');
  cli.refusesCommitment(call('check', p.plan, '--slice', '1'), 'unobserved-commitment', 'P11');
  // Deliberately insufficient evidence: the CLI checks presence, not semantics.
  call('record', p.plan, '--commitment', 'P11', '--observed', 'fixture-only standalone て hidden; no observation inside 挙げて');
  assert.equal(call('check', p.plan, '--slice', '1').ok, true);
  assert.ok(pronunciationRows.find(([id]) => id === 'P11')[1].includes('inside `挙げて`'));
  console.log('GAP: standalone-only marker passes structural CLI but cannot prove P11 inside-word condition. Acceptance must reject this semantic gap.');
  const clause = pronunciationSource.match(/A one-kana reading[\s\S]*?boundary\./)[0];
  call('record', p.plan, '--commitment', 'P11', '--slice', '', '--obligation', 'G11', '--entry-id', 'G11', '--title', 'Inside-word observation missing', '--reported', 'Fixture-only replay withholds observation of て inside 挙げて', '--reported-slice', '1', '--story-clause', clause, '--disposition', 'receiving slice 2');
  assert.equal(call('check', p.plan, '--slice', '1').ok, true);
  const receiving = call('list', p.plan, '--slice', '2');
  assert.equal(receiving.entries[0].id, 'G11');
  assert.equal(call('check', p.plan, '--completion').ok, false);
  writeFileSync(join(evidence, 'acceptance-pronunciation-record.md'), readFileSync(p.review));
  const returned = read('lifecycle-return.md');
  const row = [['1', returned.split('\n\nUnnumbered')[0].replace(/^1\. /, '').replaceAll(/\s+/g, ' '), '', '']];
  const l = reviewed(harness, row, { example: { story: read('lifecycle-source.md') } });
  call('record', l.plan, '--commitment', '1', '--lifecycle', 'target CI');
  for (const operation of ['list', 'check']) {
    const result = call(operation, l.plan, '--slice', '1');
    assert.equal(result.ok, true);
    if (operation === 'list') assert.deepEqual(result.commitments, []);
    else assert.deepEqual(result.pendingLifecycle, [{ id: '1', text: row[0][1].replaceAll(/\s+/g, ' ').trim(), owner: 'target CI' }]);
  }
  const finalCheck = call('check', l.plan, '--completion');
  assert.equal(finalCheck.pendingLifecycle.length, 1);
  const before = readFileSync(join(dirname(l.plan), 'source-review.md'), 'utf8');
  assert.ok(before.includes('| target CI |  |'));
  assert.equal(call('record', l.plan, '--commitment', '1', '--observed', 'branch CI passed').ok, false);
  assert.equal(readFileSync(join(dirname(l.plan), 'source-review.md'), 'utf8'), before);
  writeFileSync(join(evidence, 'acceptance-lifecycle-record.md'), before + '\n## Retained return context\n\n' + returned.split('Unnumbered source context:')[1]);
  console.log('PASS: all 26 + 39 + 1 returned ids retained; structural refusal, acceptance, semantic-gap and lifecycle assertions passed.');
} finally {
  for (const cleanup of cleanups.reverse()) cleanup();
}
