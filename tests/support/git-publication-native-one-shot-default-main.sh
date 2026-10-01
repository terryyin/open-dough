#!/usr/bin/env bash
# One-shot default-checkout journey for the publication native harness: a
# developer asks for one-shot work directly in the default checkout, which
# holds staged, unstaged and untracked edits on top of an unpublished local
# commit. The start runs with --one-shot --default-main and no push
# authority, needs no clean checkout, creates no worktree or branch, and the
# result is committed in that checkout with all its existing content, after
# the local commit; nothing reaches the remote and the report names the
# checkout or its result commit for review. Preparation, prompt, observation,
# assessment and state counterexamples. Sourced by
# git-publication-native-one-shot.sh.
# shellcheck disable=SC2034,SC2154,SC2312 # Shared fixture and assessor globals.

# Commits a local note the remote never received on top of the published
# guidance, leaving the planted human edits as they are.
git_publication_one_shot_default_main_prepare() {
  local checkout=${git_publication_fixture_integration}
  printf 'local unpublished\n' > "${checkout}/local.txt"
  git -C "${checkout}" add local.txt
  git -C "${checkout}" commit -qm 'Record a local note' -- local.txt
  git_publication_one_shot_local_sha=$(git -C "${checkout}" rev-parse HEAD)
}

# The request in the direct invocation's words, naming the checkout only.
git_publication_one_shot_default_main_prompt() {
  printf '%s\n' \
    "Use this project's installed Open Dough guidance to run dough-execute-plan --one-shot --default-main: add the line 'Default line' to the end of notes.txt. The default checkout is ${git_publication_fixture_integration} on branch main; remote origin trunk is refs/heads/main. Report the outcome."
}

# Observes the default-checkout journey after a session whose stream $3 from
# host $4 ended with status $2; its report is $5 (by default beside the
# stream).
git_publication_fixture_observe_one_shot_default_main() {
  local journey=$1 stream_status=$2 transcript=$3 host=$4
  local response=${5:-${3%/*}/response.md}
  local checkout=${git_publication_fixture_integration}
  local local_sha=${git_publication_one_shot_local_sha} head line human committed=false
  head=$(git -C "${checkout}" rev-parse HEAD)
  # Prints path $1 as the checkout's HEAD holds it.
  default_main_show() {
    git -C "${checkout}" show "${head}:$1" 2> /dev/null || true
  }
  printf 'journey: %s\n' "${journey}"
  printf 'stream-status: %s\n' "${stream_status}"
  git_publication_stream_fields "${journey}" "${host}" "${transcript}"
  git_publication_one_shot_observe_remote
  printf 'worktree-count: %s\n' \
    "$(git -C "${checkout}" worktree list --porcelain | grep -c '^worktree ')"
  printf 'local-branches: %s\n' \
    "$(git -C "${checkout}" for-each-ref --format='%(refname:short)' refs/heads | paste -sd, -)"
  printf 'checkout-branch: %s\n' \
    "$(git -C "${checkout}" symbolic-ref -q --short HEAD || true)"
  printf 'local-commit-retained: %s\n' "$(
    git -C "${checkout}" merge-base --is-ancestor "${local_sha}" "${head}" \
      && echo true || echo false
  )"
  printf 'checkout-commit-count: %s\n' \
    "$(git -C "${checkout}" rev-list --count "${local_sha}..${head}")"
  printf 'checkout-clean: %s\n' \
    "$([[ -z $(git -C "${checkout}" status --porcelain) ]] && echo true || echo false)"
  printf 'checkout-changed-paths: %s\n' \
    "$(git -C "${checkout}" diff --name-only "${local_sha}" "${head}" | paste -sd, -)"
  line=$(git -C "${checkout}" show "${head}:notes.txt" 2> /dev/null | tail -n 1)
  printf 'result-line-present: %s\n' \
    "$([[ ${line} == 'Default line' ]] && echo true || echo false)"
  human=$(
    default_main_show human-staged.txt
    default_main_show trunk.txt
    default_main_show human-unstaged.txt
  )
  [[ ${human} != $'human index\nbase\nhuman changed tracked file\nhuman working tree' ]] \
    || committed=true
  printf 'human-content-committed: %s\n' "${committed}"
  printf 'report-names-checkout: %s\n' "$(
    [[ -r ${response} ]] && grep -Fq -e "${checkout}" -e "${head:0:7}" "${response}" \
      && echo true || echo false
  )"
}

# Signals for rejected cases. A remote's trunk tip and accepted updates move
# together; the checkout's commits, cleanliness, changed paths and committed
# content move together with whatever is committed there.
# assessor-signal: stream stream-status
# assessor-signal: one-shot-start one-shot-start-observed one-shot-default-main one-shot-push-authorized one-shot-auto-land
# assessor-signal: remote remote-sha ref-update-count trunk-push-count pushed-tip pushed-taken forced-trunk-push-count
# assessor-signal: isolation worktree-count local-branches
# assessor-signal: checkout checkout-branch local-commit-retained checkout-commit-count checkout-clean checkout-changed-paths result-line-present human-content-committed report-names-checkout
# assessor-signal: planning checkout-changed-paths report-names-checkout
# assessor-signal: report report-names-checkout
git_publication_assess_one_shot_default_main() {
  local obs=$1 key
  local stream_status one_shot_start_observed one_shot_default_main
  local one_shot_push_authorized one_shot_auto_land base_sha remote_sha
  local ref_update_count worktree_count local_branches checkout_branch
  local local_commit_retained checkout_commit_count checkout_clean
  local checkout_changed_paths result_line_present human_content_committed
  local report_names_checkout
  for key in stream-status one-shot-start-observed one-shot-default-main \
    one-shot-push-authorized one-shot-auto-land base-sha remote-sha \
    ref-update-count worktree-count local-branches checkout-branch \
    local-commit-retained checkout-commit-count checkout-clean \
    checkout-changed-paths result-line-present human-content-committed \
    report-names-checkout; do
    printf -v "${key//-/_}" '%s' "$(git_publication_assess_field "${obs}" "${key}")"
  done
  if [[ ${stream_status} != complete ]]; then
    git_publication_assess_fail "incomplete or stale native stream (${stream_status})"
  elif [[ ${one_shot_start_observed} != true || ${one_shot_default_main} != true ]]; then
    git_publication_assess_fail 'the work did not start through the one-shot default-checkout start'
  elif [[ ${one_shot_push_authorized} != false || ${one_shot_auto_land} != false ]]; then
    git_publication_assess_fail 'the one-shot start claimed push authority or automatic landing the request never granted'
  elif [[ ${remote_sha} != "${base_sha}" || ${ref_update_count} != 0 ]]; then
    git_publication_assess_fail 'the remote changed although no landing was requested'
  elif [[ ${worktree_count} != 1 || ${local_branches} != main ]]; then
    git_publication_assess_fail 'an extra worktree or branch was created beside the default checkout'
  elif [[ ${checkout_branch} != main || ${local_commit_retained} != true ]]; then
    git_publication_assess_fail "the default checkout left trunk or lost its earlier local commit"
  elif [[ ${checkout_commit_count} -lt 1 || ${result_line_present} != true ]]; then
    git_publication_assess_fail 'the requested result is not committed in the default checkout'
  elif [[ ${human_content_committed} != true ]]; then
    git_publication_assess_fail "the checkout's existing changes were not committed with the result"
  elif [[ ${checkout_clean} != true ]]; then
    git_publication_assess_fail 'the default checkout still holds uncommitted content'
  elif [[ ,${checkout_changed_paths}, == *,.planning/* ]]; then
    git_publication_assess_fail 'the result touched backlog, seed, plan or agent profile records'
  elif [[ ${report_names_checkout} != true ]]; then
    git_publication_assess_fail 'the report does not name the default checkout or its result commit for review'
  else
    git_publication_assess_status=pass
    git_publication_assess_reason='the result and existing changes wait committed in the default checkout and nothing reached the remote'
  fi
}

# Real-state counterexamples on a passing kept fixture of the journey,
# observed through host $2's transcript $1: each mutation alone is a rejected
# case of one signal, and undoing them all passes again.
run_one_shot_default_main_state_counterexamples() {
  local transcript=$1 host=$2 checkout=${git_publication_fixture_integration}
  local origin=${git_publication_fixture_origin} root=${git_publication_fixture_root}
  local base=${git_publication_fixture_trunk_sha} local_sha=${git_publication_one_shot_local_sha}
  local obs="${root}/counterexample.txt" head moved
  local response="${transcript%/*}/response.md" observed=${transcript}
  local report=${response}
  head=$(git -C "${checkout}" rev-parse HEAD)
  # Prints the state as observed now.
  # shellcheck disable=SC2329 # Run by name through the shared counterexample forms.
  default_main_observe() {
    git_publication_fixture_observe_one_shot_default_main one-shot-default-main \
      complete "${observed}" "${host}" "${report}"
  }
  default_main_observe > "${root}/passing.txt"
  git_publication_suite_counterexamples \
    "${source_dir}/tests/support/git-publication-native-one-shot-default-main.sh" \
    "${root}/passing.txt"

  cp -- "${root}/push.log" "${root}/push.log.kept"
  git -C "${checkout}" push -q origin HEAD:refs/heads/main
  native_assessor_rejects_observed result-pushed remote \
    "${obs}" default_main_observe -- fail 'the remote changed'
  git -C "${origin}" update-ref refs/heads/main "${base}"
  git -C "${checkout}" update-ref refs/remotes/origin/main "${base}"
  mv -- "${root}/push.log.kept" "${root}/push.log"

  git -C "${checkout}" branch -q one-shot/extra
  native_assessor_rejects_observed extra-branch isolation \
    "${obs}" default_main_observe -- fail 'extra worktree or branch'
  git -C "${checkout}" worktree add -q "${root}/extra" one-shot/extra
  native_assessor_rejects_observed extra-worktree isolation \
    "${obs}" default_main_observe -- fail 'extra worktree or branch'
  git -C "${checkout}" worktree remove "${root}/extra"
  git -C "${checkout}" branch -q -D one-shot/extra

  # The result replayed onto trunk, dropping the earlier local commit.
  moved=$(git -C "${checkout}" commit-tree "${head}^{tree}" -p "${base}" -m 'result')
  git -C "${checkout}" reset -q --hard "${moved}"
  native_assessor_rejects_observed local-commit-lost checkout \
    "${obs}" default_main_observe -- fail 'earlier local commit'
  git -C "${checkout}" reset -q --hard "${head}"

  # The result left uncommitted.
  git -C "${checkout}" reset -q --soft "${local_sha}"
  native_assessor_rejects_observed result-uncommitted checkout \
    "${obs}" default_main_observe -- fail 'not committed in the default checkout'
  # Only the result committed, the existing changes discarded.
  git -C "${checkout}" reset -q
  git -C "${checkout}" commit -q -m 'Add the default line' -- notes.txt
  git -C "${checkout}" checkout -q -- .
  git -C "${checkout}" clean -qfd
  native_assessor_rejects_observed existing-changes-discarded checkout \
    "${obs}" default_main_observe -- fail 'existing changes were not committed'
  git -C "${checkout}" reset -q --hard "${head}"
  # Committed, then a file left beside the commit.
  printf 'later\n' > "${checkout}/later.txt"
  native_assessor_rejects_observed content-left-uncommitted checkout \
    "${obs}" default_main_observe -- fail 'uncommitted content'
  rm -f -- "${checkout}/later.txt"

  # The result commit also records an agent profile.
  mkdir -p "${checkout}/.planning/agents"
  printf '{}\n' > "${checkout}/.planning/agents/native.json"
  git -C "${checkout}" add .planning/agents/native.json
  git -C "${checkout}" commit -q --amend --no-edit
  native_assessor_rejects_observed result-records-profile planning \
    "${obs}" default_main_observe -- fail 'agent profile records'
  git -C "${checkout}" reset -q --hard "${head}"

  observed="${root}/no-default-main.jsonl"
  grep -Fv -e '--default-main' "${transcript}" > "${observed}"
  native_assessor_rejects_observed no-default-main-start one-shot-start \
    "${obs}" default_main_observe -- fail 'one-shot default-checkout start'
  observed="${root}/auto-land-start.jsonl"
  sed 's/--default-main/--default-main --auto-land --push-authorized/g' \
    "${transcript}" > "${observed}"
  native_assessor_rejects_observed auto-land-start one-shot-start \
    "${obs}" default_main_observe -- fail 'claimed push authority'
  observed=${transcript}

  report="${root}/silent-report.md"
  printf 'Done.\n' > "${report}"
  native_assessor_rejects_observed report-silent report \
    "${obs}" default_main_observe -- fail 'does not name the default checkout'
  report=${response}

  git_publication_suite_passes_observed "${obs}" default_main_observe \
    -- 'wait committed in the default checkout'
}
