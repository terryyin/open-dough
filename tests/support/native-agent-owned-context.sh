#!/usr/bin/env bash
# Owned-context journeys for the credential-free publication substitute.
# Sourced by native-agent-publication.sh (copied beside it) with ${host},
# ${journey} and ${workspace} (the retained owned worktree the host runs in)
# set. Runs the installed CLIs and Git the guidance names, in its order, so
# observations come from real repository state, with no default checkout:
# startup-owned-context starts Story A in a new owned workspace from the
# retained worktree as repository context, runs project setup there and
# writes the feature; preparation-land announces, refines, records and
# releases Story C in the retained worktree, then lands and retires it;
# trunk-closure-owned-context publishes the final closure through managed
# delivery, completes CI observation, then retires the worktree. Emits each command
# through the admission substitute's recorder and sets ${response}.
# NATIVE_OWNED_WORKSPACE, _BRANCH and _IDENTITY carry the journey's workspace,
# branch and story; TRUNK_CLOSURE_MAILBOX, _CANDIDATE_SHA and _IDENTITY the
# closure's.
# shellcheck disable=SC2034,SC2154 # host, journey, workspace and response are shared with the sourcing substitute.

# shellcheck source=tests/support/native-agent-admission.sh
# shellcheck disable=SC1091
source "${0%/*}/native-agent-admission.sh"

native_owned_context_substitute() {
  local skills
  skills=$(admission_installed)
  case ${journey} in
    startup-owned-context)
      admission_run node "${skills}/dough-execute-plan/scripts/execution-start.mjs" \
        start --repository "${workspace}" --workspace "${NATIVE_OWNED_WORKSPACE}" \
        --branch "${NATIVE_OWNED_BRANCH}" --identity "${NATIVE_OWNED_IDENTITY}" \
        --publisher-id native-startup-owned-context --mode trunk --remote origin \
        --target main --push-authorized --workspace-authorized --host "${host}"
      admission_run_in "${NATIVE_OWNED_WORKSPACE}" node scripts/setup.js
      admission_run_in "${NATIVE_OWNED_WORKSPACE}" node scripts/command.js
      printf 'implemented\n' > "${NATIVE_OWNED_WORKSPACE}/feature.txt"
      admission_record "write feature.txt" ''
      response="Claimed ${NATIVE_OWNED_IDENTITY} on remote trunk from the owned worktree alone, created ${NATIVE_OWNED_WORKSPACE} at fetched trunk, ran project setup there and implemented feature.txt. Refresh was not applicable."
      ;;
    preparation-land)
      native_owned_context_prepare_and_land "${skills}"
      response="Announced ${NATIVE_OWNED_IDENTITY} as Preparing, refined it, and landed it with its release on remote trunk. Refresh was not applicable; the worktree and its branch were retired."
      ;;
    trunk-closure-owned-context)
      native_owned_context_close_trunk "${skills}"
      response="Published the final closure, CI coverage was not required and the observer shut down, then the worktree and its branch were retired from the repository's Git directory. Refresh was not applicable."
      ;;
    *) return 1 ;;
  esac
}

native_owned_context_prepare_and_land() {
  local skills=$1 seed="${workspace}/.planning/seeds/C.md"
  local assignment="${skills}/dough-story-refinement/scripts/preparation-assignment.mjs"
  local story=(--identity "${NATIVE_OWNED_IDENTITY}" --remote origin --target main)
  admission_run node "${assignment}" start --workspace "${workspace}" \
    "${story[@]}" --push-authorized --host "${host}"
  awk '$0 == "Rough idea for C." {
      print "#### Goal"; print ""; print "A developer can export the release notes as plain text."
      print ""; print "#### Scope"; print ""; print "- One export command; formatting options are out of scope."
      print ""; print "#### Key examples"; print ""; print "1. Exporting two notes prints two lines."
      next
    } { print }' "${seed}" > "${seed}.next"
  mv -- "${seed}.next" "${seed}"
  admission_record "refine Story C" ''
  admission_run node "${skills}/dough-product-backlog/scripts/product-backlog.mjs" \
    record-state --identity "${NATIVE_OWNED_IDENTITY}" --link seeds/C.md#c \
    --refinement refined --approach unselected
  admission_run node "${assignment}" release --workspace "${workspace}" "${story[@]}"
  admission_run git add -A
  admission_run git commit -qm 'Refine Story C'
  admission_run git fetch -q origin
  admission_run git push -q origin HEAD:refs/heads/main
  native_owned_context_retire "${NATIVE_OWNED_BRANCH}" "${NATIVE_OWNED_IDENTITY}"
}

# Managed delivery publishes the candidate and registers it with the matching
# observer in process, with no register-push command.
native_owned_context_close_trunk() {
  local scripts="$1/dough-execute-plan/scripts"
  local sha=${TRUNK_CLOSURE_CANDIDATE_SHA} mailbox=${TRUNK_CLOSURE_MAILBOX} branch base
  branch=$(git -C "${workspace}" branch --show-current)
  admission_run git fetch -q origin
  base=$(git -C "${workspace}" rev-parse origin/main)
  admission_run node "${scripts}/execution-increment-delivery.mjs" deliver \
    --workspace "${workspace}" --branch "${branch}" --previously-published-base "${base}" \
    --target-ref refs/heads/main --repo owner/project --host "${host}" \
    --validated-candidate "${sha}"
  admission_run node "${scripts}/ci-mailbox.mjs" complete-revision "${mailbox}" "${sha}"
  native_owned_context_retire "${branch}" "${TRUNK_CLOSURE_IDENTITY}"
}

# Dough Land's retirement of ${workspace} on branch $1 from its management
# context, recorded before removal. The session holds no creation result, so it
# retires only when the workspace's creation record names its story $2.
native_owned_context_retire() {
  local branch=$1 identity=$2 common
  admission_run git for-each-ref --format='%(refname:lstrip=4)' \
    refs/worktree/dough/created-for/
  [[ ${admission_last} == "${identity}" ]] || return 0
  common=$(git -C "${workspace}" rev-parse --path-format=absolute --git-common-dir)
  admission_run_in "${common}" git fetch -q origin
  admission_run_in "${common}" git merge-base --is-ancestor "${branch}" origin/main
  admission_run_in "${common}" git worktree remove "${workspace}"
  admission_run_in "${common}" git branch -q --set-upstream-to origin/main "${branch}"
  admission_run_in "${common}" git branch -q -d "${branch}"
}
