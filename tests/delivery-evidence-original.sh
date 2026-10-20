#!/usr/bin/env bash
# Credential-free product discriminator and assessor counterexamples. This is
# controlled fixture proof; it makes no claim about native agent follow-through.
# shellcheck disable=SC1091,SC2034,SC2154
set -euo pipefail
source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)
source "${source_dir}/tests/support/native-assessor-counterexample.sh"
source "${source_dir}/tests/support/delivery-evidence-native-run.sh"
root=$(mktemp -d)
trap 'rm -rf -- "${root}"' EXIT
delivery_evidence_create_fixture original "${source_dir}" claude narrowed "${root}" \
  > "${root}/fixture.txt" 2>&1
workspace=${delivery_evidence_workspace}
cmp "${source_dir}/tests/fixtures/delivery-evidence/readiness-original-story.md" \
  "${workspace}/.planning/seeds/SEED-138-computed-execution-readiness.md"
(cd "${workspace}" && node --test tests/readiness.test.mjs) > "${root}/narrowed.txt" 2>&1
delivery_evidence_original_product_observation "${workspace}" > "${root}/narrowed.json"
node --input-type=module - "${root}/narrowed.json" << 'JS'
import fs from 'node:fs';
import assert from 'node:assert/strict';
const view = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
assert.equal(view.current.supplierResolved.changedSinceReview, false);
assert.equal(view.legacy.unchanged.changedSinceReview, false);
assert.equal(view.legacy.supplierResolved.changedSinceReview, true);
assert.deepEqual(view.legacy.supplierResolved.labels, ['Changed since readiness review']);
assert.equal(view.legacy.supplierResolved.startEligibility, 'eligible');
assert.equal(view.legacy.goalEdited.changedSinceReview, true);
JS
# The complete corrected control aligns product, proof and plan with the source.
# Historical narrowed inputs above stay unchanged.
delivery_evidence_create_fixture original "${source_dir}" claude corrected "${root}" \
  > "${root}/corrected-fixture.txt" 2>&1
workspace=${delivery_evidence_workspace}
cmp "${source_dir}/tests/fixtures/delivery-evidence/readiness-original-story.md" \
  "${workspace}/.planning/seeds/SEED-138-computed-execution-readiness.md"
(cd "${workspace}" && node --test tests/readiness.test.mjs) > "${root}/corrected.txt" 2>&1
delivery_evidence_original_product_observation "${workspace}" > "${root}/corrected.json"
node --input-type=module - "${root}/corrected.json" << 'JS'
import fs from 'node:fs';
import assert from 'node:assert/strict';
const view = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
assert.equal(view.legacy.supplierResolved.changedSinceReview, false);
assert.deepEqual(view.legacy.supplierResolved.labels, []);
assert.equal(view.legacy.supplierResolved.startEligibility, 'eligible');
assert.equal(view.legacy.goalEdited.changedSinceReview, true);
JS
run_delivery_evidence_original_assessor_counterexamples
