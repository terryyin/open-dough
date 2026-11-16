#!/usr/bin/env bash
# Automated counterexamples; loaded only by test-side support.
# shellcheck disable=SC1091,SC2034,SC2154,SC2310,SC2311,SC2312,SC2329

# Observes SCENARIO CLAIMED INITIAL from the counterexample's workspace into
# the caller's obs and work/obs.txt.
delivery_evidence_selection_observe_counterexample() {
  obs=$(delivery_evidence_selection_observe "$1" "$2" "$3" "${ws}" \
    "${work}/response.md" "${work}/transcript.jsonl")
  printf '%s\n' "${obs}" > "${work}/obs.txt"
}

# Credential-free checks that observation derivation reads the status and
# selection an agent actually recorded, in the layouts native hosts produce.
run_delivery_evidence_selection_observer_counterexamples() {
  local work ws obs
  work=$(mktemp -d)
  # shellcheck disable=SC2064
  trap "rm -rf -- '${work}'" RETURN
  ws="${work}/workspace"
  mkdir -p -- "${ws}/.planning"
  : > "${work}/transcript.jsonl"
  : > "${work}/response.md"

  # Empty selection named incomplete in a heading.
  printf 'selected=0 pattern=merge direction exit=0\n' > "${ws}/.planning/selection.log"
  printf '%s\n' '## Promise 1 — Merge direction keeps order: INCOMPLETE' \
    > "${ws}/.planning/acceptance-outcome.md"
  delivery_evidence_selection_observe_counterexample zero-test 1 0
  grep -Fxq 'final-selected: 0' <<< "${obs}"
  grep -Fxq 'promises-accepted-count: 0' <<< "${obs}"
  grep -Fxq 'incomplete-named: true' <<< "${obs}"
  delivery_evidence_selection_assess "${work}/obs.txt"

  # Corrected filter adds the two unselected tests; bold "X: accepted" lines
  # count once even when the response repeats them as a table; an account of
  # "missing observations" that were obtained does not name a gap.
  printf '%s\n' \
    'selected=1 pattern=published overview exit=0 names=published overview renders the summary' \
    'selected=2 pattern=empty groups|initial read exit=0 names=empty groups stay empty;initial read failure surfaces' \
    > "${ws}/.planning/selection.log"
  printf '%s\n' \
    'I obtained the missing observations with a corrected selection.' \
    '1. **Published overview renders the summary: accepted.** Observation: selected.' \
    '2. **Empty groups stay empty on the overview: accepted, using the' \
    '3. **Initial read failure surfaces on the overview: accepted, using the' \
    > "${ws}/.planning/acceptance-outcome.md"
  printf '%s\n' '| 1. Summary | Accepted | ok |' '| 2. Empty | Accepted | ok |' \
    > "${work}/response.md"
  delivery_evidence_selection_observe_counterexample partial-selection 3 1
  grep -Fxq 'final-selected: 3' <<< "${obs}"
  grep -Fxq 'promises-accepted-count: 3' <<< "${obs}"
  grep -Fxq 'incomplete-named: false' <<< "${obs}"
  cp -- "${work}/obs.txt" "${work}/corrected.txt"
  native_assessor_counterexamples \
    "${delivery_evidence_support_dir}/delivery-evidence-selection-native-assess.sh" \
    "${work}/corrected.txt" -- delivery_evidence_selection_assess

  # Rerunning the same partial filter adds no distinct observation, so the
  # same outcome is no longer a full selection.
  printf '%s\n' \
    'selected=1 pattern=published overview exit=0 names=published overview renders the summary' \
    'selected=1 pattern=published overview exit=0 names=published overview renders the summary' \
    > "${ws}/.planning/selection.log"
  delivery_evidence_selection_observe_counterexample partial-selection 3 1
  grep -Fxq 'final-selected: 1' <<< "${obs}"
  native_assessor_rejects repeated-partial-filter final-selection "${work}/obs.txt"

  # Precise incomplete naming with "— **status**" lines.
  printf '%s\n' \
    '1. Summary — **accepted**' '2. Empty groups — **incomplete**' \
    '3. Initial read failure — **incomplete**' \
    > "${ws}/.planning/acceptance-outcome.md"
  delivery_evidence_selection_observe_counterexample partial-selection 3 1
  grep -Fxq 'promises-accepted-count: 1' <<< "${obs}"
  grep -Fxq 'incomplete-named: true' <<< "${obs}"
  delivery_evidence_selection_assess "${work}/obs.txt"

  # Complete selection recorded as a status table.
  printf 'selected=3 pattern=published overview exit=0\n' > "${ws}/.planning/selection.log"
  printf '%s\n' '| Promise | Status | Evidence inspected |' '| --- | --- | --- |' \
    '| 1. Summary | accepted | selected, pass |' \
    '| 2. Empty groups | accepted | selected, pass |' \
    '| 3. Initial read failure | accepted | selected, pass |' \
    > "${ws}/.planning/acceptance-outcome.md"
  : > "${work}/response.md"
  delivery_evidence_selection_observe_counterexample complete-selection 3 3
  grep -Fxq 'promises-accepted-count: 3' <<< "${obs}"
  grep -Fxq 'incomplete-named: false' <<< "${obs}"
  delivery_evidence_selection_assess "${work}/obs.txt"
}
