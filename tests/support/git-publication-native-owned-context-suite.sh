#!/usr/bin/env bash
# Credential-free proof for the owned-context journeys: each runs once
# through a substitute host and the shared supervisor/stream/retention path,
# and its assessor rejects the failures that matter, as real-state
# counterexamples on the kept publication fixtures and as observation
# counterexamples for the Trunk Mode closure.
# shellcheck disable=SC2034,SC2154,SC2312 # Globals assigned by sourced helpers.

run_substitute_owned_context_journeys() {
  prepare_substitute_hosts
  run_substitute_owned_context_journey codex startup-owned-context
  run_substitute_owned_context_journey claude preparation-land
  run_substitute_trunk_closure_owned_context
  run_trunk_closure_owned_context_counterexamples
}

# Publication journey $2 on substitute host $1, then its counterexamples.
run_substitute_owned_context_journey() {
  local host=$1 journey=$2 artifact status
  artifact=$(mktemp -d "${substitute_work}/${host}-${journey}.XXXXXX")
  set +e
  NATIVE_AGENT_SENTINEL_LOG="${substitute_run_log}" GIT_PUBLICATION_KEEP=1 \
    git_publication_run_journey "${source_dir}" "${host}" "${journey}" \
    "${artifact}"
  status=$?
  set -e
  if [[ ${status} -ne 0 || ${git_publication_assess_status} != 'pass' ]]; then
    echo "FAIL: substitute ${host} ${journey} exited ${status}, assessment ${git_publication_assess_status}: ${git_publication_assess_reason}" >&2
    cat "${artifact}/observations.txt" "${artifact}/events.jsonl" >&2 || true
    git_publication_fixture_cleanup
    exit 1
  fi
  owned_context_obs="${git_publication_fixture_root}/counterexample.txt"
  owned_context_transcript="${artifact}/events.jsonl"
  owned_context_journey=${journey}
  if [[ ${journey} == startup-owned-context ]]; then
    run_startup_owned_context_counterexamples
  else
    run_preparation_land_counterexamples
  fi
  git_publication_fixture_cleanup
}

# Observes the kept fixture again and expects assessment "$@".
owned_context_reassess() {
  git_publication_fixture_observe_owned_context "${owned_context_journey}" \
    complete "${owned_context_transcript}" > "${owned_context_obs}"
  git_publication_assess "${owned_context_obs}"
  git_publication_suite_expect_assess "$@"
}

run_startup_owned_context_counterexamples() {
  local workspace=${git_publication_fixture_workspace} seed=.planning/seeds/A.md
  local retained=${git_publication_owned_retained} transcript=${owned_context_transcript}
  owned_context_reassess pass 'left the retained worktree untouched'

  cp -- "${transcript}" "${transcript}.kept"
  jq -n -c --arg c "node execution-start.mjs start --integration ${retained} --repository ${retained}" \
    '{type:"item.started",item:{type:"command_execution",command:$c}}' >> "${transcript}"
  owned_context_reassess fail 'given a default checkout (--integration)'

  # The same start split by line continuations names --repository on a later
  # line, and a --help probe beside it is not a startup.
  jq -c 'if (.item.command? // "" | test("execution-start.mjs start"))
    then .item.command |= gsub(" --"; " \\\n  --") else . end' \
    "${transcript}.kept" > "${transcript}"
  owned_context_reassess pass 'left the retained worktree untouched'
  jq -n -c --arg c "node execution-start.mjs start --integration ${retained} --help" \
    '{type:"tool_call",subtype:"started",tool_call:{shellToolCall:{args:{command:$c}}}}' \
    >> "${transcript}"
  owned_context_reassess pass 'left the retained worktree untouched'
  mv -- "${transcript}.kept" "${transcript}"

  printf 'changed\n' >> "${retained}/trunk.txt"
  owned_context_reassess fail 'retained worktree changed'
  git -C "${retained}" checkout -q -- trunk.txt

  cp -- "${workspace}/${seed}" "${workspace}/${seed}.kept"
  cp -- "${retained}/${seed}" "${workspace}/${seed}"
  owned_context_reassess fail 'published source (local-copy)'
  mv -- "${workspace}/${seed}.kept" "${workspace}/${seed}"

  touch -t 200001010000 "${workspace}/feature.txt"
  owned_context_reassess fail 'crossed claim boundary'
  touch "${workspace}/feature.txt"

  owned_context_reassess pass 'left the retained worktree untouched'
}

# shellcheck disable=SC2311 # A failed helper yields no revision, which the Git command given it rejects.
run_preparation_land_counterexamples() {
  local origin=${git_publication_fixture_origin} base=${git_publication_fixture_trunk_sha}
  local repository=${git_publication_owned_repository} branch=${NATIVE_OWNED_BRANCH}
  local workspace=${git_publication_fixture_workspace} root=${git_publication_fixture_root}
  local index="${root}/counterexample.index" push_log="${root}/push.log"
  local tip announcement profile stale commit
  tip=$(git -C "${origin}" rev-parse refs/heads/main)
  owned_context_reassess pass 'landed only Story C'
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
  owned_context_reassess fail 'announcement on the fetched trunk tip'
  git -C "${origin}" update-ref refs/heads/main "${tip}"

  cp -- "${push_log}" "${push_log}.kept"
  { printf '%s %s refs/heads/main\n' "${base}" "${tip}" && cat "${push_log}.kept"; } > "${push_log}"
  owned_context_reassess fail 'push before the preparation announcement'
  printf '%s %s refs/heads/main\n' "${tip}" "${base}" >> "${push_log}.kept"
  cp -- "${push_log}.kept" "${push_log}"
  owned_context_reassess fail 'force push'
  sed '$d' "${push_log}.kept" > "${push_log}"
  rm -- "${push_log}.kept"

  commit=$(owned_context_commit "$(owned_context_tree_with "${tip}" trunk.txt \
    "$(printf 'changed\n' | git -C "${origin}" hash-object -w --stdin)")" "${tip}")
  git -C "${origin}" update-ref refs/heads/main "${commit}"
  owned_context_reassess fail "outside Story C's section"
  git -C "${origin}" update-ref refs/heads/main "${tip}"

  git -C "${repository}" worktree add -q -b "${branch}" "${workspace}" "${tip}"
  owned_context_reassess fail 'worktree or its branch survived'
  git -C "${repository}" worktree remove "${workspace}"
  owned_context_reassess fail 'worktree or its branch survived'
  git -C "${repository}" branch -q -D "${branch}"

  owned_context_reassess pass 'landed only Story C'
}

# The Trunk Mode closure with no default checkout, through its controller.
run_substitute_trunk_closure_owned_context() {
  local results status
  results=$(mktemp -d "${substitute_work}/trunk-closure-results.XXXXXX")
  set +e
  NATIVE_AGENT_SENTINEL_LOG="${substitute_run_log}" \
    NATIVE_PUBLICATION_JOURNEY=trunk-closure-owned-context \
    trunk_closure_run_journey "${source_dir}" claude owned-context \
    "${results}" > "${results}/run.txt" 2>&1
  status=$?
  set -e
  if [[ ${status} -ne 0 || ${git_publication_assess_status} != 'pass' ]]; then
    echo "FAIL: substitute claude trunk-closure/owned-context exited ${status}, assessment ${git_publication_assess_status}: ${git_publication_assess_reason}" >&2
    cat "${results}/run.txt" >&2
    exit 1
  fi
}
