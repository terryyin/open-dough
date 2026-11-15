#!/usr/bin/env bash
# One-shot escalation journey for the publication native harness: an unlisted
# one-shot request whose project check reveals a separate outcome is admitted
# to Taken as its own story, carrying the attempt's edits back uncommitted
# over the claim, and stops before planning; no result reaches remote trunk.
# Fixture, prompt, observation, assessment and state counterexamples. Sourced
# by the runner beside git-publication-native-one-shot.sh.
# shellcheck disable=SC2034,SC2154,SC2312 # Shared fixture and assessor globals.

git_publication_one_shot_escalation_publisher=native-one-shot-escalation

# After the one-shot install: the publisher the substitute admits under, and
# the planted human edits alone, since the drafted story stays beside them.
git_publication_one_shot_escalation_prepare() {
  export NATIVE_ONE_SHOT_PUBLISHER=${git_publication_one_shot_escalation_publisher}
  git_publication_admission_human_before=$(
    git_publication_admission_capture_human "${git_publication_fixture_integration}"
  )
}

# Names the request, workspace, branch, publisher and publication authority
# only: whatever the request turns out to need is for the agent to find.
git_publication_one_shot_escalation_prompt() {
  printf '%s\n' \
    "Use this project's installed Open Dough guidance. As one-shot work, rename the configuration key notesDir to notesDirectory. The originating and integration checkout is ${git_publication_fixture_integration}; use ${NATIVE_ONE_SHOT_WORKSPACE} on local branch ${NATIVE_ONE_SHOT_BRANCH} as the owned execution workspace. Remote origin trunk is refs/heads/main. Your stable execution publisher ID is ${git_publication_one_shot_escalation_publisher}. You have explicit authority to create that workspace and publish to remote trunk. Preserve existing local changes. Report the outcome."
}

# Observes the escalation journey $1 after a session whose stream $3 from host
# $4 ended with status $2.
git_publication_fixture_observe_one_shot_escalation() {
  local journey=$1 stream_status=$2 transcript=$3 host=$4
  local origin=${git_publication_fixture_origin}
  local workspace=${NATIVE_ONE_SHOT_WORKSPACE}
  local base=${git_publication_fixture_trunk_sha} tip pushes tips
  local human_after head=
  tip=$(git -C "${origin}" rev-parse refs/heads/main)
  pushes=$(node "${source_dir}/Distribution/evaluation/cases/git-publication/git-publication-native-push-log-observe.mjs" \
    "${source_dir}" "${origin}" "${git_publication_fixture_root}/push.log" "${base}")
  tips=$(sed -n 's/^pushed-tip: \([0-9a-f]*\) .*/\1/p' <<< "${pushes}")
  human_after=$(git_publication_admission_capture_human "${git_publication_fixture_integration}")
  [[ ! -d ${workspace} ]] || head=$(git -C "${workspace}" rev-parse HEAD)
  printf 'journey: %s\n' "${journey}"
  printf 'stream-status: %s\n' "${stream_status}"
  git_publication_stream_fields "${journey}" "${host}" "${transcript}"
  printf 'base-sha: %s\n' "${base}"
  printf 'remote-sha: %s\n' "${tip}"
  printf 'trunk-commit-count: %s\n' \
    "$(git -C "${origin}" rev-list --count "${base}..${tip}")"
  printf '%s\n' "${pushes}"
  # Paths outside planning records that any pushed or current trunk tip
  # changed since the base: a result that reached remote trunk.
  printf 'trunk-product-paths: %s\n' "$(
    for commit in ${tips} "${tip}"; do
      git -C "${origin}" log --format= --name-only "${base}..${commit}" \
        -- . ':(exclude).planning'
    done | grep . | LC_ALL=C sort -u | paste -sd, - || true
  )"
  printf 'workspace-on-claim: %s\n' \
    "$([[ -n ${head} && ${head} == "${tip}" ]] && echo true || echo false)"
  printf 'workspace-edits: %s\n' "$(
    [[ -z ${head} ]] || git -C "${workspace}" status --porcelain \
      -- . ':(exclude).planning' | cut -c4- | paste -sd, -
  )"
  printf 'human-edit-preserved: %s\n' \
    "$([[ ${human_after} == "${git_publication_admission_human_before}" ]] && echo true || echo false)"
}

# Signals for rejected cases. The trunk tip's SHA and commit count, and
# whether the workspace sits on that tip, move with every change to trunk.
# assessor-signal: stream stream-status
# assessor-signal: human-edit human-edit-preserved
# assessor-signal: one-shot-start one-shot-start-observed
# assessor-signal: carry-admission carry-admission-observed
# assessor-signal: carried-edits edits-carried workspace-edits workspace-on-claim
# assessor-signal: admission-claim remote-sha trunk-commit-count taken-added workspace-on-claim
# assessor-signal: trunk-result remote-sha trunk-commit-count trunk-product-paths workspace-on-claim ref-update-count trunk-push-count pushed-tip pushed-taken forced-trunk-push-count
git_publication_assess_one_shot_escalation() {
  local obs=$1 key
  local stream_status human_edit_preserved trunk_product_paths taken_added
  local trunk_commit_count workspace_on_claim workspace_edits
  local one_shot_start_observed carry_admission_observed edits_carried
  for key in stream-status human-edit-preserved trunk-product-paths \
    taken-added trunk-commit-count workspace-on-claim workspace-edits \
    one-shot-start-observed carry-admission-observed edits-carried; do
    printf -v "${key//-/_}" '%s' "$(git_publication_assess_field "${obs}" "${key}")"
  done
  if [[ ${stream_status} != complete ]]; then
    git_publication_assess_fail "incomplete or stale native stream (${stream_status})"
  elif [[ ${human_edit_preserved} != true ]]; then
    git_publication_assess_fail 'human edits in the originating checkout changed'
  elif [[ -n ${trunk_product_paths} ]]; then
    git_publication_assess_fail "a result commit reached remote trunk (${trunk_product_paths})"
  elif [[ -z ${taken_added} || ${taken_added} == *,* ]]; then
    git_publication_assess_fail 'remote trunk did not gain exactly one admitted Taken story'
  elif [[ ${trunk_commit_count} != 1 ]]; then
    git_publication_assess_fail 'remote trunk gained more than the admission claim'
  elif [[ ${one_shot_start_observed} != true || ${carry_admission_observed} != true ||
    ${edits_carried} != true ]]; then
    git_publication_assess_status=inconclusive
    git_publication_assess_reason='the work was admitted without carrying one-shot edits; escalation was not exercised'
  elif [[ ${workspace_on_claim} != true || -z ${workspace_edits} ]]; then
    git_publication_assess_fail "the attempt's carried edits are not uncommitted over the claim in its workspace"
  else
    git_publication_assess_status=pass
    git_publication_assess_reason="the grown one-shot attempt was admitted as ${taken_added} and its edits restored uncommitted over the claim"
  fi
}
