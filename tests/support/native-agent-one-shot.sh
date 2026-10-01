#!/usr/bin/env bash
# One-shot journeys for the credential-free publication substitute. Sourced
# by native-agent-publication.sh (copied beside it) with ${host}, ${journey}
# and ${workspace} (the originating checkout) set. Runs the installed CLIs the
# one-shot guidance names, in its order, so observations come from real
# repository state. Asked to land the result: start the owned workspace with
# --one-shot and workspace authority alone, commit the result (for a queued
# story, with its closure), land it on trunk through delivery, complete CI
# observation, and retire the workspace and its branch. The review and
# refinement journeys stop for review (native-agent-one-shot-review.sh). Emits
# each command in the host's stream shape through the admission substitute's
# recorder and sets ${response}.
# NATIVE_ONE_SHOT_WORKSPACE and _BRANCH carry the owned workspace and branch;
# NATIVE_ONE_SHOT_IDENTITY names the queued story, if any.
# shellcheck disable=SC2034,SC2154,SC2312 # host, journey, workspace and response are shared with the sourcing substitute.

# shellcheck source=tests/support/native-agent-admission.sh
# shellcheck disable=SC1091
source "${0%/*}/native-agent-admission.sh"
# shellcheck source=tests/support/native-agent-one-shot-escalation.sh
# shellcheck disable=SC1091
source "${0%/*}/native-agent-one-shot-escalation.sh"
# shellcheck source=tests/support/native-agent-one-shot-review.sh
# shellcheck disable=SC1091
source "${0%/*}/native-agent-one-shot-review.sh"

native_one_shot_substitute() {
  local execution=${NATIVE_ONE_SHOT_WORKSPACE} branch=${NATIVE_ONE_SHOT_BRANCH}
  local identity=${NATIVE_ONE_SHOT_IDENTITY} skills starting delivered mailbox
  local accepted line message named=() guard=()
  skills=$(admission_installed)
  case ${journey} in
    one-shot-result)
      line='One-shot line' message='Add a one-shot line to notes'
      ;;
    one-shot-queued)
      line='Story B line' message="Complete ${identity} as one-shot work"
      named=(--identity "${identity}")
      guard=(--one-shot-identity "${identity}")
      ;;
    one-shot-escalation)
      native_one_shot_escalation_substitute
      return
      ;;
    one-shot-review)
      native_one_shot_review_substitute
      return
      ;;
    one-shot-refinement)
      native_one_shot_refinement_substitute
      return
      ;;
    *) return 1 ;;
  esac
  admission_run node "${skills}/dough-execute-plan/scripts/execution-start.mjs" \
    start --integration "${workspace}" --workspace "${execution}" \
    --branch "${branch}" --mode story-branch --remote origin \
    --target main --workspace-authorized --one-shot \
    "${named[@]}" --host "${host}"
  starting=$(jq -r .startingRevision <<< "${admission_last}")
  printf '%s\n' "${line}" >> "${execution}/notes.txt"
  skills="${execution}/${skills#"${workspace}"/}"
  [[ -z ${identity} ]] || native_one_shot_close_story "${execution}" "${skills}"
  admission_run_in "${execution}" git commit -qam "${message}"
  admission_run_in "${execution}" node \
    "${skills}/dough-execute-plan/scripts/execution-increment-delivery.mjs" \
    deliver --workspace "${execution}" --branch "${branch}" \
    --previously-published-base "${starting}" --target-ref refs/heads/main \
    --repo owner/project --host "${host}" --default-checkout "${workspace}" \
    "${guard[@]}"
  delivered=$(tail -n 1 <<< "${admission_last}")
  mailbox=$(jq -r .observation.directory <<< "${delivered}")
  accepted=$(jq -r .receipt.sha <<< "${delivered}")
  admission_run_in "${execution}" node \
    "${skills}/dough-execute-plan/scripts/ci-mailbox.mjs" complete-revision \
    "${mailbox}" "${accepted}"
  admission_run git fetch -q origin
  admission_run git branch -q --set-upstream-to origin/main "${branch}"
  admission_run git worktree remove "${execution}"
  admission_run git branch -q -d "${branch}"
  response="Published only the one-shot result to remote trunk; CI passed, and the owned workspace and its branch were retired. Existing local changes were preserved."
}

# Composes queued story ${identity}'s closure in execution workspace $1 with
# installed skills $2: its backlog completion, its story section (the seed
# keeps its sibling) and its plan, found from its backlog link and read state.
native_one_shot_close_story() {
  local execution=$1 skills=$2 link seed anchor plan
  local cli="${skills}/dough-product-backlog/scripts/product-backlog.mjs"
  link=$(grep -e "— ${identity}\$" "${execution}/.planning/PRODUCT-BACKLOG.md" \
    | sed -E 's/^- \[[^]]*\]\(([^)]*)\).*/\1/')
  seed=".planning/${link%%#*}" anchor=${link#*#}
  admission_run_in "${execution}" node "${cli}" read-state --link "${link}"
  plan=$(jq -r .approach.plan <<< "${admission_last}")
  admission_run_in "${execution}" node "${cli}" complete --identity "${identity}"
  awk -v start="<a id=\"${anchor}\"></a>" '
    $0 == start { skip = 1; next }
    skip && /^<a id="/ { skip = 0 }
    !skip' "${execution}/${seed}" > "${execution}/${seed}.next"
  admission_run_in "${execution}" mv "${seed}.next" "${seed}"
  admission_run_in "${execution}" git rm -rq "${seed%/*}/${plan%/*}"
}
