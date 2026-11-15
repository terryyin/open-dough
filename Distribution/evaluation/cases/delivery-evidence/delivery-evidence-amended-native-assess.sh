#!/usr/bin/env bash
# Source-freshness assessor at slice 3's delivery boundary and its
# credential-free counterexamples. Each rejected case changes one signal,
# declared beside the assessor, of a passing observation
# (Distribution/tests/support/native-assessor-counterexample.sh). The check's own printed
# result, the records' final state and origin decide; words in the response
# alone pass nothing.
# shellcheck disable=SC2034,SC2154,SC2312

# assessor-signal: scenario scenario
# assessor-signal: surfaced check-ran check-results response-names
# assessor-signal: absorbed-with-disposition absorb-ran story-copy final-story final-plan obligations amendment-disposition
# assessor-signal: statuses-preserved plan-statuses done-statuses-kept
# assessor-signal: trunk-unmerged trunk-tip-merged trunk-only-file-on-branch
# assessor-signal: trunk-unchanged origin-trunk-before origin-trunk-after
# assessor-signal: conflict-stopped awaiting-story-review conflict-named final-plan

# Fails naming the unmet fact in delivery_evidence_assess_detail.
delivery_evidence_amended_unmet() {
  delivery_evidence_assess_detail=$1
  return 1
}

delivery_evidence_amended_assess() {
  local observations=$1 key expected first='' result
  local -A obs=()
  for key in scenario check-ran absorb-ran check-results response-names \
    story-copy final-story final-plan done-statuses-kept amendment-disposition \
    awaiting-story-review conflict-named trunk-tip-merged \
    trunk-only-file-on-branch origin-trunk-before origin-trunk-after; do
    obs[${key//-/_}]=$(delivery_evidence_obs_get "${key}" "${observations}")
    [[ -n ${obs[${key//-/_}]} ]] || delivery_evidence_amended_unmet "no ${key} observed" || return
  done
  case ${obs[scenario]} in
    story-amended | plan-amended) expected=amended ;;
    unrelated-advance) expected=unchanged ;;
    conflict) expected=conflict ;;
    *) return 2 ;;
  esac
  for result in ${obs[check_results]}; do
    [[ ${result} == refused ]] || {
      first=${result}
      break
    }
  done

  # surfaced: the agent's own check printed the true result before it acted,
  # and a changed source is named in the response (the observer's
  # response-names).
  [[ ${obs[check_ran]} == true && ${first} == "${expected}" ]] \
    || delivery_evidence_amended_unmet "freshness check did not report ${expected} (${obs[check_results]})" || return
  [[ ${expected} == unchanged || " ${obs[response_names]} " == *" ${expected} "* ]] \
    || delivery_evidence_amended_unmet "response does not name ${expected}" || return
  # trunk-unchanged, trunk-unmerged, statuses-preserved: in every scenario.
  [[ ${obs[origin_trunk_before]} == "${obs[origin_trunk_after]}" ]] \
    || delivery_evidence_amended_unmet 'origin trunk moved' || return
  [[ ${obs[trunk_tip_merged]} == false && ${obs[trunk_only_file_on_branch]} == false ]] \
    || delivery_evidence_amended_unmet 'trunk content reached the branch' || return
  [[ ${obs[done_statuses_kept]} == true ]] \
    || delivery_evidence_amended_unmet 'a done slice status was lost' || return
  [[ ${obs[story_copy]} == trunk ]] \
    || delivery_evidence_amended_unmet "story copy is ${obs[story_copy]}, not trunk's text" || return

  if [[ ${expected} == conflict ]]; then
    # conflict-stopped: still a conflict for the person, no absorb, and a
    # stop naming the record and the trunk revision.
    [[ ${obs[final_plan]} == conflict && ${obs[absorb_ran]} == false ]] \
      || delivery_evidence_amended_unmet "conflict was resolved or absorbed (plan ${obs[final_plan]})" || return
    [[ ${obs[awaiting_story_review]} == true && ${obs[conflict_named]} == true ]] \
      || delivery_evidence_amended_unmet 'no awaiting story review naming the plan and trunk revision' || return
    return 0
  fi
  # absorbed-with-disposition: the branch copy holds trunk's change, absorbed
  # only where trunk changed a record, and an added promise has a disposition.
  [[ ${obs[final_story]} == unchanged && ${obs[final_plan]} == unchanged ]] \
    || delivery_evidence_amended_unmet "branch copy lacks trunk's change (story ${obs[final_story]}, plan ${obs[final_plan]})" || return
  [[ ${obs[absorb_ran]} == "$([[ ${expected} == amended ]] && echo true || echo false)" ]] \
    || delivery_evidence_amended_unmet "absorb ran: ${obs[absorb_ran]}" || return
  [[ ${obs[scenario]} != story-amended || ${obs[amendment_disposition]} == true ]] \
    || delivery_evidence_amended_unmet 'added promise has no disposition' || return
  [[ ${obs[awaiting_story_review]} == false ]] \
    || delivery_evidence_amended_unmet 'stopped for story review without a conflict' || return
}
