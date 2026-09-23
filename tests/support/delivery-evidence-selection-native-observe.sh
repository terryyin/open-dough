#!/usr/bin/env bash
# Derive structured selection observations from outcome, response, and logs.
# shellcheck disable=SC2034,SC2154,SC2312

delivery_evidence_selection_count_accepted() {
  local outcome=$1
  local claimed=$2
  local response=${3-}
  local text=''
  local per_accepted=0
  local per_incomplete=0
  local accepted=0

  if [[ -f ${outcome} ]]; then
    text=$(cat "${outcome}")
  fi
  if [[ -n ${response} && -f ${response} ]]; then
    text="${text}"$'\n'"$(cat "${response}")"
  fi
  if [[ -z ${text} ]]; then
    printf '%s\n' 0
    return
  fi

  # Per-promise statements: "… — **accepted**" / "… — **incomplete**"
  # (markdown or plain). Do not count incidental uses of the word accepted.
  per_accepted=$(
    grep -Eic \
      '—[[:space:]]*\*{0,2}accepted\*{0,2}([[:space:](:]|$)|:[[:space:]]*\*{0,2}accepted\*{0,2}([[:space:](:]|$)' \
      <<< "${text}" || true
  )
  per_incomplete=$(
    grep -Eic \
      '—[[:space:]]*\*{0,2}incomplete\*{0,2}([[:space:](:]|$)|:[[:space:]]*\*{0,2}incomplete\*{0,2}([[:space:](:]|$)' \
      <<< "${text}" || true
  )

  if ((per_accepted > 0 || per_incomplete > 0)); then
    accepted=${per_accepted}
  elif grep -Eiq \
    'all[[:space:]]+([0-9]+|[[:alpha:]]+)[[:space:]]+(slice[[:space:]]+)?promises?[[:space:]]+(are[[:space:]]+|were[[:space:]]+)?\*{0,2}accepted\*{0,2}|all[[:space:]]+(slice[[:space:]]+)?promises?[[:space:]]+(are[[:space:]]+|were[[:space:]]+)?\*{0,2}accepted\*{0,2}' \
    <<< "${text}"; then
    accepted=${claimed}
  elif grep -Eiq \
    '(the[[:space:]]+)?(single[[:space:]]+)?promise[[:space:]]+(is[[:space:]]+)?\*{0,2}incomplete\*{0,2}|all[[:space:]]+([0-9]+|[[:alpha:]]+)[[:space:]]+promises?[[:space:]]+(are[[:space:]]+)?\*{0,2}incomplete\*{0,2}|all[[:space:]]+promises?[[:space:]]+(are[[:space:]]+)?\*{0,2}incomplete\*{0,2}' \
    <<< "${text}"; then
    accepted=0
  else
    accepted=0
  fi

  if ((accepted > claimed)); then
    accepted=${claimed}
  fi

  printf '%s\n' "${accepted}"
}

delivery_evidence_selection_incomplete_named() {
  local outcome=$1
  local response=$2
  if [[ -f ${outcome} ]] && grep -Eiq \
    'incomplete|uncovered|unproved|not[[:space:]]+selected|no[[:space:]]+tests?[[:space:]]+(were[[:space:]]+)?selected|selected[[:space:]]+nothing|missing[[:space:]]+observation' \
    "${outcome}"; then
    printf 'true\n'
    return
  fi
  if [[ -n ${response} && -f ${response} ]] && grep -Eiq \
    'incomplete|uncovered|unproved|not[[:space:]]+selected|no[[:space:]]+tests?[[:space:]]+(were[[:space:]]+)?selected|selected[[:space:]]+nothing|missing[[:space:]]+observation' \
    "${response}"; then
    printf 'true\n'
    return
  fi
  printf 'false\n'
}

delivery_evidence_selection_final_selected() {
  local log=$1
  local initial=$2
  local transcript=$3
  local from_log=${initial}
  local from_transcript=0
  if [[ -f ${log} ]]; then
    from_log=$(
      awk -F= '/^selected=/{
        split($2, a, " ")
        n=a[1]+0
        if (n > max) max=n
      }
      END {print max+0}' "${log}"
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
