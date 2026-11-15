#!/usr/bin/env bash
# Automated counterexamples; loaded only by test-side support.
# shellcheck disable=SC1091,SC2034,SC2154,SC2310,SC2311,SC2312,SC2329

# $1 holds passing investigation observations to derive the correction's from.
run_admission_correction_counterexamples() {
  local base=$1 work
  work=$(dirname -- "${base}")
  sed -e 's/^journey: .*/journey: admission-correction/' \
    -e 's/^identity: .*/identity: SEED-R#order-notes/' \
    -e 's/^approach: .*/approach: planned/' \
    "${base}" > "${work}/correction.txt"
  printf '%s\n' 'story-plan: slice-plans/R/PLAN.md' 'entry-plan: slice-plans/R/PLAN.md' \
    'plan-in-claim: true' 'plan-home-count: 0' >> "${work}/correction.txt"
  git_publication_assess "${work}/correction.txt"
  git_publication_suite_expect_pass 'admitted once through its story'
  git_publication_admission_counterexamples "${work}/correction.txt"
  native_assessor_rejects_field_rows << 'EOF'
plan-listed plan-home plan-home-count: 1 | not admitted once through its story
entry-plan-missing entry-plan entry-plan: | not admitted once through its story
plan-outside-claim plan-in-claim plan-in-claim: false | not admitted once through its story
not-admitted start-kind admit-cli-observed: false | not admitted once through its story
product-changed product-change product-change: true | changed the product
second-story-section story-section story-section-count: 2 | exactly one owned claim
EOF
}
