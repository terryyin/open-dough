#!/usr/bin/env bash
# One-shot journeys for the credential-free publication substitute. Sourced
# by native-agent-publication.sh (copied beside it) with ${host}, ${journey}
# and ${workspace} (the originating checkout) set. Runs the installed CLIs the
# one-shot guidance names, in its order, so observations come from real
# repository state: start the owned workspace with --one-shot, commit the
# result, deliver it to trunk, complete CI observation, and retire the
# workspace and its branch. Emits each command in the host's stream shape
# through the admission substitute's recorder and sets ${response}.
# NATIVE_ONE_SHOT_WORKSPACE and _BRANCH carry the owned workspace and branch.
# shellcheck disable=SC2034,SC2154 # host, journey, workspace and response are shared with the sourcing substitute.

# shellcheck source=tests/support/native-agent-admission.sh
# shellcheck disable=SC1091
source "${0%/*}/native-agent-admission.sh"

native_one_shot_substitute() {
  local execution=${NATIVE_ONE_SHOT_WORKSPACE} branch=${NATIVE_ONE_SHOT_BRANCH}
  local skills starting delivered mailbox accepted
  skills=$(admission_installed)
  case ${journey} in
    one-shot-result)
      admission_run node "${skills}/dough-execute-plan/scripts/execution-start.mjs" \
        start --integration "${workspace}" --workspace "${execution}" \
        --branch "${branch}" --mode story-branch --remote origin \
        --target main --push-authorized --workspace-authorized --one-shot \
        --host "${host}"
      starting=$(jq -r .startingRevision <<< "${admission_last}")
      printf 'One-shot line\n' >> "${execution}/notes.txt"
      skills="${execution}/${skills#"${workspace}"/}"
      admission_run_in "${execution}" git commit -qam 'Add a one-shot line to notes'
      admission_run_in "${execution}" node \
        "${skills}/dough-execute-plan/scripts/execution-increment-delivery.mjs" \
        deliver --workspace "${execution}" --branch "${branch}" \
        --previously-published-base "${starting}" --target-ref refs/heads/main \
        --repo owner/project --host "${host}" --default-checkout "${workspace}"
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
      ;;
    *) return 1 ;;
  esac
}
