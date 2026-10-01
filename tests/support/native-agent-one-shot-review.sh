#!/usr/bin/env bash
# One-shot review and refinement journeys for the credential-free publication
# substitute. Sourced by native-agent-one-shot.sh (copied beside it) with
# ${host} and ${workspace} (the originating checkout) set. Follows the
# installed one-shot guidance through its CLIs: start the owned workspace with
# --one-shot and workspace authority alone, commit the result (for
# refinement, the story's refined seed section and its facts recorded by the
# installed recorder), and stop for review. Sets ${response}.
# NATIVE_ONE_SHOT_WORKSPACE, _BRANCH and _IDENTITY carry the owned workspace,
# branch and refined story.
# NATIVE_ONE_SHOT_VARIANT=pushes also pushes the result to remote trunk, a
# whole-run counterexample.
# shellcheck disable=SC2034,SC2154,SC2312 # host, workspace and response are shared with the sourcing substitute.

native_one_shot_review_substitute() {
  local execution=${NATIVE_ONE_SHOT_WORKSPACE} branch=${NATIVE_ONE_SHOT_BRANCH}
  local skills
  skills=$(admission_installed)
  admission_run node "${skills}/dough-execute-plan/scripts/execution-start.mjs" \
    start --integration "${workspace}" --workspace "${execution}" \
    --branch "${branch}" --mode story-branch --remote origin \
    --target main --workspace-authorized --one-shot --host "${host}"
  printf 'Review line\n' >> "${execution}/notes.txt"
  admission_run_in "${execution}" git commit -qam 'Add a review line to notes'
  native_one_shot_review_variant "${execution}"
  response="Kept the one-shot result for review in ${execution} on branch ${branch}: its commit adds 'Review line' to notes.txt. Nothing was pushed; ask to land it when it is accepted. Existing local changes were preserved."
}

native_one_shot_refinement_substitute() {
  local execution=${NATIVE_ONE_SHOT_WORKSPACE} branch=${NATIVE_ONE_SHOT_BRANCH}
  local identity=${NATIVE_ONE_SHOT_IDENTITY} skills cli seed link basis
  skills=$(admission_installed)
  admission_run node \
    "${skills}/dough-story-refinement/scripts/preparation-assignment.mjs" \
    start --one-shot --integration "${workspace}" --workspace "${execution}" \
    --branch "${branch}" --identity "${identity}" --remote origin --target main
  cli="${execution}/${skills#"${workspace}"/}/dough-product-backlog/scripts/product-backlog.mjs"
  link=$(grep -e "— ${identity}\$" "${execution}/.planning/PRODUCT-BACKLOG.md" \
    | sed -E 's/^- \[[^]]*\]\(([^)]*)\).*/\1/')
  seed="${execution}/.planning/${link%%#*}"
  perl -0pi -e 's/(Release notes should also credit Story B2: .*?\n)/$1\n**Goal:** Release notes credit Story B2.\n\n**Scope:** One line appended to notes.txt; no other file changes.\n\n**Key example:** notes.txt ends with the line \x27Story B2 line\x27.\n/' \
    "${seed}"
  admission_run_in "${execution}" node "${cli}" record-state --identity "${identity}" \
    --link "${link}" --refinement refined --approach unselected
  admission_run_in "${execution}" node "${cli}" read-state --link "${link}"
  basis=$(jq -r .basis.document <<< "${admission_last}")
  admission_run_in "${execution}" node "${cli}" record-state --identity "${identity}" \
    --link "${link}" --refinement refined --approach unselected \
    --assessment not-ready --reason 'No execution approach is selected.' \
    --expect-document "${basis}"
  admission_run_in "${execution}" git commit -qam "Refine ${identity}"
  native_one_shot_review_variant "${execution}"
  response="Refined ${identity} as one-shot work in ${execution} on branch ${branch}: the seed records goal, scope and a key example, refined with an unselected approach and assessed not ready. Remote trunk still lists the story in the Backlog list with no Preparing assignment; nothing was pushed. Existing local changes were preserved."
}

# Applies NATIVE_ONE_SHOT_VARIANT to the result committed in workspace $1.
native_one_shot_review_variant() {
  case ${NATIVE_ONE_SHOT_VARIANT:-} in
    '') ;;
    pushes) admission_run_in "$1" git push -q origin HEAD:refs/heads/main ;;
    *) return 1 ;;
  esac
}
