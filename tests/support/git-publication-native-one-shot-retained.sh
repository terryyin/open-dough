#!/usr/bin/env bash
# A one-shot result kept in its owned workspace, shared by the one-shot
# journeys of the publication native harness that stop before landing (review,
# refinement, the blocked automatic landing and the established start):
# observation of the remote, which none of them lets change, and of the
# retained owned workspace, its result line and its report; plus the rejected
# remote and retention cases they share. Sourced by
# git-publication-native-one-shot.sh.
# shellcheck disable=SC2034,SC2154,SC2312 # Shared fixture and assessor globals.

# Every update the remote accepted and its trunk tip, against the base.
git_publication_one_shot_observe_remote() {
  printf 'base-sha: %s\n' "${git_publication_fixture_trunk_sha}"
  printf 'remote-sha: %s\n' \
    "$(git -C "${git_publication_fixture_origin}" rev-parse refs/heads/main)"
  node "${source_dir}/tests/support/git-publication-native-push-log-observe.mjs" \
    "${source_dir}" "${git_publication_fixture_origin}" \
    "${git_publication_fixture_root}/push.log"
}

# The owned workspace as retained: still a worktree of the originating
# checkout on its branch, its commits and changed paths since the base, and
# whether tracked content is all committed. Then whether report $1 names the
# workspace or its branch.
git_publication_one_shot_observe_retained() {
  local response=$1 workspace=${NATIVE_ONE_SHOT_WORKSPACE}
  local branch=${NATIVE_ONE_SHOT_BRANCH} base=${git_publication_fixture_trunk_sha}
  local retained=false common integration_common
  integration_common=$(git -C "${git_publication_fixture_integration}" \
    rev-parse --path-format=absolute --git-common-dir)
  if [[ -d ${workspace} ]]; then
    common=$(git -C "${workspace}" rev-parse --path-format=absolute \
      --git-common-dir 2> /dev/null || true)
    if [[ ${common} == "${integration_common}" &&
      $(git -C "${workspace}" symbolic-ref -q --short HEAD || true) == "${branch}" ]]; then
      retained=true
    fi
  fi
  printf 'workspace-retained: %s\n' "${retained}"
  if [[ ${retained} == true ]]; then
    printf 'workspace-commit-count: %s\n' \
      "$(git -C "${workspace}" rev-list --count "${base}..HEAD")"
    printf 'workspace-clean: %s\n' "$(
      [[ -z $(git -C "${workspace}" status --porcelain --untracked-files=no) ]] \
        && echo true || echo false
    )"
    printf 'workspace-changed-paths: %s\n' \
      "$(git -C "${workspace}" diff --name-only "${base}" HEAD | paste -sd, -)"
  else
    printf '%s\n' 'workspace-commit-count: ' 'workspace-clean: ' \
      'workspace-changed-paths: '
  fi
  printf 'report-names-retained: %s\n' "$(
    [[ -r ${response} ]] && grep -Fq -e "${workspace}" -e "${branch}" "${response}" \
      && echo true || echo false
  )"
}

# Whether the retained workspace's last commit holds line $1 in notes.txt.
git_publication_one_shot_observe_result_line() {
  local notes=
  if [[ -d ${NATIVE_ONE_SHOT_WORKSPACE} ]]; then
    notes=$(git -C "${NATIVE_ONE_SHOT_WORKSPACE}" show HEAD:notes.txt 2> /dev/null || true)
  fi
  printf 'result-line-present: %s\n' \
    "$(grep -Fxq -- "$1" <<< "${notes}" && echo true || echo false)"
}

# Rejected remote cases shared by the review, refinement and established
# journeys, observed by $1: the retained result pushed to trunk, its branch
# published, and an agent profile pushed to trunk then replaced. Each is
# undone afterwards.
git_publication_one_shot_remote_counterexamples() {
  local observe=$1 origin=${git_publication_fixture_origin}
  local workspace=${NATIVE_ONE_SHOT_WORKSPACE} branch=${NATIVE_ONE_SHOT_BRANCH}
  local root=${git_publication_fixture_root} base=${git_publication_fixture_trunk_sha}
  local obs="${root}/counterexample.txt" push_log="${root}/push.log"
  local index="${root}/counterexample.index" profile
  cp -- "${push_log}" "${push_log}.kept"
  git -C "${workspace}" push -q origin HEAD:refs/heads/main
  native_assessor_rejects_observed result-pushed remote \
    "${obs}" "${observe}" -- fail 'the remote changed'
  git -C "${origin}" update-ref refs/heads/main "${base}"
  git -C "${workspace}" update-ref refs/remotes/origin/main "${base}"
  cp -- "${push_log}.kept" "${push_log}"

  git -C "${workspace}" push -q origin "HEAD:refs/heads/${branch}"
  native_assessor_rejects_observed branch-published remote \
    "${obs}" "${observe}" -- fail 'the remote changed'
  git -C "${origin}" update-ref -d "refs/heads/${branch}"
  git -C "${workspace}" update-ref -d "refs/remotes/origin/${branch}"
  cp -- "${push_log}.kept" "${push_log}"

  # A pushed trunk tip recording an agent profile, later replaced.
  GIT_INDEX_FILE=${index} git -C "${origin}" read-tree "${base}"
  GIT_INDEX_FILE=${index} git -C "${origin}" update-index --add --cacheinfo \
    "100644,$(printf '{}\n' | git -C "${origin}" hash-object -w --stdin),.planning/agents/native.json"
  profile=$(git -C "${origin}" -c user.name=Agent -c user.email=agent@example.test \
    commit-tree "$(GIT_INDEX_FILE=${index} git -C "${origin}" write-tree)" \
    -p "${base}" -m 'Announce preparation')
  printf '%s %s refs/heads/main\n' "${base}" "${profile}" >> "${push_log}"
  native_assessor_rejects_observed profile-pushed remote \
    "${obs}" "${observe}" -- fail 'the remote changed'
  mv -- "${push_log}.kept" "${push_log}"
}

# Rejected retention cases shared by the journeys that stop before landing,
# observed by $1 and rejected with reason fragment $2: the workspace retired
# with its branch kept, and the workspace left off its branch. Each is undone
# afterwards.
git_publication_one_shot_retained_counterexamples() {
  local observe=$1 fragment=$2 integration=${git_publication_fixture_integration}
  local workspace=${NATIVE_ONE_SHOT_WORKSPACE} branch=${NATIVE_ONE_SHOT_BRANCH}
  local obs="${git_publication_fixture_root}/counterexample.txt"
  git -C "${integration}" worktree remove "${workspace}"
  native_assessor_rejects_observed workspace-retired workspace \
    "${obs}" "${observe}" -- fail "${fragment}"
  git -C "${integration}" worktree add -q "${workspace}" "${branch}"
  git -C "${workspace}" switch -q --detach
  native_assessor_rejects_observed workspace-off-branch workspace \
    "${obs}" "${observe}" -- fail "${fragment}"
  git -C "${workspace}" switch -q "${branch}"
}
