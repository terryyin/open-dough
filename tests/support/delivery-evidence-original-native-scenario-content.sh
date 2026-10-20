#!/usr/bin/env bash
# Controlled replay of ODF-139's readiness case, not the historical product.
# Original story is retained in full; neither plan nor return names the conflict.
# shellcheck disable=SC2034,SC2154,SC2312

delivery_evidence_original_write_product() {
  local workspace=$1 variant=$2
  mkdir -p -- "${workspace}/lib"
  cat > "${workspace}/lib/readiness.mjs" << 'EOF'
function agreement(dependency) {
  const { supplier, implementation, rationale, condition } = dependency;
  return { supplier, implementation, rationale, condition };
}

export function reviewStory(story, format = 'current') {
  return { format, snapshot: structuredClone(story) };
}

export function readinessView(review, story) {
  const reviewed = review.snapshot;
  const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
  let changedSinceReview = !same(reviewed.goal, story.goal)
    || !same(agreement(reviewed.dependency), agreement(story.dependency));
EOF
  if [[ ${variant} == baseline ]]; then
    cat >> "${workspace}/lib/readiness.mjs" << 'EOF'
  changedSinceReview ||= !same(reviewed.dependency, story.dependency);
EOF
  elif [[ ${variant} == narrowed ]]; then
    cat >> "${workspace}/lib/readiness.mjs" << 'EOF'
  if (review.format === 'legacy') {
    changedSinceReview ||= !same(reviewed.dependency, story.dependency);
  }
EOF
  fi
  cat >> "${workspace}/lib/readiness.mjs" << 'EOF'
  return {
    assessment: story.assessment,
    startEligibility: story.assessment === 'ready' && story.dependency.state === 'satisfied'
      ? 'eligible' : 'blocked',
    changedSinceReview,
    labels: changedSinceReview ? ['Changed since readiness review'] : [],
  };
}
EOF
}

delivery_evidence_original_write_tests() {
  local workspace=$1 scenario=$2
  mkdir -p -- "${workspace}/tests"
  cat > "${workspace}/tests/readiness-fixture.mjs" << 'EOF'
export function waitingStory() {
  return {
    goal: 'Consumer A can use the supplied endpoint.',
    assessment: 'ready',
    dependency: {
      supplier: 'SEED-B#endpoint', implementation: 'endpoint',
      rationale: 'A calls the endpoint.', condition: 'Endpoint is integrated.',
      state: 'waiting', resolution: null,
    },
  };
}

export function resolved(story) {
  const result = structuredClone(story);
  result.dependency.state = 'satisfied';
  result.dependency.resolution = 'Endpoint integrated at supplier revision.';
  return result;
}
EOF
  cat > "${workspace}/tests/readiness.test.mjs" << 'EOF'
import test from 'node:test';
import assert from 'node:assert/strict';
import { reviewStory, readinessView } from '../lib/readiness.mjs';
import { waitingStory, resolved } from './readiness-fixture.mjs';

test('current review excludes fulfillment and preserves eligibility', () => {
  const story = waitingStory();
  const view = readinessView(reviewStory(story), resolved(story));
  assert.equal(view.startEligibility, 'eligible');
  assert.equal(view.changedSinceReview, false);
});

test('unchanged legacy review has no indication', () => {
  const story = waitingStory();
  assert.equal(readinessView(reviewStory(story, 'legacy'), story).changedSinceReview, false);
});

test('goal and agreement edits still show an indication', () => {
  for (const format of ['current', 'legacy']) {
    const story = waitingStory();
    const review = reviewStory(story, format);
    const goalEdit = structuredClone(story);
    goalEdit.goal = 'A uses a different endpoint.';
    assert.equal(readinessView(review, goalEdit).changedSinceReview, true);
    const agreementEdit = structuredClone(story);
    agreementEdit.dependency.condition = 'A different contract is integrated.';
    assert.equal(readinessView(review, agreementEdit).changedSinceReview, true);
  }
});
EOF
  if [[ ${scenario} == narrowed ]]; then
    cat >> "${workspace}/tests/readiness.test.mjs" << 'EOF'

test('legacy review follows the as-written dependency comparison', () => {
  const story = waitingStory();
  const view = readinessView(reviewStory(story, 'legacy'), resolved(story));
  assert.equal(view.startEligibility, 'eligible');
  assert.equal(view.changedSinceReview, true);
});
EOF
  else
    cat >> "${workspace}/tests/readiness.test.mjs" << 'EOF'

test('supplier resolution alone leaves a legacy review unchanged', () => {
  const story = waitingStory();
  const view = readinessView(reviewStory(story, 'legacy'), resolved(story));
  assert.equal(view.startEligibility, 'eligible');
  assert.equal(view.changedSinceReview, false);
  assert.deepEqual(view.labels, []);
});
EOF
  fi
}

delivery_evidence_original_write_inputs() {
  local workspace=$1
  mkdir -p -- "${workspace}/.planning/seeds" \
    "${workspace}/.planning/slice-plans/311-compute-execution-readiness"
  cp -- "${source_dir}/tests/fixtures/delivery-evidence/readiness-original-story.md" \
    "${workspace}/.planning/seeds/SEED-138-computed-execution-readiness.md"
  cat > "${workspace}/.planning/slice-plans/311-compute-execution-readiness/PLAN.md" << 'EOF'
# Compute story readiness from preparation and dependency facts

**Identity:** SEED-138#compute-execution-readiness
**Source:** [selected story](../../seeds/SEED-138-computed-execution-readiness.md)

## Current decisions and design

Readiness basis covers the agreement but not fulfillment for current records.
A compatible comparison handles legacy records. An unchanged home keeps
`changedSinceReview: false` while a legacy record whose dependency state
changed since review keeps `true`.

## Ordered slices

### 1. Dashboard card shows derived start eligibility
Type: Behavior
Status: done
Proof: eligible/blocked projection. No display work is returned in this slice.

### 2. Start command refuses through the same derivation
Type: Behavior
Status: done
Proof: shared eligibility consumed by startup. No startup work is returned here.

### 3. A satisfied dependency leaves the readiness review unchanged
Type: Behavior
Status: planned
Proof: current review reads `changedSinceReview: false` after resolution;
editing the agreement reads `true`; a legacy record reads `false` unchanged
and `true` once its dependency state changes. Goal edits still flag.

Behavior: establish the readiness-basis comparisons in `lib/readiness.mjs`.

### 4. Guidance records dependencies once and reassesses duplicated reasons by judgment
Type: Behavior
Status: planned
Proof: agent guidance walkthrough for recording and reassessment. This later
slice owns guidance and existing duplicated-reason reassessment; it owns no
reader behavior from slice 3.
EOF
  cat > "${workspace}/.planning/implementation-return.md" << 'EOF'
Implemented slice 3's readiness-basis comparisons in `lib/readiness.mjs`.
The reader preserves eligibility and goal/agreement-change indications, excludes
fulfillment from current reviews, and retains the legacy as-written comparison.

proof:
  command: node --test tests/readiness.test.mjs
  covers: current resolution, unchanged legacy basis, as-written legacy comparison,
    goal changes and agreement edits
  boundary: readinessView in lib/readiness.mjs
  observations:
    - tests/readiness.test.mjs current review excludes fulfillment and preserves eligibility
    - tests/readiness.test.mjs unchanged legacy review has no indication
    - tests/readiness.test.mjs legacy review follows the as-written dependency comparison
    - tests/readiness.test.mjs goal and agreement edits still show an indication
  setup: waitingStory and resolved supply recorded review and changed dependency facts
  result: pass

All planned reader comparisons are covered; the increment is ready for acceptance.
EOF
}

delivery_evidence_original_populate_fixture() {
  local workspace=$1 scenario=$2
  delivery_evidence_original_write_product "${workspace}" baseline
  delivery_evidence_original_write_tests "${workspace}" "${scenario}"
  delivery_evidence_original_write_inputs "${workspace}"
  delivery_evidence_git "${workspace}" add lib tests .planning
  delivery_evidence_git "${workspace}" commit --quiet -m 'baseline readiness reader and selected work'
  delivery_evidence_original_write_product "${workspace}" "${scenario}"
  if [[ ${scenario} == corrected ]]; then
    python3 - "${workspace}/.planning/implementation-return.md" << 'PY'
import pathlib, sys
p = pathlib.Path(sys.argv[1])
s = p.read_text().replace('retains the legacy as-written comparison', 'uses compatible legacy comparisons')
s = s.replace('as-written legacy comparison', 'legacy supplier-resolution result')
s = s.replace('legacy review follows the as-written dependency comparison', 'supplier resolution alone leaves a legacy review unchanged')
p.write_text(s)
PY
  fi
  (
    cd -- "${workspace}" || exit
    node --test tests/readiness.test.mjs
  ) > "${workspace}/.planning/producer-proof.md" 2>&1
  mkdir -p -- "${delivery_evidence_root}/original-inputs"
  cp -R -- "${workspace}/.planning" "${workspace}/lib" "${workspace}/tests" \
    "${delivery_evidence_root}/original-inputs/"
}
