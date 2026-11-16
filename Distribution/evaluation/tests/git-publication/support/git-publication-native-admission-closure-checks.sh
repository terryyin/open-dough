#!/usr/bin/env bash
# Automated counterexamples; loaded only by test-side support.
# shellcheck disable=SC1091,SC2034,SC2154,SC2310,SC2311,SC2312,SC2329

# $1 holds passing investigation observations to derive the closure's from.
run_admission_closure_counterexamples() {
  local base=$1 work
  work=$(dirname -- "${base}")
  sed -e 's/^journey: .*/journey: admission-closure/' \
    -e 's/^identity: .*/identity: /' \
    -e 's/^taken-count: .*/taken-count: 1/' \
    "${base}" > "${work}/closure.txt"
  printf '%s\n' 'base-ancestor: true' 'identity-listed: false' \
    'identity-profiles: 0' 'home-present: false' 'others-preserved: true' \
    >> "${work}/closure.txt"
  git_publication_assess "${work}/closure.txt"
  git_publication_suite_expect_pass 'no-change investigation closed'
  git_publication_admission_counterexamples "${work}/closure.txt"
  native_assessor_rejects_field_rows << 'EOF'
stream-incomplete stream stream-status: incomplete | did not complete its stream
human-edit-changed human-edit human-edit-preserved: false | human edits
history-rewritten trunk-kept base-ancestor: false | rewrote or removed other trunk content
others-removed trunk-kept others-preserved: false | rewrote or removed other trunk content
entry-kept closed-entry identity-listed: true | still holds the closed investigation
profile-kept closed-profile identity-profiles: 1 | still holds the closed investigation
home-kept closed-home home-present: true | still holds the closed investigation
product-changed product-change product-change: true | changed the product
feature-created feature feature-exists: true | changed the product
EOF
}
