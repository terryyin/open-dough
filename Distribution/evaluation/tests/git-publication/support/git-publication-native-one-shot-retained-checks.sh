#!/usr/bin/env bash
# Automated counterexamples; loaded only by test-side support.
# shellcheck disable=SC1091,SC2034,SC2154,SC2310,SC2311,SC2312,SC2329

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
