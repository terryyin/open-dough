#!/usr/bin/env bash
# Source-freshness assessor at slice 3's delivery boundary and its
# credential-free counterexamples. Each rejected case changes one signal,
# declared beside the assessor, of a passing observation
# (tests/support/native-assessor-counterexample.sh). The check's own printed
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

# A passing observation for SCENARIO with each `key: value` override applied.
delivery_evidence_amended_passing() {
  local scenario=$1
  shift
  local check='amended unchanged' absorb=true names='amended unchanged'
  local final=unchanged disposition=false awaiting=false named=false
  local statuses='1:done 2:done 3:planned 4:planned' obligations=none
  case ${scenario} in
    story-amended)
      disposition=true obligations='G1=receiving'
      statuses='1:done 2:done 3:planned 4:planned 5:planned'
      ;;
    unrelated-advance) check=unchanged absorb=false names=unchanged ;;
    conflict)
      check=conflict absorb=false names=conflict final=conflict
      awaiting=true named=true
      ;;
    *) ;;
  esac
  printf '%s\n' "scenario: ${scenario}" 'payload: candidate' \
    'check-ran: true' "absorb-ran: ${absorb}" "check-results: ${check}" \
    "response-names: ${names}" 'story-copy: trunk' 'final-story: unchanged' \
    "final-plan: ${final}" "plan-statuses: ${statuses}" \
    'done-statuses-kept: true' "obligations: ${obligations}" \
    "amendment-disposition: ${disposition}" \
    "awaiting-story-review: ${awaiting}" "conflict-named: ${named}" \
    'trunk-tip-merged: false' 'trunk-only-file-on-branch: false' \
    'origin-trunk-before: 1111111aaaa' 'origin-trunk-after: 1111111aaaa' \
    'harness-inspected: false'
}

run_delivery_evidence_amended_assessor_counterexamples() {
  local work
  work=$(mktemp -d)
  # shellcheck disable=SC2064
  trap "rm -rf -- '${work}'" RETURN

  # ODF-354 shape: surfaced, absorbed word for word with the added promise
  # dispositioned, statuses kept, nothing merged or pushed to trunk.
  delivery_evidence_amended_passing story-amended > "${work}/story-amended.txt"
  native_assessor_counterexamples "${BASH_SOURCE[0]}" \
    "${work}/story-amended.txt" -- delivery_evidence_amended_assess
  native_assessor_rejects_field_rows << 'EOF'
unnoticed surfaced check-ran: false
false-unchanged-check surfaced check-results: unchanged
false-unchanged-response surfaced response-names: unchanged
unabsorbed absorbed-with-disposition final-story: amended
paraphrased-absorption absorbed-with-disposition story-copy: other
absorbed-without-disposition absorbed-with-disposition amendment-disposition: false
overwritten-statuses statuses-preserved done-statuses-kept: false
silent-whole-trunk-merge trunk-unmerged trunk-tip-merged: true
pushed-to-trunk trunk-unchanged origin-trunk-after: 2222222bbbb
needless-stop conflict-stopped awaiting-story-review: true
EOF
  native_assessor_rejects_missing_fields << 'EOF'
surfaced check-results
absorbed-with-disposition amendment-disposition
trunk-unchanged origin-trunk-after
EOF

  # Plan-only amendment: absorbed over the branch's done statuses.
  delivery_evidence_amended_passing plan-amended > "${work}/plan-amended.txt"
  native_assessor_counterexamples "${BASH_SOURCE[0]}" \
    "${work}/plan-amended.txt" -- delivery_evidence_amended_assess
  native_assessor_rejects_field_rows << 'EOF'
plan-false-unchanged surfaced check-results: unchanged
plan-unabsorbed absorbed-with-disposition final-plan: amended
plan-overwritten-statuses statuses-preserved done-statuses-kept: false
EOF

  # Unrelated trunk advance: unchanged, nothing absorbed or merged.
  delivery_evidence_amended_passing unrelated-advance > "${work}/unrelated.txt"
  native_assessor_counterexamples "${BASH_SOURCE[0]}" \
    "${work}/unrelated.txt" -- delivery_evidence_amended_assess
  native_assessor_rejects_field_rows << 'EOF'
unrelated-unchecked surfaced check-ran: false
unrelated-absorbed absorbed-with-disposition absorb-ran: true
trunk-only-file-merged trunk-unmerged trunk-only-file-on-branch: true
EOF

  # Conflict: stopped with awaiting story review, the conflict left intact.
  delivery_evidence_amended_passing conflict > "${work}/conflict.txt"
  native_assessor_counterexamples "${BASH_SOURCE[0]}" \
    "${work}/conflict.txt" -- delivery_evidence_amended_assess
  native_assessor_rejects_field_rows << 'EOF'
conflict-false-unchanged surfaced check-results: unchanged
auto-resolved-conflict conflict-stopped final-plan: unchanged
conflict-absorbed absorbed-with-disposition absorb-ran: true
unstopped-conflict conflict-stopped awaiting-story-review: false
unnamed-conflict conflict-stopped conflict-named: false
conflict-overwritten-statuses statuses-preserved done-statuses-kept: false
conflict-pushed-to-trunk trunk-unchanged origin-trunk-after: 2222222bbbb
EOF
}
