#!/usr/bin/env bash
# Automated counterexamples; loaded only by test-side support.
# shellcheck disable=SC1091,SC2034,SC2154,SC2310,SC2311,SC2312,SC2329

delivery_evidence_consumers_write_obs() {
  local path=$1
  shift
  {
    printf '%s\n' "$@"
  } > "${path}"
}

run_delivery_evidence_consumers_assessor_counterexamples() {
  local work
  work=$(mktemp -d)
  # shellcheck disable=SC2064
  trap "rm -rf -- '${work}'" RETURN

  # Naming the consumer gap without accepting the stale claim passes.
  # Accepting while the stand-in remains incompatible, or leaving the gap
  # unreturned, does not.
  delivery_evidence_consumers_write_obs "${work}/incomplete-gap.txt" \
    'scenario: changed-contract' \
    'promise-accepted: false' \
    'accepted-on-stale-exclusion: false' \
    'required-gap-returned: true' \
    'consumer-aligned: false' \
    'compat-assertion-present: false' \
    'compat-assertion-executed: false' \
    'unrelated-boundary-unchanged: true' \
    'unrelated-proof-retained: false' \
    'instruction-words-only: false'
  native_assessor_counterexamples "${source_dir}/Distribution/evaluation/cases/delivery-evidence/delivery-evidence-consumers-native-assess.sh" \
    "${work}/incomplete-gap.txt" -- delivery_evidence_consumers_assess
  native_assessor_rejects_field_rows << 'EOF'
accept-unaligned accepted promise-accepted: true
gap-unreturned required-gap required-gap-returned: false
EOF
  # Each required field, deleted alone, cannot pass.
  native_assessor_rejects_missing_fields << 'EOF'
required-gap required-gap-returned
consumer-aligned consumer-aligned
compat-present compat-assertion-present
compat-executed compat-assertion-executed
unrelated-boundary unrelated-boundary-unchanged
unrelated-proof unrelated-proof-retained
EOF

  # Accepting after aligning the stand-in and executing compatibility proof
  # passes; accepting solely on the stale unaffected-suite exclusion does not.
  delivery_evidence_consumers_write_obs "${work}/changed-corrected.txt" \
    'scenario: changed-contract' \
    'promise-accepted: true' \
    'accepted-on-stale-exclusion: false' \
    'required-gap-returned: true' \
    'consumer-aligned: true' \
    'compat-assertion-present: true' \
    'compat-assertion-executed: true' \
    'unrelated-boundary-unchanged: true' \
    'unrelated-proof-retained: false' \
    'instruction-words-only: false'
  native_assessor_counterexamples "${source_dir}/Distribution/evaluation/cases/delivery-evidence/delivery-evidence-consumers-native-assess.sh" \
    "${work}/changed-corrected.txt" -- delivery_evidence_consumers_assess
  native_assessor_rejects_fields stale-accept stale-exclusion \
    'accepted-on-stale-exclusion: true'

  # A corrected consumer with matching executed proof passes; without an
  # executed compatibility assertion, or on instruction words or a green exit
  # alone, it does not.
  delivery_evidence_consumers_write_obs "${work}/corrected.txt" \
    'scenario: corrected-consumer' \
    'promise-accepted: true' \
    'accepted-on-stale-exclusion: false' \
    'required-gap-returned: false' \
    'consumer-aligned: true' \
    'compat-assertion-present: true' \
    'compat-assertion-executed: true' \
    'unrelated-boundary-unchanged: true' \
    'unrelated-proof-retained: false' \
    'instruction-words-only: false'
  native_assessor_counterexamples "${source_dir}/Distribution/evaluation/cases/delivery-evidence/delivery-evidence-consumers-native-assess.sh" \
    "${work}/corrected.txt" -- delivery_evidence_consumers_assess
  native_assessor_rejects_field_rows << 'EOF'
corrected-no-exec compat-executed compat-assertion-executed: false
words-only instruction-words instruction-words-only: true
EOF

  # An unchanged unrelated boundary retains existing proof and passes.
  # Inventing incompleteness on it, or dropping its proof, does not. A
  # returned gap alone is no rejection: the observer reads any mention of a
  # consumer or compatibility as one, and this scenario does not judge it.
  delivery_evidence_consumers_write_obs "${work}/unchanged.txt" \
    'scenario: unchanged-boundary' \
    'promise-accepted: true' \
    'accepted-on-stale-exclusion: false' \
    'required-gap-returned: false' \
    'consumer-aligned: false' \
    'compat-assertion-present: false' \
    'compat-assertion-executed: false' \
    'unrelated-boundary-unchanged: true' \
    'unrelated-proof-retained: true' \
    'instruction-words-only: false'
  native_assessor_counterexamples "${source_dir}/Distribution/evaluation/cases/delivery-evidence/delivery-evidence-consumers-native-assess.sh" \
    "${work}/unchanged.txt" -- delivery_evidence_consumers_assess
  native_assessor_rejects_field_rows << 'EOF'
unchanged-unaccepted accepted promise-accepted: false
unchanged-proof-dropped unrelated-proof unrelated-proof-retained: false
EOF

  # Observer reads a status that opens its line, including a numbered item,
  # and a leading incomplete status still wins over later accepted words.
  # shellcheck disable=SC2016 # Backticks are literal outcome text.
  printf '%s\n' '1. **Accepted — `createCommand` requires `(context, releaseTag)`.**' \
    'The exclusion is stale and was not used.' > "${work}/outcome-leading.md"
  [[ $(delivery_evidence_consumers_promise_accepted \
    "${work}/outcome-leading.md" '') == true ]]
  printf '%s\n' '- **Accepted — Promise 1: Status badge labels remain text.**' \
    'No incomplete promises.' > "${work}/outcome-leading-badge.md"
  [[ $(delivery_evidence_consumers_promise_accepted \
    "${work}/outcome-leading-badge.md" '') == true ]]
  printf '%s\n' '1. **Incomplete — the E2E stand-in omits releaseTag.**' \
    'Producer evidence: accepted.' > "${work}/outcome-leading-incomplete.md"
  [[ $(delivery_evidence_consumers_promise_accepted \
    "${work}/outcome-leading-incomplete.md" '') == false ]]
}
