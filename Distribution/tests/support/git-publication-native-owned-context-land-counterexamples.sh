#!/usr/bin/env bash
# Credential-free counterexamples for the preparation-land owned-context
# journey, with its retirement cases: each mutation alone, observed again,
# changes one signal of the passing observation.
# Sourced by git-publication-native-owned-context-suite.sh.
# shellcheck disable=SC2034,SC2154,SC2312 # Globals assigned by sourced helpers.

# shellcheck disable=SC2311 # A failed helper yields no revision, which the Git command given it rejects.
run_preparation_land_counterexamples() {
  local origin=${git_publication_fixture_origin} base=${git_publication_fixture_trunk_sha}
  local repository=${git_publication_owned_repository} branch=${NATIVE_OWNED_BRANCH}
  local workspace=${git_publication_fixture_workspace} root=${git_publication_fixture_root}
  local index="${root}/counterexample.index" push_log="${root}/push.log"
  local tip announcement profile stale commit
  tip=$(git -C "${origin}" rev-parse refs/heads/main)
  git_publication_suite_passes_observed "${owned_context_obs}" \
    owned_context_observe -- 'landed only Story C'
  announcement=$(git_publication_assess_field "$(cat "${owned_context_obs}")" announcement-sha)
  profile=$(git -C "${origin}" diff-tree --no-commit-id --name-only -r "${announcement}")

  # Commits tree $1 on parent $2 as another writer.
  owned_context_commit() {
    git -C "${origin}" -c user.name=Other -c user.email=other@example.test \
      commit-tree "$1" -p "$2" -m counterexample
  }
  # Revision $1's tree with path $2 holding blob $3.
  owned_context_tree_with() {
    GIT_INDEX_FILE=${index} git -C "${origin}" read-tree "$1"
    GIT_INDEX_FILE=${index} git -C "${origin}" update-index --add --cacheinfo "100644,$3,$2"
    GIT_INDEX_FILE=${index} git -C "${origin}" write-tree
  }

  # The announcement made on the stale installed revision, then the landing.
  stale=$(owned_context_commit "$(owned_context_tree_with \
    "${git_publication_owned_installed}" "${profile}" \
    "$(git -C "${origin}" rev-parse "${announcement}:${profile}")")" \
    "${git_publication_owned_installed}")
  git -C "${origin}" update-ref refs/heads/main "$(owned_context_commit "${tip}^{tree}" "${stale}")"
  native_assessor_rejects_observed stale-announcement announcement-base \
    "${owned_context_obs}.stale-announcement" owned_context_observe -- fail \
    'announcement on the fetched trunk tip'
  git -C "${origin}" update-ref refs/heads/main "${tip}"

  cp -- "${push_log}" "${push_log}.kept"
  { printf '%s %s refs/heads/main\n' "${base}" "${tip}" && cat "${push_log}.kept"; } > "${push_log}"
  native_assessor_rejects_observed push-before-announcement push-order \
    "${owned_context_obs}.push-before-announcement" owned_context_observe -- fail \
    'push before the preparation announcement'
  printf '%s %s refs/heads/main\n' "${tip}" "${base}" >> "${push_log}.kept"
  cp -- "${push_log}.kept" "${push_log}"
  native_assessor_rejects_observed force-push force-push \
    "${owned_context_obs}.force-push" owned_context_observe -- fail 'force push'
  sed '$d' "${push_log}.kept" > "${push_log}"
  rm -- "${push_log}.kept"

  commit=$(owned_context_commit "$(owned_context_tree_with "${tip}" trunk.txt \
    "$(printf 'changed\n' | git -C "${origin}" hash-object -w --stdin)")" "${tip}")
  git -C "${origin}" update-ref refs/heads/main "${commit}"
  native_assessor_rejects_observed outside-story outside-story \
    "${owned_context_obs}.outside-story" owned_context_observe -- fail "outside Story C's section"
  git -C "${origin}" update-ref refs/heads/main "${tip}"

  git -C "${repository}" worktree add -q -b "${branch}" "${workspace}" "${tip}"
  native_assessor_rejects_observed worktree-re-added worktree-survived \
    "${owned_context_obs}.worktree-re-added" owned_context_observe -- fail \
    'worktree or its branch survived'
  git -C "${repository}" worktree remove "${workspace}"
  native_assessor_rejects_observed branch-survived worktree-survived \
    "${owned_context_obs}.branch-survived" owned_context_observe -- fail \
    'worktree or its branch survived'
  git -C "${repository}" branch -q -D "${branch}"

  run_preparation_land_retirement_counterexamples
  git_publication_suite_passes_observed "${owned_context_obs}" \
    owned_context_observe -- 'landed only Story C'
}

# Retirement runs the installed command for Story C, which checks ownership;
# raw Git removal, or the command for other work, does not count.
run_preparation_land_retirement_counterexamples() {
  local transcript=${owned_context_transcript} log=${git_publication_owned_node_log}
  local raw="git -C ${git_publication_owned_repository} worktree remove ${git_publication_fixture_workspace}"
  local file
  for file in "${transcript}" "${log}"; do
    cp -- "${file}" "${file}.kept"
    grep -Fv 'worktree-retirement.mjs' "${file}.kept" > "${file}" || true
  done
  native_assessor_rejects_observed retire-command-missing retire-command \
    "${owned_context_obs}.retire-command-missing" owned_context_observe -- fail \
    'installed retirement command for Story C'
  # The command ran for Story C, but the worktree went through raw Git anyway.
  cp -- "${log}.kept" "${log}"
  cp -- "${transcript}.kept" "${transcript}"
  owned_context_append_started "${raw}"
  native_assessor_rejects_observed raw-git-retirement raw-git-retirement \
    "${owned_context_obs}.raw-git-retirement" owned_context_observe -- fail \
    'removed through raw Git'
  for file in "${transcript}" "${log}"; do
    sed 's/--identity /--identity other-/g' "${file}.kept" > "${file}"
  done
  native_assessor_rejects_observed retire-other-identity retire-command \
    "${owned_context_obs}.retire-other-identity" owned_context_observe -- fail \
    'installed retirement command for Story C'
  for file in "${transcript}" "${log}"; do
    mv -- "${file}.kept" "${file}"
  done
}
