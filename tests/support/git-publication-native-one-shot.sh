#!/usr/bin/env bash
# One-shot journeys for the publication native harness: explicitly requested
# one-shot work asked to land publishes only its verified result to remote
# trunk and retires its owned workspace, or keeps it, reported, when its
# delivery receipt left the landed revision's CI unobserved
# (git-publication-native-one-shot-unobserved.sh); a queued story completed
# that way reaches trunk as one commit holding its result and its closure,
# never shown Taken. Without a landing request, the review and refinement
# journeys (git-publication-native-one-shot-review.sh and -refinement.sh) stop
# for review. The default-checkout, automatic-landing, blocked, established and
# landed-refinement journeys have their own files, sourced below; automatic
# landing is observed and assessed here with the landing journeys. Prompt,
# observation and assessment; the fixture is in
# git-publication-native-one-shot-fixture.sh. Sourced by the runner.
# shellcheck disable=SC2034,SC2154,SC2312 # Shared fixture and assessor globals.

# shellcheck source=tests/support/git-publication-native-one-shot-fixture.sh
# shellcheck disable=SC1091
source "$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)/git-publication-native-one-shot-fixture.sh"
# shellcheck source=tests/support/git-publication-native-one-shot-queued.sh
# shellcheck disable=SC1091
source "$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)/git-publication-native-one-shot-queued.sh"
# shellcheck source=tests/support/git-publication-native-one-shot-unobserved.sh
# shellcheck disable=SC1091
source "$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)/git-publication-native-one-shot-unobserved.sh"
# shellcheck source=tests/support/git-publication-native-one-shot-counterexamples.sh
# shellcheck disable=SC1091
source "$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)/git-publication-native-one-shot-counterexamples.sh"
# shellcheck source=tests/support/git-publication-native-one-shot-retained.sh
# shellcheck disable=SC1091
source "$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)/git-publication-native-one-shot-retained.sh"
# shellcheck source=tests/support/git-publication-native-one-shot-review.sh
# shellcheck disable=SC1091
source "$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)/git-publication-native-one-shot-review.sh"
# shellcheck source=tests/support/git-publication-native-one-shot-refinement.sh
# shellcheck disable=SC1091
source "$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)/git-publication-native-one-shot-refinement.sh"
# shellcheck source=tests/support/git-publication-native-one-shot-default-main.sh
# shellcheck disable=SC1091
source "$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)/git-publication-native-one-shot-default-main.sh"
# shellcheck source=tests/support/git-publication-native-one-shot-auto-land.sh
# shellcheck disable=SC1091
source "$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)/git-publication-native-one-shot-auto-land.sh"
# shellcheck source=tests/support/git-publication-native-one-shot-refinement-auto-land.sh
# shellcheck disable=SC1091
source "$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)/git-publication-native-one-shot-refinement-auto-land.sh"
# shellcheck source=tests/support/git-publication-native-one-shot-established.sh
# shellcheck disable=SC1091
source "$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)/git-publication-native-one-shot-established.sh"

# The landing journeys' prompts: each asks to land its one-shot result, by
# request or by selecting automatic landing.
git_publication_one_shot_prompt() {
  local request
  case $1 in
    one-shot-default-main)
      git_publication_one_shot_default_main_prompt
      return
      ;;
    one-shot-auto-land | one-shot-auto-land-blocked)
      git_publication_one_shot_auto_land_prompt "$1"
      return
      ;;
    one-shot-established)
      git_publication_one_shot_established_prompt
      return
      ;;
    one-shot-refinement-auto-land)
      git_publication_one_shot_refinement_auto_land_prompt
      return
      ;;
    one-shot-result)
      request="As one-shot work, add the line 'One-shot line' to the end of notes.txt, and land the result on remote trunk."
      ;;
    one-shot-queued)
      request="Complete the queued story Story B (${NATIVE_ONE_SHOT_IDENTITY}) from the product backlog as one-shot work, and land the result on remote trunk."
      ;;
    *) return 2 ;;
  esac
  printf '%s\n' \
    "Use this project's installed Open Dough guidance. ${request} The originating and integration checkout is ${git_publication_fixture_integration}; use ${NATIVE_ONE_SHOT_WORKSPACE} on local branch ${NATIVE_ONE_SHOT_BRANCH} as the owned execution workspace. Remote origin trunk is refs/heads/main. You have explicit authority to create that workspace and publish to remote trunk. Preserve existing local changes. Report the outcome."
}

# Observes one-shot journey $1 after a session whose stream $3 from host $4
# ended with status $2; its report is $5 (by default beside the stream).
git_publication_fixture_observe_one_shot() {
  local journey=$1 stream_status=$2 transcript=$3 host=$4
  local response=${5:-${3%/*}/response.md}
  local origin=${git_publication_fixture_origin}
  local base=${git_publication_fixture_trunk_sha} tip ancestor=false
  local branch=${NATIVE_ONE_SHOT_BRANCH} human_after planning_paths
  tip=$(git -C "${origin}" rev-parse refs/heads/main)
  if git -C "${origin}" merge-base --is-ancestor "${base}" "${tip}"; then
    ancestor=true
  fi
  human_after=$(git_publication_fixture_capture_human "${git_publication_fixture_integration}")
  printf 'journey: %s\n' "${journey}"
  printf 'stream-status: %s\n' "${stream_status}"
  git_publication_stream_fields "${journey}" "${host}" "${transcript}"
  printf 'base-sha: %s\n' "${base}"
  printf 'remote-sha: %s\n' "${tip}"
  printf 'base-ancestor: %s\n' "${ancestor}"
  printf 'trunk-commit-count: %s\n' \
    "$(git -C "${origin}" rev-list --count "${base}..${tip}")"
  planning_paths=$(
    git -C "${origin}" log --format= --name-only "${base}..${tip}" \
      | grep -E '^\.planning/(PRODUCT-BACKLOG\.md$|seeds/|slice-plans/|agents/)' \
      | LC_ALL=C sort -u || true
  )
  printf 'planning-paths: %s\n' "$(paste -sd, - <<< "${planning_paths}")"
  printf 'result-changed: %s\n' \
    "$(git -C "${origin}" diff --quiet "${base}" "${tip}" -- notes.txt && echo false || echo true)"
  printf 'workspace-present: %s\n' \
    "$([[ -e ${NATIVE_ONE_SHOT_WORKSPACE} ]] && echo true || echo false)"
  printf 'branch-present: %s\n' "$(
    git -C "${git_publication_fixture_integration}" show-ref --quiet --verify "refs/heads/${branch}" \
      || git -C "${origin}" show-ref --quiet --verify "refs/heads/${branch}" \
      && echo true || echo false
  )"
  git_publication_one_shot_observe_report_kept "${response}"
  printf 'human-edit-preserved: %s\n' \
    "$([[ ${human_after} == "${git_publication_fixture_human_before}" ]] && echo true || echo false)"
  node "${source_dir}/tests/support/git-publication-native-push-log-observe.mjs" \
    "${source_dir}" "${origin}" "${git_publication_fixture_root}/push.log"
  if [[ ${journey} == one-shot-queued ]]; then
    git_publication_one_shot_observe_closure "${base}" "${tip}" "${planning_paths}"
  fi
}

# Observes one-shot journey $1 through that journey's observer, with the
# observer's arguments "$@".
git_publication_fixture_observe_one_shot_journey() {
  case $1 in
    one-shot-escalation) git_publication_fixture_observe_one_shot_escalation "$@" ;;
    one-shot-review) git_publication_fixture_observe_one_shot_review "$@" ;;
    one-shot-refinement) git_publication_fixture_observe_one_shot_refinement "$@" ;;
    one-shot-default-main) git_publication_fixture_observe_one_shot_default_main "$@" ;;
    one-shot-auto-land-blocked) git_publication_fixture_observe_one_shot_blocked "$@" ;;
    one-shot-established) git_publication_fixture_observe_one_shot_established "$@" ;;
    one-shot-refinement-auto-land)
      git_publication_fixture_observe_one_shot_refinement_auto_land "$@"
      ;;
    *) git_publication_fixture_observe_one_shot "$@" ;;
  esac
}

# Signals for rejected cases, with the queued story's closure assessed in
# git-publication-native-one-shot-queued.sh. The trunk tip's SHA and the
# planning paths its commits touched move with every change to trunk content.
# assessor-signal: stream stream-status
# assessor-signal: human-edit human-edit-preserved
# assessor-signal: trunk-history remote-sha base-ancestor trunk-commit-count
# assessor-signal: result remote-sha result-changed
# assessor-signal: planning remote-sha planning-paths other-planning-paths
# assessor-signal: pushes ref-update-count trunk-push-count pushed-tip pushed-taken forced-trunk-push-count
# assessor-signal: workspace workspace-present branch-present
# assessor-signal: ci-coverage ci-observed-shas ci-unobserved-shas
# assessor-signal: report report-names-kept
# assessor-signal: story-entry remote-sha planning-paths story-listed queue-kept
# assessor-signal: story-section remote-sha planning-paths story-section-present
# assessor-signal: story-plan remote-sha planning-paths plan-present
# assessor-signal: sibling remote-sha planning-paths sibling-section-present queue-kept
# assessor-signal: auto-land-start one-shot-start-observed one-shot-auto-land one-shot-push-authorized one-shot-default-main
git_publication_assess_one_shot() {
  local obs=$1 key
  local journey stream_status human_edit_preserved base_ancestor
  local trunk_commit_count planning_paths result_changed pushed_taken
  local workspace_present branch_present one_shot_start_observed
  local one_shot_auto_land one_shot_push_authorized start_keys=() retention=retired
  # Only automatic landing judges how the start ran.
  [[ $(git_publication_assess_field "${obs}" journey) != one-shot-auto-land ]] \
    || start_keys=(one-shot-start-observed one-shot-auto-land one-shot-push-authorized)
  for key in journey stream-status human-edit-preserved base-ancestor \
    trunk-commit-count planning-paths result-changed pushed-taken \
    workspace-present branch-present "${start_keys[@]}"; do
    printf -v "${key//-/_}" '%s' "$(git_publication_assess_field "${obs}" "${key}")"
  done
  if [[ ${workspace_present} != false || ${branch_present} != false ]]; then
    retention=$(git_publication_one_shot_retention "${obs}")
  fi
  if [[ ${stream_status} != complete ]]; then
    git_publication_assess_fail "incomplete or stale native stream (${stream_status})"
  elif [[ ${human_edit_preserved} != true ]]; then
    git_publication_assess_fail 'human edits in the originating checkout changed'
  elif [[ ${journey} == one-shot-auto-land && (${one_shot_start_observed} != true ||
    ${one_shot_auto_land} != true || ${one_shot_push_authorized} != true) ]]; then
    git_publication_assess_fail 'the work did not start through the one-shot automatic-landing start'
  elif [[ ${base_ancestor} != true || ${trunk_commit_count} != 1 ]]; then
    git_publication_assess_fail 'remote trunk did not gain exactly one commit since the base'
  elif [[ ${result_changed} != true ]]; then
    git_publication_assess_fail 'the trunk commit does not hold the requested result'
  elif [[ -n ${pushed_taken} ]]; then
    git_publication_assess_fail 'a push accepted by remote trunk listed work under Taken'
  elif [[ ${retention} == observed ]]; then
    git_publication_assess_fail 'the owned workspace or its branch survived though CI observation covered the landed revision'
  elif [[ ${retention} == unreported ]]; then
    git_publication_assess_fail "the owned workspace or its branch survived without a delivery receipt reporting the landed revision's CI unobserved"
  elif [[ ${retention} == silent ]]; then
    git_publication_assess_fail 'the owned workspace or its branch survived with CI unobserved, and the report names neither it nor the CI gap'
  elif [[ ${journey} == one-shot-queued ]]; then
    git_publication_assess_one_shot_closure "${obs}"
  elif [[ -n ${planning_paths} ]]; then
    git_publication_assess_fail 'the trunk commit touched backlog, seed, plan or agent profile records'
  else
    git_publication_assess_status=pass
    git_publication_assess_reason='only the one-shot result reached remote trunk and its workspace retired'
  fi
  if [[ ${git_publication_assess_status} == pass && ${retention} == kept ]]; then
    git_publication_assess_reason=${git_publication_assess_reason/%its workspace retired/its workspace was kept, reported, while CI went unobserved}
  fi
}
