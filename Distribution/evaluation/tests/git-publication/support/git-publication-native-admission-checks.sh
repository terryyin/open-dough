#!/usr/bin/env bash
# Automated counterexamples; loaded only by test-side support.
# shellcheck disable=SC1091,SC2034,SC2154,SC2310,SC2311,SC2312,SC2329

run_admission_assessor_counterexamples() {
  local work
  work=$(mktemp -d)
  git_publication_suite_write_obs "${work}/investigation.txt" \
    'journey: admission-investigation' 'stream-status: complete' \
    'startup-cli-count: 1' 'admit-cli-observed: true' \
    'plain-start-observed: false' 'existing-receipt-observed: false' \
    'probe-after-claim: true' 'feature-exists: false' \
    'human-edit-preserved: true' 'remote-sha: claim' 'base-sha: base' \
    'taken-count: 1' 'identity: SEED-900#slow-start' 'claim-owned: true' \
    'claim-admitted: true' 'claim-parent-unlisted: true' \
    'story-in-claim: true' 'claim-count: 1' 'profile-count: 1' \
    'story-section-count: 1' 'approach: unselected' 'assessment: absent' \
    'product-change: false'
  git_publication_assess "${work}/investigation.txt"
  git_publication_suite_expect_pass 'admitted to remote Taken before'
  git_publication_admission_counterexamples "${work}/investigation.txt"
  native_assessor_rejects_field_rows << 'EOF'
startup-uninvoked startup-call startup-cli-count: 0 | native startup command
probe-before-claim probe-order probe-after-claim: false | investigation started before
not-admitted start-kind admit-cli-observed: false | investigation started before
fabricated-ready readiness assessment: ready | fabricated readiness
product-changed product-change product-change: true | changed the product
second-claim claim-count claim-count: 2 | exactly one owned claim
story-outside-claim story-in-claim story-in-claim: false | one claim commit
human-edit-changed human-edit human-edit-preserved: false | human edits
EOF
  sed -e 's/^journey: .*/journey: admission-continuation/' \
    -e 's/^plain-start-observed: .*/plain-start-observed: true/' \
    -e 's/^existing-receipt-observed: .*/existing-receipt-observed: true/' \
    -e 's/^feature-exists: .*/feature-exists: true/' \
    -e 's/^remote-sha: .*/remote-sha: base/' \
    -e 's/^approach: .*/approach: planned/' \
    -e 's/^assessment: .*/assessment: ready/' \
    "${work}/investigation.txt" > "${work}/continuation.txt"
  git_publication_assess "${work}/continuation.txt"
  git_publication_suite_expect_pass 'continued into implementation'
  git_publication_admission_counterexamples "${work}/continuation.txt"
  native_assessor_rejects_field_rows << 'EOF'
no-plain-start start-kind plain-start-observed: false | did not continue the claim
no-existing-receipt existing-receipt existing-receipt-observed: false | did not continue the claim
trunk-republished trunk-tip remote-sha: second | republished trunk
not-implemented feature feature-exists: false | did not implement
second-profile profile-count profile-count: 2 | exactly one owned claim
EOF
  run_admission_correction_counterexamples "${work}/investigation.txt"
  run_admission_closure_counterexamples "${work}/investigation.txt"
  rm -rf -- "${work}"
}

# Starts rejected cases of the admission assessor against passing observation
# $1.
git_publication_admission_counterexamples() {
  git_publication_suite_counterexamples "${git_publication_admission_assess_file}" "$1"
}
