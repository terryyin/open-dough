#!/usr/bin/env bash
# Retain host-attributed operations and actual product results for explicit
# review. No string recognizer judges whether the original promise was found.
# shellcheck disable=SC2154,SC2312

delivery_evidence_original_product_observation() {
  local workspace=$1
  (
    cd -- "${workspace}" || exit
    node --input-type=module << 'JS'
import { reviewStory, readinessView } from './lib/readiness.mjs';
import { waitingStory, resolved } from './tests/readiness-fixture.mjs';
const story = waitingStory();
const observations = {};
for (const format of ['current', 'legacy']) {
  const review = reviewStory(story, format);
  observations[format] = {
    unchanged: readinessView(review, story),
    supplierResolved: readinessView(review, resolved(story)),
    goalEdited: readinessView(review, { ...story, goal: 'Edited goal.' }),
  };
}
console.log(JSON.stringify(observations, null, 2));
JS
  )
}

delivery_evidence_original_observe() {
  local scenario=$1 workspace=$2 response=$3 transcript=$4
  local evidence_root product_status=0 proof_status=0
  evidence_root=$(dirname -- "${transcript}")
  native_host_stream "${native_case_host}" "${transcript}" calls \
    > "${evidence_root}/command-results.jsonl"
  native_host_stream "${native_case_host}" "${transcript}" reads \
    > "${evidence_root}/file-reads.jsonl"
  git -C "${workspace}" diff > "${evidence_root}/final-product.diff"
  delivery_evidence_original_product_observation "${workspace}" \
    > "${evidence_root}/product-observation.json" \
    2> "${evidence_root}/product-observation.stderr" || product_status=$?
  (cd -- "${workspace}" && node --test tests/readiness.test.mjs) \
    > "${evidence_root}/final-proof.txt" 2>&1 || proof_status=$?
  printf 'scenario: %s\n' "${scenario}"
  printf 'judgment: review-required\n'
  printf 'product-observation-status: %s\n' "${product_status}"
  printf 'focused-proof-status: %s\n' "${proof_status}"
  printf 'review-complete: false\n'
  printf 'harness-inspected: %s\n' "$(native_harness_inspected 'tests/support/delivery-evidence-.*-native|native harness source' "${transcript}" "${response}")"
}

delivery_evidence_original_retain_review_artifacts() {
  local file
  for file in product-observation.json product-observation.stderr final-proof.txt; do
    native_result_copy_if_present "${delivery_evidence_root}/${file}" "${file}"
  done
  cp -R -- "${delivery_evidence_root}/original-inputs" "${native_result_attempt_dir}/"
  mkdir -p -- "${native_result_attempt_dir}/final-product"
  cp -R -- "${delivery_evidence_workspace}/.planning" \
    "${delivery_evidence_workspace}/lib" "${delivery_evidence_workspace}/tests" \
    "${native_result_attempt_dir}/final-product/"
}
