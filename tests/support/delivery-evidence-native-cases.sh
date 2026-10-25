#!/usr/bin/env bash
# The delivery-evidence case registry: which cases exist, their scenarios in
# run order, and the observable basis named on PASS. Dispatchers and evidence
# identity recognize a delivery-evidence case only through this file.
# shellcheck disable=SC2034

delivery_evidence_cases='selection claims consumers gaps aggregate nostore deferred original terminal release drift scheduling'
delivery_evidence_scenarios=
delivery_evidence_pass_basis=

delivery_evidence_case_known() {
  [[ " ${delivery_evidence_cases} " == *" $1 "* ]]
}

# Case table: scenarios in run order and the observable basis named on PASS.
delivery_evidence_case_profile() {
  case $1 in
    selection)
      delivery_evidence_scenarios='zero-test partial-selection complete-selection'
      delivery_evidence_pass_basis='observable selection state'
      ;;
    claims)
      delivery_evidence_scenarios='unsupported-claim corrected-no-link equivalent-layout'
      delivery_evidence_pass_basis='observable claim support'
      ;;
    consumers)
      delivery_evidence_scenarios='changed-contract corrected-consumer unchanged-boundary'
      delivery_evidence_pass_basis='observable consumer applicability'
      ;;
    aggregate)
      delivery_evidence_scenarios='heading-reorder'
      delivery_evidence_pass_basis='reviewed native command results'
      ;;
    deferred)
      delivery_evidence_scenarios='known-caller'
      delivery_evidence_pass_basis='reviewed native command results'
      ;;
    nostore)
      delivery_evidence_scenarios='single-read'
      delivery_evidence_pass_basis='reviewed native command results'
      ;;
    gaps)
      delivery_evidence_scenarios='repair-and-proceed unavailable-proof sufficient-reused'
      delivery_evidence_pass_basis='observable required-gap handling'
      ;;
    original | terminal | release)
      delivery_evidence_scenarios='narrowed'
      delivery_evidence_pass_basis='explicit review of original-story acceptance'
      ;;
    drift)
      delivery_evidence_scenarios='narrowed amended-corrected'
      delivery_evidence_pass_basis='explicit review of original-story acceptance'
      ;;
    scheduling)
      delivery_evidence_scenarios='stylesheet-extraction planned-extraction'
      delivery_evidence_pass_basis='observable proof order and final-state coverage'
      ;;
    *) return 2 ;;
  esac
}

# Succeeds when CASE registers SCENARIO, leaving the selected profile intact.
delivery_evidence_case_has_scenario() {
  local delivery_evidence_scenarios delivery_evidence_pass_basis
  delivery_evidence_case_profile "$1" || return 1
  [[ " ${delivery_evidence_scenarios} " == *" $2 "* ]]
}
