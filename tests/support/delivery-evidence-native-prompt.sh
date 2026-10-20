#!/usr/bin/env bash
# Native task wording for implementation and returned-proof acceptance journeys.

delivery_evidence_prompt_for() {
  local request
  case ${1:-} in
    original)
      printf '%s\n' \
        "Use this project's installed Open Dough guidance. An implementation agent returned uncommitted slice 3 work and its proof report at .planning/implementation-return.md. The selected story is .planning/seeds/SEED-138-computed-execution-readiness.md and its plan is .planning/slice-plans/311-compute-execution-readiness/PLAN.md. Apply the existing acceptance workflow to that return. Do not commit. Leave a short acceptance outcome in .planning/acceptance-outcome.md naming accepted or incomplete promises and the evidence you inspected. Treat the installed guidance and project files as task inputs; do not inspect parent processes or external test-harness source."
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
