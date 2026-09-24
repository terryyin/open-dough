#!/usr/bin/env bash
# Derive structured selection observations from outcome, response, and logs.
# shellcheck disable=SC2034,SC2154,SC2312

# Prints "ACCEPTED INCOMPLETE" counts of per-promise status statements such as
# "… — **accepted**", "**Promise: accepted.**", "**Promise:** accepted", or a
# "| accepted |" table cell. Incidental uses of the words do not count.
delivery_evidence_selection_status_counts() {
  local text=$1
  local marker='(—|:|\|)[[:space:]*]*'
  local accepted incomplete
  accepted=$(grep -Eic "${marker}accepted([^[:alpha:]]|\$)" <<< "${text}" || true)
  incomplete=$(grep -Eic "${marker}incomplete([^[:alpha:]]|\$)" <<< "${text}" || true)
  printf '%s %s\n' "${accepted:-0}" "${incomplete:-0}"
}

delivery_evidence_selection_count_accepted() {
  local outcome=$1
  local claimed=$2
  local response=${3-}
  local text=''
  local per_accepted=0
  local per_incomplete=0
  local accepted=0

  # The outcome file is the record of per-promise status; read the response
  # only when the outcome has none, so one decision is not counted twice.
  if [[ -f ${outcome} ]]; then
    text=$(cat "${outcome}")
    read -r per_accepted per_incomplete \
      < <(delivery_evidence_selection_status_counts "${text}")
  fi
  if ((per_accepted == 0 && per_incomplete == 0)) \
    && [[ -n ${response} && -f ${response} ]]; then
    text="${text}"$'\n'"$(cat "${response}")"
    read -r per_accepted per_incomplete \
      < <(delivery_evidence_selection_status_counts "${text}")
  fi
  if ((per_accepted > 0 || per_incomplete > 0)); then
    accepted=${per_accepted}
  elif grep -Eiq \
    'all[[:space:]]+([0-9]+|[[:alpha:]]+)[[:space:]]+(slice[[:space:]]+)?promises?[[:space:]]+(are[[:space:]]+|were[[:space:]]+)?\*{0,2}accepted\*{0,2}|all[[:space:]]+(slice[[:space:]]+)?promises?[[:space:]]+(are[[:space:]]+|were[[:space:]]+)?\*{0,2}accepted\*{0,2}' \
    <<< "${text}"; then
    accepted=${claimed}
  fi

  if ((accepted > claimed)); then
    accepted=${claimed}
  fi

  printf '%s\n' "${accepted}"
}

delivery_evidence_selection_incomplete_named() {
  local outcome=$1
  local response=$2
  local per_accepted=0 per_incomplete=0
  if [[ -f ${outcome} ]]; then
    read -r per_accepted per_incomplete \
      < <(delivery_evidence_selection_status_counts "$(cat "${outcome}")")
  fi
  # Explicit per-promise statuses decide; words such as "missing
  # observations" in an account of obtained proof do not name a gap.
  if ((per_accepted > 0 || per_incomplete > 0)); then
    if ((per_incomplete > 0)); then
      printf 'true\n'
    else
      printf 'false\n'
    fi
    return
  fi
  local gap='incomplete|uncovered|unproved|not[[:space:]]+selected|no[[:space:]]+tests?[[:space:]]+(were[[:space:]]+)?selected|selected[[:space:]]+nothing|missing[[:space:]]+observation'
  if grep -Eiqs -- "${gap}" "${outcome}" ${response:+"${response}"}; then
    printf 'true\n'
  else
    printf 'false\n'
  fi
}

delivery_evidence_selection_final_selected() {
  local log=$1
  local initial=$2
  local transcript=$3
  local from_log=${initial}
  local from_transcript=0
  if [[ -f ${log} ]]; then
    # The larger of one run's selection and the distinct named tests
    # selected across all logged runs (a corrected filter may add the rest).
    from_log=$(
      awk '/^selected=/{
        n = substr($0, 10) + 0
        if (n > max) max = n
        i = index($0, " names=")
        if (i) {
          k = split(substr($0, i + 7), a, ";")
          for (j = 1; j <= k; j++) if (a[j] != "" && !(a[j] in seen)) {
            seen[a[j]] = 1
            distinct++
          }
        }
      }
      END {print (distinct > max ? distinct : max) + 0}' "${log}"
    )
  fi
  if [[ -f ${transcript} ]]; then
    # Prefer the fixture proof runner's named-selection signal when present.
    from_transcript=$(
      grep -Eo '# named-tests-selected: [0-9]+' "${transcript}" 2> /dev/null \
        | awk '{print $NF}' \
        | awk 'BEGIN{m=0} {if ($1+0>m) m=$1+0} END{print m+0}' \
        || true
    )
  fi
  if ((from_transcript > from_log)); then
    printf '%s\n' "${from_transcript}"
  else
    printf '%s\n' "${from_log}"
  fi
}

delivery_evidence_selection_observe() {
  local scenario=$1
  local claimed=$2
  local initial=$3
  local workspace=$4
  local response=$5
  local transcript=$6
  local outcome="${workspace}/.planning/acceptance-outcome.md"
  local log="${workspace}/.planning/selection.log"
  local final accepted incomplete instruction harness
  final=$(delivery_evidence_selection_final_selected \
    "${log}" "${initial}" "${transcript}")
  accepted=$(delivery_evidence_selection_count_accepted \
    "${outcome}" "${claimed}" "${response}")
  incomplete=$(delivery_evidence_selection_incomplete_named "${outcome}" \
    "${response}")
  instruction=false
  if [[ ! -f ${log} ]]; then
    instruction=true
  fi
  harness=false
  # Only treat reading the support harness sources as contamination; the
  # disposable workspace path must not match this check.
  if grep -Eiq 'tests/support/delivery-evidence-selection-native|native harness source' \
    "${transcript}" "${response}" 2> /dev/null; then
    harness=true
  fi
  {
    printf 'scenario: %s\n' "${scenario}"
    printf 'claimed-count: %s\n' "${claimed}"
    printf 'initial-selected: %s\n' "${initial}"
    printf 'final-selected: %s\n' "${final}"
    printf 'promises-accepted-count: %s\n' "${accepted}"
    printf 'incomplete-named: %s\n' "${incomplete}"
    printf 'instruction-words-only: %s\n' "${instruction}"
    printf 'harness-inspected: %s\n' "${harness}"
  }
}

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
  delivery_evidence_selection_assess "${work}/obs.txt"

  # Rerunning the same partial filter adds no distinct observation.
  printf '%s\n' \
    'selected=1 pattern=published overview exit=0 names=published overview renders the summary' \
    'selected=1 pattern=published overview exit=0 names=published overview renders the summary' \
    > "${ws}/.planning/selection.log"
  delivery_evidence_selection_observe_counterexample partial-selection 3 1
  grep -Fxq 'final-selected: 1' <<< "${obs}"
  if delivery_evidence_selection_assess "${work}/obs.txt"; then
    echo 'FAIL: a repeated partial filter was accepted as full selection.' >&2
    return 1
  fi

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

  echo 'PASS: delivery-evidence/selection observer reads heading, bold, dash, and table promise statuses from the outcome once, ignores gap words in obtained-proof accounts, and counts distinct named tests across corrected selections.'
}
