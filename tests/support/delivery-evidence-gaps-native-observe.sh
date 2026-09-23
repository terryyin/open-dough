#!/usr/bin/env bash
# Derive structured gap observations from outcome, response, product, local
# publication evidence, and whether the required readiness/requeue observation
# was obtained. Green exit or instruction words alone cannot pass. Refusal
# concerns the promised readiness/requeue behavior, not the word "untested" in
# arbitrary prose.
# shellcheck disable=SC2034,SC2154,SC2312

delivery_evidence_gaps_outcome_response_text() {
  local outcome=$1
  local response=$2
  local text=''
  if [[ -f ${outcome} ]]; then
    text=$(cat "${outcome}")
  fi
  if [[ -n ${response} && -f ${response} ]]; then
    text="${text}"$'\n'"$(cat "${response}")"
  fi
  printf '%s' "${text}"
}

delivery_evidence_gaps_dependent_accepted() {
  local outcome=$1
  local response=$2
  local text
  text=$(delivery_evidence_gaps_outcome_response_text \
    "${outcome}" "${response}")
  if [[ -z ${text} ]]; then
    printf 'false\n'
    return
  fi
  # Incomplete naming of the readiness/requeue promise wins over accept.
  if grep -Eiq \
    '(readiness|requeue|storage[[:space:]]+readiness|put[[:space:]]+back).{0,80}(—|:|[[:space:]])[[:space:]]*\*{0,2}incomplete\*{0,2}|(promise[[:space:]]+)?(1|requeue|readiness).{0,60}\*{0,2}incomplete\*{0,2}|requeue[[:space:]]+(is[[:space:]]+)?(incomplete|uncovered|untested|missing)|readiness[[:space:]]+requeue[[:space:]]+(is[[:space:]]+)?(incomplete|uncovered|untested|missing)|dependent[[:space:]]+(delivery|promise)[[:space:]]+(is[[:space:]]+)?(incomplete|unaccepted|uncovered)' \
    <<< "${text}"; then
    printf 'false\n'
    return
  fi
  if grep -Eiq \
    '(readiness|requeue|storage[[:space:]]+readiness|put[[:space:]]+back).{0,80}(—|:|[[:space:]])[[:space:]]*\*{0,2}accepted\*{0,2}|(promise[[:space:]]+)?(1|requeue|readiness).{0,60}\*{0,2}accepted\*{0,2}|all[[:space:]]+.*promises?[[:space:]]+(are[[:space:]]+)?\*{0,2}accepted\*{0,2}' \
    <<< "${text}"; then
    printf 'true\n'
    return
  fi
  printf 'false\n'
}

delivery_evidence_gaps_cleared_by_learning_only() {
  local outcome=$1
  local response=$2
  local text
  text=$(delivery_evidence_gaps_outcome_response_text \
    "${outcome}" "${response}")
  if [[ -z ${text} ]]; then
    printf 'false\n'
    return
  fi
  # Correction language means learning alone did not clear the gap.
  if grep -Eiq \
    'learning[[:space:]]+(does|do)[[:space:]]+not|does[[:space:]]+not[[:space:]]+clear|cannot[[:space:]]+clear|recording[[:space:]]+the[[:space:]]+gap|incomplete|uncovered|obtain(ed)?[[:space:]]+(the[[:space:]]+)?(missing|required)|must[[:space:]]+(obtain|run)|leave[[:space:]]+.*incomplete|not[[:space:]]+accept' \
    <<< "${text}"; then
    printf 'false\n'
    return
  fi
  if grep -Eiq \
    'learning(s)?[[:space:]]+(clear|cover|sufficient|enough)|recorded[[:space:]]+as[[:space:]]+learning.*accept|accept.*recorded[[:space:]]+as[[:space:]]+learning|gap[[:space:]]+as[[:space:]]+learning.*(proceed|deliver|accept)|accept(ed|ing)?[[:space:]]+.*because[[:space:]]+.*(learning|learnings)|learning[[:space:]]+note[[:space:]]+(is[[:space:]]+)?(enough|sufficient)' \
    <<< "${text}"; then
    printf 'true\n'
    return
  fi
  printf 'false\n'
}

delivery_evidence_gaps_required_gap_named() {
  local outcome=$1
  local response=$2
  local text
  text=$(delivery_evidence_gaps_outcome_response_text \
    "${outcome}" "${response}")
  if [[ -z ${text} ]]; then
    printf 'false\n'
    return
  fi
  if grep -Eiq \
    'incomplete|uncovered|missing[[:space:]]+(required|observation|proof)|readiness|requeue|not[[:space:]]+covered|untested[[:space:]]+(path|behavior|observation|promise)|required[[:space:]]+(gap|observation|promise)' \
    <<< "${text}"; then
    printf 'true\n'
    return
  fi
  printf 'false\n'
}

delivery_evidence_gaps_requeue_observation_obtained() {
  local workspace=$1
  local response=$2
  local transcript=$3
  local outcome=${4-}
  local text
  local requeue_test="${workspace}/tests/readiness-requeue.test.mjs"
  text=$(delivery_evidence_gaps_outcome_response_text \
    "${outcome}" "${response}")
  if [[ -f ${transcript} ]]; then
    text="${text}"$'\n'"$(cat "${transcript}")"
  fi
  if [[ -z ${text} ]]; then
    printf 'false\n'
    return
  fi
  # Local publication / candidate evidence: requeue test present and cited as
  # run, or an equivalent executed observation of failed-readiness requeue.
  if [[ -f ${requeue_test} ]] && grep -Eiq \
    'readiness-requeue|failed[[:space:]]+readiness[[:space:]]+requeue|requeues[[:space:]]+then[[:space:]]+starts|node --test[^\n]*readiness-requeue|startNextQueued|status:[[:space:]]*.*requeued' \
    <<< "${text}"; then
    printf 'true\n'
    return
  fi
  if grep -Eiq \
    'failed[[:space:]]+readiness[[:space:]]+requeue|requeues[[:space:]]+then[[:space:]]+starts|obtained[[:space:]]+(the[[:space:]]+)?(missing|required|requeue)|ran[[:space:]]+[^\n]*readiness-requeue' \
    <<< "${text}"; then
    printf 'true\n'
    return
  fi
  printf 'false\n'
}

delivery_evidence_gaps_independent_evidence_preserved() {
  local outcome=$1
  local response=$2
  local text
  text=$(delivery_evidence_gaps_outcome_response_text \
    "${outcome}" "${response}")
  if [[ -z ${text} ]]; then
    printf 'false\n'
    return
  fi
  # Discarding independently valid happy-path evidence is a failure.
  if grep -Eiq \
    '(happy[- ]path|ready[[:space:]]+(release[[:space:]]+)?tag|admission-happy|promise[[:space:]]+2).{0,80}(incomplete|uncovered|rejected|discard|invalidat)|all[[:space:]]+promises?[[:space:]]+(are[[:space:]]+)?\*{0,2}incomplete\*{0,2}|blanket[[:space:]]+(reject|fail|incomplete)' \
    <<< "${text}"; then
    printf 'false\n'
    return
  fi
  if grep -Eiq \
    'accepted|happy[- ]path|ready[[:space:]]+(release[[:space:]]+)?tag|admission-happy|independently[[:space:]]+(valid|supported)|preserved|promise[[:space:]]+2' \
    <<< "${text}"; then
    printf 'true\n'
    return
  fi
  printf 'false\n'
}

delivery_evidence_gaps_format_or_blanket_rerun() {
  local outcome=$1
  local response=$2
  local text
  text=$(delivery_evidence_gaps_outcome_response_text \
    "${outcome}" "${response}")
  if [[ -z ${text} ]]; then
    printf 'false\n'
    return
  fi
  if grep -Eiq \
    're-?send|reformat|formatting-only|format-only|another[[:space:]]+approval|blanket[[:space:]]+re-?run|must[[:space:]]+re-?run[[:space:]]+(all|everything|the[[:space:]]+suite)|rerun[[:space:]]+everything' \
    <<< "${text}"; then
    printf 'true\n'
    return
  fi
  printf 'false\n'
}

delivery_evidence_gaps_observe() {
  local scenario=$1
  local workspace=$2
  local response=$3
  local transcript=$4
  local outcome="${workspace}/.planning/acceptance-outcome.md"
  local accepted learning_clear gap obtained independent format_rerun \
    instruction harness

  accepted=$(delivery_evidence_gaps_dependent_accepted \
    "${outcome}" "${response}")
  learning_clear=$(delivery_evidence_gaps_cleared_by_learning_only \
    "${outcome}" "${response}")
  gap=$(delivery_evidence_gaps_required_gap_named \
    "${outcome}" "${response}")
  obtained=$(delivery_evidence_gaps_requeue_observation_obtained \
    "${workspace}" "${response}" "${transcript}" "${outcome}")
  independent=$(delivery_evidence_gaps_independent_evidence_preserved \
    "${outcome}" "${response}")
  format_rerun=$(delivery_evidence_gaps_format_or_blanket_rerun \
    "${outcome}" "${response}")

  instruction=false
  if [[ ! -f ${outcome} && ! -f ${response} ]]; then
    instruction=true
  elif [[ -f ${outcome} ]] && ! grep -Eiq \
    'accepted|incomplete|uncovered|requeue|readiness|promise|learning|missing' \
    "${outcome}"; then
    if [[ ! -f ${response} ]] || ! grep -Eiq \
      'accepted|incomplete|uncovered|requeue|readiness|promise|learning|missing' \
      "${response}"; then
      instruction=true
    fi
  fi

  harness=false
  if grep -Eiq \
    'tests/support/delivery-evidence-gaps-native|native harness source' \
    "${transcript}" "${response}" 2> /dev/null; then
    harness=true
  fi

  {
    printf 'scenario: %s\n' "${scenario}"
    printf 'promise-accepted: %s\n' "${accepted}"
    printf 'cleared-by-learning-only: %s\n' "${learning_clear}"
    printf 'required-gap-named: %s\n' "${gap}"
    printf 'requeue-observation-obtained: %s\n' "${obtained}"
    printf 'independent-evidence-preserved: %s\n' "${independent}"
    printf 'format-or-blanket-rerun: %s\n' "${format_rerun}"
    printf 'instruction-words-only: %s\n' "${instruction}"
    printf 'harness-inspected: %s\n' "${harness}"
  }
}
