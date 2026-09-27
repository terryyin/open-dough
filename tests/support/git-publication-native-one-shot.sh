#!/usr/bin/env bash
# One-shot journeys for the publication native harness: explicitly requested
# one-shot work publishes only its verified result to remote trunk and retires
# its owned workspace.
# Fixture, observation, prompt and assessment. Sourced by the runner.
# shellcheck disable=SC2034,SC2154,SC2312 # Shared fixture and assessor globals.

git_publication_fixture_create_one_shot() {
  local source_dir=$1 journey=$2 parent=$3
  local prepared
  prepared=$(node "${source_dir}/tests/support/git-publication-native-one-shot-fixture.mjs" \
    "${source_dir}" "${journey}" "${parent}")
  git_publication_fixture_adopt_prepared "${prepared}"
  NATIVE_ONE_SHOT_WORKSPACE=${git_publication_fixture_workspace}
  NATIVE_ONE_SHOT_BRANCH=$(jq -r .branch <<< "${prepared}")
  export NATIVE_ONE_SHOT_WORKSPACE NATIVE_ONE_SHOT_BRANCH
  # The session's CI observers live inside the fixture, so a leftover one is
  # found and stopped with it.
  export DOUGH_CI_MAILBOX_ROOT="${git_publication_fixture_root}/mailboxes"
}

# After installing the guidance into the originating checkout: the project
# commits its installed guidance, so an owned workspace at trunk holds the
# runtime delivery needs. Then record every push origin accepts, and plant the
# human edit only now so it stays out of trunk; the runner captures it next.
git_publication_one_shot_publish_install() {
  local integration=${git_publication_fixture_integration}
  git -C "${integration}" add -A
  git -C "${integration}" commit -qm 'install Open Dough guidance'
  git -C "${integration}" push -q origin main
  git_publication_fixture_trunk_sha=$(git -C "${integration}" rev-parse HEAD)
  git_publication_record_pushes "${git_publication_fixture_origin}" \
    "${git_publication_fixture_root}/push.log"
  git_publication_fixture_plant_human_edit "${integration}"
}

# Appends every `old new ref` line bare repository $1 accepts to log $2.
git_publication_record_pushes() {
  local origin=$1 log=$2
  : > "${log}"
  cat > "${origin}/hooks/post-receive" << EOF
#!/bin/sh
cat >> '${log}'
EOF
  chmod +x "${origin}/hooks/post-receive"
}

git_publication_one_shot_prompt() {
  case $1 in
    one-shot-result)
      printf '%s\n' \
        "Use this project's installed Open Dough guidance. As one-shot work, add the line 'One-shot line' to the end of notes.txt. The originating and integration checkout is ${git_publication_fixture_integration}; use ${NATIVE_ONE_SHOT_WORKSPACE} on local branch ${NATIVE_ONE_SHOT_BRANCH} as the owned execution workspace. Remote origin trunk is refs/heads/main. You have explicit authority to create that workspace and publish to remote trunk. Preserve existing local changes. Report the outcome."
      ;;
    *) return 2 ;;
  esac
}

git_publication_fixture_observe_one_shot() {
  local journey=$1 stream_status=$2 transcript=$3
  local origin=${git_publication_fixture_origin}
  local base=${git_publication_fixture_trunk_sha} tip ancestor=false
  local branch=${NATIVE_ONE_SHOT_BRANCH} human_after commands
  tip=$(git -C "${origin}" rev-parse refs/heads/main)
  if git -C "${origin}" merge-base --is-ancestor "${base}" "${tip}"; then
    ancestor=true
  fi
  commands=$(git_publication_transcript_start_commands "${transcript}")
  human_after=$(git_publication_fixture_capture_human "${git_publication_fixture_integration}")
  printf 'journey: %s\n' "${journey}"
  printf 'stream-status: %s\n' "${stream_status}"
  printf 'one-shot-start-observed: %s\n' \
    "$(grep -Fq -- '--one-shot' <<< "${commands}" && echo true || echo false)"
  printf 'base-sha: %s\n' "${base}"
  printf 'remote-sha: %s\n' "${tip}"
  printf 'base-ancestor: %s\n' "${ancestor}"
  printf 'trunk-commit-count: %s\n' \
    "$(git -C "${origin}" rev-list --count "${base}..${tip}")"
  printf 'planning-record-paths: %s\n' "$(
    git -C "${origin}" log --format= --name-only "${base}..${tip}" \
      | grep -Ec '^\.planning/(PRODUCT-BACKLOG\.md$|seeds/|slice-plans/|agents/)' || true
  )"
  printf 'result-changed: %s\n' \
    "$(git -C "${origin}" diff --quiet "${base}" "${tip}" -- notes.txt && echo false || echo true)"
  printf 'workspace-present: %s\n' \
    "$([[ -e ${NATIVE_ONE_SHOT_WORKSPACE} ]] && echo true || echo false)"
  printf 'branch-present: %s\n' "$(
    git -C "${git_publication_fixture_integration}" show-ref --quiet --verify "refs/heads/${branch}" \
      || git -C "${origin}" show-ref --quiet --verify "refs/heads/${branch}" \
      && echo true || echo false
  )"
  printf 'human-edit-preserved: %s\n' \
    "$([[ ${human_after} == "${git_publication_fixture_human_before}" ]] && echo true || echo false)"
  node "${source_dir}/tests/support/git-publication-native-push-log-observe.mjs" \
    "${source_dir}" "${origin}" "${git_publication_fixture_root}/push.log"
}

# Stops CI observers the session left running in the fixture's mailbox root.
git_publication_one_shot_stop_observers() {
  local mailbox launcher
  launcher="${git_publication_fixture_integration}/.claude/skills/dough-execute-plan/scripts/ci-mailbox.mjs"
  [[ -f ${launcher} ]] \
    || launcher="${git_publication_fixture_integration}/.agents/skills/dough-execute-plan/scripts/ci-mailbox.mjs"
  for mailbox in "${DOUGH_CI_MAILBOX_ROOT}"/*/; do
    [[ -d ${mailbox} && ! -f ${mailbox}result.json ]] || continue
    (cd -- "${git_publication_fixture_integration}" \
      && node "${launcher}" stop "${mailbox%/}") > /dev/null 2>&1 || true
  done
  unset DOUGH_CI_MAILBOX_ROOT
}

git_publication_assess_one_shot() {
  local obs=$1 key
  local stream_status human_edit_preserved base_ancestor trunk_commit_count
  local planning_record_paths result_changed pushed_taken workspace_present
  local branch_present
  for key in stream-status human-edit-preserved base-ancestor \
    trunk-commit-count planning-record-paths result-changed pushed-taken \
    workspace-present branch-present; do
    printf -v "${key//-/_}" '%s' "$(git_publication_assess_field "${obs}" "${key}")"
  done
  if [[ ${stream_status} != complete ]]; then
    git_publication_assess_fail "incomplete or stale native stream (${stream_status})"
  elif [[ ${human_edit_preserved} != true ]]; then
    git_publication_assess_fail 'human edits in the originating checkout changed'
  elif [[ ${base_ancestor} != true || ${trunk_commit_count} != 1 ]]; then
    git_publication_assess_fail 'remote trunk did not gain exactly one commit since the base'
  elif [[ ${planning_record_paths} != 0 ]]; then
    git_publication_assess_fail 'the trunk commit touched backlog, seed, plan or agent profile records'
  elif [[ ${result_changed} != true ]]; then
    git_publication_assess_fail 'the trunk commit does not hold the requested result'
  elif [[ -n ${pushed_taken} ]]; then
    git_publication_assess_fail 'a push accepted by remote trunk listed work under Taken'
  elif [[ ${workspace_present} != false || ${branch_present} != false ]]; then
    git_publication_assess_fail 'the owned workspace or its branch survived'
  else
    git_publication_assess_status=pass
    git_publication_assess_reason='only the one-shot result reached remote trunk and its workspace retired'
  fi
}

# Real-state counterexamples on a passing one-shot fixture: each mutation
# alone makes the assessor fail, and undoing them all passes again.
run_one_shot_state_counterexamples() {
  local transcript=$1 origin=${git_publication_fixture_origin}
  local integration=${git_publication_fixture_integration}
  local base=${git_publication_fixture_trunk_sha} tip commit path
  local obs="${git_publication_fixture_root}/counterexample.txt"
  local index="${git_publication_fixture_root}/counterexample.index"
  local push_log="${git_publication_fixture_root}/push.log"
  tip=$(git -C "${origin}" rev-parse refs/heads/main)
  one_shot_reassess() {
    git_publication_fixture_observe_one_shot one-shot-result complete \
      "${transcript}" > "${obs}"
    git_publication_assess "${obs}"
    git_publication_suite_expect_assess "$@"
  }
  # Another writer's commit of tree $1 on parent $2 with message $3.
  one_shot_commit() {
    git -C "${origin}" -c user.name=Other -c user.email=other@example.test \
      commit-tree "$1" -p "$2" -m "$3"
  }
  # The trunk tip's tree with path $1 holding standard input.
  one_shot_tip_tree_with() {
    GIT_INDEX_FILE=${index} git -C "${origin}" read-tree "${tip}"
    GIT_INDEX_FILE=${index} git -C "${origin}" update-index --add --cacheinfo \
      "100644,$(git -C "${origin}" hash-object -w --stdin),$1"
    GIT_INDEX_FILE=${index} git -C "${origin}" write-tree
  }
  one_shot_reassess pass 'only the one-shot result'

  commit=$(one_shot_commit "${tip}^{tree}" "${tip}" 'second commit')
  git -C "${origin}" update-ref refs/heads/main "${commit}"
  one_shot_reassess fail 'exactly one commit'

  # The result commit rewritten to also change one planning record.
  for path in .planning/PRODUCT-BACKLOG.md .planning/seeds/one-shot.md \
    .planning/slice-plans/one-shot/PLAN.md .planning/agents/native.json; do
    commit=$(one_shot_commit "$(printf 'changed\n' | one_shot_tip_tree_with "${path}")" \
      "${base}" 'result with a planning record')
    git -C "${origin}" update-ref refs/heads/main "${commit}"
    one_shot_reassess fail 'touched backlog, seed, plan or agent profile'
  done
  git -C "${origin}" update-ref refs/heads/main "${tip}"

  # A pushed tip that listed story A under Taken, later replaced.
  commit=$(one_shot_commit "$(
    git -C "${origin}" show "${tip}:.planning/PRODUCT-BACKLOG.md" \
      | awk '/^- \[Story A\]/ { next } { print } /^## Taken$/ { print ""; print "- [Story A](seeds/A.md#a) — SEED-A#a" }' \
      | one_shot_tip_tree_with .planning/PRODUCT-BACKLOG.md
  )" "${base}" 'Take story A')
  cp -- "${push_log}" "${push_log}.kept"
  printf '%s %s refs/heads/main\n' "${base}" "${commit}" >> "${push_log}"
  one_shot_reassess fail 'listed work under Taken'
  mv -- "${push_log}.kept" "${push_log}"

  git -C "${integration}" worktree add -q -b "${NATIVE_ONE_SHOT_BRANCH}" \
    "${NATIVE_ONE_SHOT_WORKSPACE}" "${tip}"
  one_shot_reassess fail 'workspace or its branch survived'
  git -C "${integration}" worktree remove "${NATIVE_ONE_SHOT_WORKSPACE}"
  one_shot_reassess fail 'workspace or its branch survived'
  git -C "${integration}" branch -q -D "${NATIVE_ONE_SHOT_BRANCH}"
  git -C "${origin}" update-ref "refs/heads/${NATIVE_ONE_SHOT_BRANCH}" "${tip}"
  one_shot_reassess fail 'workspace or its branch survived'
  git -C "${origin}" update-ref -d "refs/heads/${NATIVE_ONE_SHOT_BRANCH}"

  printf 'human working tree, changed\n' > "${integration}/human-unstaged.txt"
  one_shot_reassess fail 'human edits'
  git_publication_fixture_plant_human_edit "${integration}"

  one_shot_reassess pass 'only the one-shot result'
}
