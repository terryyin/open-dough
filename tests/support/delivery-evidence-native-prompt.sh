#!/usr/bin/env bash
# Native task wording for implementation and returned-proof acceptance journeys.

delivery_evidence_source_acceptance_prompt() {
  local story=$1 plan=$2
  printf '%s\n' \
    "Use this project's installed Open Dough guidance. An implementation agent returned uncommitted slice 3 work and its proof report at .planning/implementation-return.md. The selected story is ${story} and its plan is ${plan}. Apply the existing acceptance workflow to that return. Do not commit. Leave a short acceptance outcome in .planning/acceptance-outcome.md naming accepted or incomplete promises and the evidence you inspected. Treat the installed guidance and project files as task inputs; do not inspect parent processes or external test-harness source."
}

delivery_evidence_prompt_for() {
  local request
  case ${1:-} in
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
