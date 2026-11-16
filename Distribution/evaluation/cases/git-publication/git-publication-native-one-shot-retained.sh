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
  node "${source_dir}/Distribution/evaluation/cases/git-publication/git-publication-native-push-log-observe.mjs" \
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
