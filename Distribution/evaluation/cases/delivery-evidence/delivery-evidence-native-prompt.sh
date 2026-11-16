#!/usr/bin/env bash
# Native task wording for implementation and returned-proof acceptance journeys.
#   delivery_evidence_prompt_for CASE [SCENARIO]
# shellcheck disable=SC2154 # Scheduling and drift paths come from their scenario content.

delivery_evidence_source_acceptance_prompt() {
  local story=$1 plan=$2 slice=${3:-3}
  printf '%s\n' \
    "Use this project's installed Open Dough guidance. An implementation agent returned uncommitted slice ${slice} work and its proof report at .planning/implementation-return.md. The selected story is ${story} and its plan is ${plan}. Apply the existing acceptance workflow to that return. Do not commit. Leave a short acceptance outcome in .planning/acceptance-outcome.md naming accepted or incomplete promises and the evidence you inspected. Treat the installed guidance and project files as task inputs; do not inspect parent processes or external test-harness source."
}

delivery_evidence_prompt_for() {
  local request
  case ${1:-} in
    drift)
      delivery_evidence_source_acceptance_prompt \
        "${delivery_evidence_drift_story}" "${delivery_evidence_drift_plan}" 4
      return
      ;;
    release)
      delivery_evidence_source_acceptance_prompt \
        .planning/seeds/SEED-120-release-readiness.md \
        .planning/slice-plans/360-release-progress-and-terminal-failures/PLAN.md
      return
      ;;
    terminal)
      delivery_evidence_source_acceptance_prompt \
        .planning/seeds/SEED-106-sharadar-search-confidence.md \
        .planning/slice-plans/340-terminal-capacity-reconciliation/PLAN.md
      return
      ;;
    original)
      delivery_evidence_source_acceptance_prompt \
        .planning/seeds/SEED-138-computed-execution-readiness.md \
        .planning/slice-plans/311-compute-execution-readiness/PLAN.md
      return
      ;;
    scheduling)
      # The planned scenario hands over slice 1 of the plan; the other a
      # planless request.
      local task='carry out this request' selection slice='the slice' boundary='' subject='the request'
      selection=", one planless quick slice authorized by this instruction: ${delivery_evidence_scheduling_request}"
      if [[ ${2-} == planned-extraction ]]; then
        task="execute slice 1 of the executable plan ${delivery_evidence_scheduling_plan_path}"
        selection='. This instruction selects and authorizes that slice; there is no backlog, claim or remote to update.'
        slice='slice 1' boundary=', and do not start slice 2' subject='slice 1'
      fi
      printf '%s\n' \
        "Use this project's installed Open Dough execution guidance (dough-execute-plan) to ${task} as caller-selected current-branch work in this checkout${selection} Follow the project's instructions in AGENTS.md. Carry ${slice} through implementation, its independent post-change refactoring, formatting and acceptance, then stop at the delivery boundary: do not stage, commit or publish${boundary}. Leave a short outcome in .planning/acceptance-outcome.md naming ${subject} as accepted or incomplete with the evidence inspected. Treat installed guidance and project files as task inputs; do not inspect parent processes or external test-harness source."
      return
      ;;
    amended)
      # Every scenario gets the same request; none names what trunk changed.
      printf '%s\n' \
        "Use this project's installed Open Dough execution guidance (dough-execute-plan) to continue the Story Branch execution described in .planning/execution-state.txt: deliver slice 3 from where its acceptance left off. Carry its delivery up to the commit, then stop: do not stage, commit, push or publish, and do not start slice 4. End your response with where you stopped and why. Treat installed guidance and project files as task inputs; do not inspect parent processes or external test-harness source."
      return
      ;;
    nostore)
      request="compute the latest source update once per exit-settings computation and reuse it across evaluated holdings, instead of reading it separately for each row. Preserve the endpoint's existing behavior."
      ;;
    aggregate)
      request="show Running sessions before Recently done in the session sidebar. Preserve the page's other behavior."
      ;;
    *)
      printf '%s\n' \
        "Use this project's installed Open Dough guidance. An implementation agent returned uncommitted work and the proof report at .planning/implementation-return.md for the promises in .planning/slice-promises.md. Apply the existing acceptance workflow to that return. Do not commit. Leave a short acceptance outcome in .planning/acceptance-outcome.md naming each promise as accepted or incomplete with the evidence you inspected. Treat the installed guidance and project files as the task inputs; do not inspect parent processes or external test-harness source."
      return
      ;;
  esac
  printf '%s\n' "Use this project's installed Open Dough guidance to implement this request: ${request} Obtain the proof needed for your change and apply the existing acceptance workflow to your implementation before delivery. Do not commit. Leave a short outcome in .planning/acceptance-outcome.md naming accepted or incomplete promises and the evidence inspected. Treat installed guidance and project files as task inputs; do not inspect parent processes or external test-harness source."
}
