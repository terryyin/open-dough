#!/usr/bin/env bash
# One-shot default-checkout, blocked automatic-landing and established-start
# journeys for the credential-free publication substitute. Sourced by
# native-agent-one-shot.sh (copied beside it) with ${host}, ${journey} and
# ${workspace} (the originating checkout) set. Follows the installed one-shot
# guidance through its CLIs:
#   one-shot-default-main: start the default checkout itself with --one-shot
#     --default-main and workspace authority alone, commit the result with all
#     existing checkout content, and stop for review.
#   one-shot-auto-land-blocked: start the owned workspace for the queued story
#     with --one-shot --auto-land --push-authorized, commit its result and
#     closure, deliver with the ownership guard, and stop at its
#     ownership-changed result.
#   one-shot-established: skip the start the harness already ran, commit the
#     queued story's result and closure in the workspace and branch the
#     prompt's established one-shot block names, and stop for review.
# Sets ${response}. NATIVE_ONE_SHOT_WORKSPACE, _BRANCH and _IDENTITY carry the
# workspace, branch and queued story.
# shellcheck disable=SC2034,SC2154,SC2312 # host, journey, workspace, args and response are shared with the sourcing substitute.

native_one_shot_policy_substitute() {
  local execution=${NATIVE_ONE_SHOT_WORKSPACE} branch=${NATIVE_ONE_SHOT_BRANCH}
  local identity=${NATIVE_ONE_SHOT_IDENTITY} skills starting
  skills=$(admission_installed)
  case ${journey} in
    one-shot-default-main)
      admission_run node "${skills}/dough-execute-plan/scripts/execution-start.mjs" \
        start --one-shot --default-main --workspace "${workspace}" \
        --mode story-branch --remote origin --target main \
        --workspace-authorized --host "${host}"
      printf 'Default line\n' >> "${workspace}/notes.txt"
      admission_run git add -A
      admission_run git commit -qm 'Add a default line to notes'
      response="Committed the one-shot result with the checkout's existing changes in the default checkout ${workspace} on main, after its earlier local commit. Nothing was pushed; ask to land it when it is accepted."
      ;;
    one-shot-auto-land-blocked)
      admission_run node "${skills}/dough-execute-plan/scripts/execution-start.mjs" \
        start --integration "${workspace}" --workspace "${execution}" \
        --branch "${branch}" --mode story-branch --remote origin \
        --target main --workspace-authorized --one-shot --auto-land \
        --push-authorized --identity "${identity}" --host "${host}"
      starting=$(jq -r .startingRevision <<< "${admission_last}")
      native_one_shot_policy_commit_story "${execution}" "${skills}"
      admission_run_in "${execution}" node \
        "${execution}/${skills#"${workspace}"/}/dough-execute-plan/scripts/execution-increment-delivery.mjs" \
        deliver --mode story-branch --tracking one-shot \
        --workspace "${execution}" --branch "${branch}" \
        --previously-published-base "${starting}" --target-ref refs/heads/main \
        --repo owner/project --host "${host}" --default-checkout "${workspace}" \
        --one-shot-identity "${identity}"
      response="Landing stopped: delivery reported ownership-changed because another owner has Taken ${identity}. Nothing was pushed; the committed result stays in ${execution} on branch ${branch}. Existing local changes were preserved."
      ;;
    one-shot-established)
      native_one_shot_policy_established || return 1
      native_one_shot_policy_commit_story "${execution}" "${skills}"
      response="Continued the established one-shot start in ${execution} on branch ${branch}: its commit completes ${identity} and adds 'Story B line' to notes.txt. Remote trunk still lists the story in the Backlog list; nothing was pushed. Ask to land it when it is accepted."
      ;;
    *) return 1 ;;
  esac
}

# Commits queued story ${identity}'s result and closure in execution
# workspace $1, with the originating checkout's installed skills $2.
native_one_shot_policy_commit_story() {
  local execution=$1
  printf 'Story B line\n' >> "${execution}/notes.txt"
  native_one_shot_close_story "${execution}" "${execution}/${2#"${workspace}"/}"
  admission_run_in "${execution}" git commit -qam "Complete ${identity} as one-shot work"
}

# Takes ${execution} and ${branch} from the established one-shot block among
# the host's arguments ${args[@]}, failing without one.
native_one_shot_policy_established() {
  local arg block=
  for arg in "${args[@]}"; do
    [[ ${arg} == *'- tracking: one-shot'* ]] && block=${arg}
  done
  execution=$(sed -n 's/^- workspace: //p' <<< "${block}")
  branch=$(sed -n 's/^- branch: //p' <<< "${block}")
  [[ -n ${execution} && -n ${branch} ]]
}
