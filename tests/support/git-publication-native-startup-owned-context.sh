#!/usr/bin/env bash
# Observation and assessment of queued startup from an owned repository
# context alone: the session starts Story A in a new owned workspace at
# fetched trunk, naming the retained worktree as repository context and no
# default checkout, and leaves the retained worktree and its ready-looking
# local copy of Story A untouched. Sourced by the owned-context journeys.
# shellcheck disable=SC2034,SC2154,SC2312 # Shared fixture and assessor globals.

# Observes journey $1 after a session whose stream $3 from host $4 ended with
# status $2.
git_publication_observe_startup_owned_context() {
  local journey=$1 stream_status=$2 transcript=$3 host=$4
  local origin=${git_publication_fixture_origin} root=${git_publication_fixture_root}
  local workspace=${git_publication_fixture_workspace} base=${git_publication_fixture_trunk_sha}
  local claim parent=none source=missing seed=.planning/seeds/A.md
  local taken=false ordered=false expected actual
  claim=$(git -C "${origin}" log --format=%H \
    --grep='Claim-Publisher: native-startup-owned-context' refs/heads/main | tail -n 1)
  if [[ -n ${claim} ]]; then
    parent=$(git -C "${origin}" rev-parse "${claim}^")
    if git_publication_lists_taken "${origin}" "${claim}" 'SEED-A#a'; then taken=true; fi
    if [[ ! -f ${workspace}/${seed} ]]; then
      source=missing
    elif git -C "${origin}" show "${claim}:${seed}" | cmp -s - "${workspace}/${seed}"; then
      source=published
    elif cmp -s "${git_publication_owned_retained}/${seed}" "${workspace}/${seed}"; then
      source=local-copy
    else
      source=other
    fi
  fi
  if git_publication_in_order "${root}/claim-accepted" \
    "${root}/.setup-ran" "${root}/.command-ran" "${workspace}/feature.txt"; then
    ordered=true
  fi
  expected=$(printf '%s\n' "${git_publication_owned_retained}" "${workspace}" | LC_ALL=C sort)
  actual=$(git_publication_other_checkouts "${git_publication_owned_repository}")
  printf 'journey: %s\n' "${journey}"
  printf 'stream-status: %s\n' "${stream_status}"
  git_publication_stream_fields "${journey}" "${host}" "${transcript}"
  printf 'fetched-sha: %s\n' "${base}"
  printf 'claim-sha: %s\n' "${claim:-none}"
  printf 'claim-parent: %s\n' "${parent}"
  printf 'taken-on-remote: %s\n' "${taken}"
  printf 'workspace-branch: %s\n' \
    "$(git -C "${workspace}" branch --show-current 2> /dev/null || echo none)"
  printf 'expected-branch: %s\n' "${NATIVE_OWNED_BRANCH}"
  printf 'workspace-source: %s\n' "${source}"
  printf 'setup-exists: %s\n' "$([[ -f ${root}/.setup-ran ]] && echo true || echo false)"
  printf 'command-exists: %s\n' "$([[ -f ${root}/.command-ran ]] && echo true || echo false)"
  printf 'feature-exists: %s\n' "$([[ -f ${workspace}/feature.txt ]] && echo true || echo false)"
  printf 'claim-setup-command-feature-ordered: %s\n' "${ordered}"
  printf 'retained-unchanged: %s\n' "$(
    [[ $(git_publication_owned_capture "${git_publication_owned_retained}") == "${git_publication_owned_retained_before}" ]] \
      && echo true || echo false
  )"
  printf 'other-checkouts: %s\n' "$(paste -sd, - <<< "${actual}")"
  printf 'checkouts-expected: %s\n' "$([[ ${actual} == "${expected}" ]] && echo true || echo false)"
}

git_publication_assess_startup_owned_context() {
  local obs=$1 key
  local stream_status startup_cli_count integration_flag_count repository_flag_count
  local fetched_sha claim_sha claim_parent taken_on_remote workspace_branch
  local expected_branch workspace_source setup_exists command_exists feature_exists
  local claim_setup_command_feature_ordered retained_unchanged checkouts_expected
  for key in stream-status startup-cli-count integration-flag-count \
    repository-flag-count fetched-sha claim-sha claim-parent taken-on-remote \
    workspace-branch expected-branch workspace-source setup-exists \
    command-exists feature-exists claim-setup-command-feature-ordered \
    retained-unchanged checkouts-expected; do
    printf -v "${key//-/_}" '%s' "$(git_publication_assess_field "${obs}" "${key}")"
  done
  if [[ ${stream_status} != complete || ! ${startup_cli_count} =~ ^[1-9][0-9]*$ ]]; then
    git_publication_assess_fail 'native startup command was not observed in a complete stream'
  elif [[ ${integration_flag_count} != 0 ]]; then
    git_publication_assess_fail 'startup was given a default checkout (--integration)'
  elif [[ ${repository_flag_count} == 0 ]]; then
    git_publication_assess_fail 'startup did not name the owned repository context (--repository)'
  elif [[ ${retained_unchanged} != true ]]; then
    git_publication_assess_fail 'the retained worktree changed'
  elif [[ ${claim_sha} == none || ${taken_on_remote} != true ||
    ${claim_parent} != "${fetched_sha}" ]]; then
    git_publication_assess_fail "remote trunk lacks this execution's Taken claim on the fetched trunk"
  elif [[ ${workspace_branch} != "${expected_branch}" ||
    ${checkouts_expected} != true ]]; then
    git_publication_assess_fail 'the repository lacks exactly the retained worktree and the new workspace on its branch'
  elif [[ ${workspace_source} != published ]]; then
    git_publication_assess_fail "the new workspace does not hold the published source (${workspace_source})"
  elif [[ ${setup_exists} != true || ${command_exists} != true ||
    ${feature_exists} != true || ${claim_setup_command_feature_ordered} != true ]]; then
    git_publication_assess_fail 'implementation or project setup crossed claim boundary incorrectly'
  else
    git_publication_assess_status=pass
    git_publication_assess_reason='startup from the owned repository context claimed on fetched trunk in a new workspace and left the retained worktree untouched'
  fi
}
