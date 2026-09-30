#!/usr/bin/env bash
# The land-default-checkout journey of the publication native harness: the
# developer changed the default main checkout and asks Dough Land to land it.
# The checkout holds a tracked edit, an untracked file and one unpushed local
# commit, while another writer has advanced origin; a linked worktree of the
# repository stands beside it. Fixture, observation, prompt and assessment.
# Sourced by the runner.
# shellcheck disable=SC2034,SC2154,SC2312 # Shared fixture and assessor globals.

git_publication_land_default_other_sha=

# Builds the bare origin and the default checkout on main holding the base
# commit, under parent $1.
git_publication_fixture_create_land_default() {
  git_publication_fixture_create_trunk_pair "$@"
  git_publication_fixture_workspace=
}

# After the installed guidance is committed to trunk: a linked worktree that
# must survive, another writer's push that moves origin, then the developer's
# local commit, tracked edit and untracked file on the default checkout. Every
# push origin accepts from here on is recorded.
git_publication_land_default_plant() {
  local checkout=${git_publication_fixture_integration}
  local root=${git_publication_fixture_root} other
  git_publication_land_default_sibling="${root}/sibling"
  git_publication_fixture_git "${checkout}" worktree add -q -b exec/sibling \
    "${git_publication_land_default_sibling}"
  other=$(mktemp -d "${root}/other.XXXXXX")
  git -C "${git_publication_fixture_origin}" clone --quiet \
    "${git_publication_fixture_origin}" "${other}"
  printf 'other writer\n' > "${other}/other-writer.txt"
  git_publication_fixture_git "${other}" add other-writer.txt
  git_publication_fixture_git "${other}" commit --quiet -m "another writer's increment"
  git_publication_fixture_git "${other}" push --quiet origin main
  git_publication_land_default_other_sha=$(git -C "${other}" rev-parse HEAD)
  rm -rf -- "${other}"
  git_publication_record_pushes "${git_publication_fixture_origin}" "${root}"
  printf 'local work\n' > "${checkout}/land-local.txt"
  git_publication_fixture_git "${checkout}" add land-local.txt
  git_publication_fixture_git "${checkout}" commit --quiet -m 'local work'
  printf 'base\nlanding edit\n' > "${checkout}/trunk.txt"
  printf 'new file\n' > "${checkout}/land-untracked.txt"
}

# After installing the guidance into the default checkout: commit it to trunk,
# so the session's landing holds only the developer's changes, then plant them.
git_publication_land_default_publish_install() {
  local integration=${git_publication_fixture_integration}
  git_publication_fixture_git "${integration}" add -A
  git_publication_fixture_git "${integration}" commit -qm 'install Open Dough guidance'
  git_publication_fixture_git "${integration}" push -q origin main
  git_publication_fixture_trunk_sha=$(git -C "${integration}" rev-parse HEAD)
  git_publication_land_default_plant
}

git_publication_land_default_prompt() {
  printf '%s\n' \
    "Use this project's installed Open Dough guidance. Use Dough Land: land it. My changes are in this default checkout, ${git_publication_fixture_integration}, which is on main: a tracked edit, a new untracked file and one local commit that is not pushed yet. Remote origin trunk is refs/heads/main, and you have explicit authority to publish there. Report the outcome."
}

# Whether file $2 at revision $1 of origin reads $3.
git_publication_land_default_reads() {
  [[ $(git -C "${git_publication_fixture_origin}" show "$1:$2" 2> /dev/null) == "$3" ]] \
    && echo true || echo false
}

# Observes journey $1 after a session whose stream $3 from host $4 ended with
# status $2.
git_publication_observe_land_default() {
  local journey=$1 stream_status=$2 transcript=$3 host=$4
  local origin=${git_publication_fixture_origin}
  local checkout=${git_publication_fixture_integration} tip pushes stream_fields
  tip=$(git -C "${origin}" rev-parse refs/heads/main)
  pushes=$(node "${source_dir}/tests/support/git-publication-native-push-log-observe.mjs" \
    "${source_dir}" "${origin}" "${git_publication_fixture_root}/push.log")
  stream_fields=$(git_publication_stream_fields "${journey}" "${host}" "${transcript}")
  printf 'journey: %s\n' "${journey}"
  printf 'stream-status: %s\n' "${stream_status}"
  printf '%s\n' "${stream_fields}"
  grep '^forced-trunk-push-count: ' <<< "${pushes}" || true
  printf 'other-writer-kept: %s\n' "$(
    git -C "${origin}" merge-base --is-ancestor \
      "${git_publication_land_default_other_sha}" "${tip}" 2> /dev/null \
      && echo true || echo false
  )"
  printf 'landing-commit-count: %s\n' "$(
    git -C "${origin}" rev-list --count \
      "${git_publication_land_default_other_sha}..${tip}" \
      -- trunk.txt land-untracked.txt 2> /dev/null || echo 0
  )"
  printf 'tracked-edit-landed: %s\n' \
    "$(git_publication_land_default_reads "${tip}" trunk.txt $'base\nlanding edit')"
  printf 'untracked-landed: %s\n' \
    "$(git_publication_land_default_reads "${tip}" land-untracked.txt 'new file')"
  printf 'local-commit-landed: %s\n' \
    "$(git_publication_land_default_reads "${tip}" land-local.txt 'local work')"
  printf 'checkout-clean: %s\n' \
    "$([[ -z $(git -C "${checkout}" status --porcelain) ]] && echo true || echo false)"
  printf 'checkout-at-remote: %s\n' \
    "$([[ $(git -C "${checkout}" rev-parse HEAD) == "${tip}" ]] && echo true || echo false)"
  printf 'sibling-worktree-present: %s\n' "$(
    [[ -d ${git_publication_land_default_sibling} ]] \
      && git -C "${checkout}" show-ref --quiet --verify refs/heads/exec/sibling \
      && echo true || echo false
  )"
}

# Signals for rejected cases. A landing that rewrote origin's history breaks
# both the descent from the other writer's tip and the push log's forced count.
# assessor-signal: force-push forced-trunk-push-count other-writer-kept
# assessor-signal: single-landing landing-commit-count
# assessor-signal: file-landed tracked-edit-landed untracked-landed
# assessor-signal: local-commit local-commit-landed
# assessor-signal: retirement retirement-command-observed
# assessor-signal: checkout-clean checkout-clean
# assessor-signal: checkout-behind checkout-at-remote
# assessor-signal: worktree-kept sibling-worktree-present
git_publication_assess_land_default() {
  local obs=$1 key
  local stream_status forced_trunk_push_count other_writer_kept
  local landing_commit_count tracked_edit_landed untracked_landed
  local local_commit_landed checkout_clean checkout_at_remote
  local sibling_worktree_present retirement_command_observed
  for key in stream-status forced-trunk-push-count other-writer-kept \
    landing-commit-count tracked-edit-landed untracked-landed \
    local-commit-landed checkout-clean checkout-at-remote \
    sibling-worktree-present retirement-command-observed; do
    printf -v "${key//-/_}" '%s' "$(git_publication_assess_field "${obs}" "${key}")"
  done
  if [[ ${stream_status} != complete ]]; then
    git_publication_assess_fail "incomplete or stale native stream (${stream_status})"
  elif [[ ${forced_trunk_push_count} != 0 || ${other_writer_kept} != true ]]; then
    git_publication_assess_fail 'remote trunk received a force push or lost the other writer'"'"'s commit'
  elif [[ ${retirement_command_observed} != false ]]; then
    git_publication_assess_fail 'a retirement command ran although the default checkout is not retired'
  elif [[ ${sibling_worktree_present} != true ]]; then
    git_publication_assess_fail 'a worktree was removed'
  elif [[ ${tracked_edit_landed} != true || ${untracked_landed} != true ]]; then
    git_publication_assess_fail 'remote trunk lacks the tracked edit or the untracked file'
  elif [[ ${local_commit_landed} != true ]]; then
    git_publication_assess_fail 'remote trunk lacks the unpushed local commit'
  elif [[ ${landing_commit_count} != 1 ]]; then
    git_publication_assess_fail "the checkout's files landed in ${landing_commit_count} commits, not one"
  elif [[ ${checkout_clean} != true || ${checkout_at_remote} != true ]]; then
    git_publication_assess_fail 'the default checkout is dirty or not at the accepted remote trunk'
  else
    git_publication_assess_status=pass
    git_publication_assess_reason='default checkout changes landed as one non-forced commit with the local commit, the checkout is clean at the accepted trunk, and nothing was retired'
  fi
}

# Rejected cases of the assessor against passing observation $1: each changes
# one declared signal.
run_land_default_assessor_counterexamples() {
  git_publication_suite_counterexamples \
    "${source_dir}/tests/support/git-publication-native-land-default.sh" "$1"
  native_assessor_rejects_field_rows << 'EOF2'
forced-push force-push forced-trunk-push-count: 1 | force push
rewritten-history force-push other-writer-kept: false | force push
file-left-uncommitted file-landed untracked-landed: false | tracked edit or the untracked file
tracked-edit-left file-landed tracked-edit-landed: false | tracked edit or the untracked file
local-commit-dropped local-commit local-commit-landed: false | unpushed local commit
split-landing single-landing landing-commit-count: 2 | not one
retirement-ran retirement retirement-command-observed: true | retirement command
checkout-dirty checkout-clean checkout-clean: false | dirty or not at
checkout-behind checkout-behind checkout-at-remote: false | dirty or not at
worktree-removed worktree-kept sibling-worktree-present: false | worktree was removed
EOF2
}
