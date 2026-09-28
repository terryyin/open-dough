#!/usr/bin/env bash
# The owned-context scenario of the Trunk Mode closure fixture: the same
# final-closure candidate, CI stub, completion receipt, and shutdown
# observations, with no default checkout. The execution workspace is the only
# worktree of a repository Git directory, the installed guidance is on trunk
# so that worktree stays clean, and the wrap-up guidance itself retires the
# worktree and its branch after the completion receipt. A watcher records the
# observer's state at the moment the worktree disappears. Observation,
# assessment, and assessor counterexamples. Sourced by the fixture.
# shellcheck disable=SC2034,SC2154,SC2312 # Shared fixture globals.

# Replaces the project cleanup script with the guidance installed on trunk.
trunk_closure_owned_context_base() {
  local source_dir=$1 host=$2
  rm -f -- "${trunk_closure_integration}/AGENTS.md" \
    "${trunk_closure_integration}/tests/closure-cleanup.sh"
  bash "${source_dir}/install.sh" --target "${trunk_closure_integration}" \
    --source "${source_dir}" --platform "${host}" > /dev/null
}

# The execution worktree of a new repository Git directory, at trunk.
trunk_closure_owned_context_worktree() {
  trunk_closure_repository="${trunk_closure_workspace%/*}/repository.git"
  git init -q --bare "${trunk_closure_repository}"
  # As Git lists it, so its own entry is recognized in the worktree list.
  trunk_closure_repository=$(cd -- "${trunk_closure_repository}" && pwd -P)
  git -C "${trunk_closure_repository}" remote add origin "${trunk_closure_origin}"
  git -C "${trunk_closure_repository}" fetch -q origin
  git -C "${trunk_closure_repository}" worktree add -q -b exec/trunk \
    "${trunk_closure_workspace}" origin/main
}

# Writes the execution state beside the worktree, so the worktree stays clean,
# and starts the cleanup watcher.
trunk_closure_owned_context_state() {
  local root=$1
  trunk_closure_owned_context_state_file="${root}/execution-state.txt"
  printf '%s\n' \
    'Execution mode: Trunk Mode' \
    'Authorized target: remote origin, branch main (GitHub owner/project)' \
    "Final closure candidate: ${trunk_closure_candidate_sha}" \
    "Observer mailbox: ${trunk_closure_mailbox}" \
    "Observer launcher: ${trunk_closure_launcher}" \
    "Execution worktree: ${trunk_closure_workspace} on branch exec/trunk, created by this execution" \
    'Default checkout: none' \
    'Applicable CI: pending' \
    > "${trunk_closure_owned_context_state_file}"
  (
    while [[ -d ${trunk_closure_workspace} ]]; do sleep 0.05; done
    jq -r .status "${trunk_closure_mailbox}/result.json" 2> /dev/null \
      > "${root}/cleanup-observer-state" || echo missing > "${root}/cleanup-observer-state"
    printf 'cleanup\n' >> "${trunk_closure_control_log}"
    : > "${trunk_closure_cleanup_marker}"
  ) &
  trunk_closure_owned_context_watcher=$!
}

trunk_closure_owned_context_stop_watch() {
  [[ -n ${trunk_closure_owned_context_watcher:-} ]] || return 0
  kill "${trunk_closure_owned_context_watcher}" 2> /dev/null || true
  wait "${trunk_closure_owned_context_watcher}" 2> /dev/null || true
  trunk_closure_owned_context_watcher=
}

trunk_closure_owned_context_prompt() {
  printf '%s\n' "Use this project's installed Open Dough guidance. Complete the retained Trunk Mode final-closure candidate described in ${trunk_closure_owned_context_state_file}, including its authorized publication, CI observation handoff, and local resource cleanup. This project has no default checkout. Report the observed closure result. Treat the installed guidance and retained project state as the task inputs; do not inspect parent processes or external test-harness source."
}

trunk_closure_owned_context_observe() {
  local root=${trunk_closure_workspace%/*} repository=${trunk_closure_repository}
  printf 'cleanup-observer-state: %s\n' \
    "$(cat "${root}/cleanup-observer-state" 2> /dev/null || echo none)"
  printf 'branch-present: %s\n' "$(
    git -C "${repository}" show-ref --quiet --verify refs/heads/exec/trunk \
      && echo true || echo false
  )"
  printf 'repository-intact: %s\n' "$(git_publication_repository_intact "${repository}")"
  printf 'other-checkouts: %s\n' \
    "$(git_publication_other_checkouts "${repository}" | paste -sd, -)"
  printf 'default-checkout-present: %s\n' \
    "$([[ -e ${trunk_closure_integration} ]] && echo true || echo false)"
}

# Beyond the ignored-only closure's gates: the observer had shut down when the
# worktree disappeared, and the worktree and its branch are gone from an
# intact repository Git directory with no other checkout.
trunk_closure_owned_context_assess() {
  local observations=$1
  grep -Eq '^cleanup-observer-state: (stopped|finished)$' "${observations}" \
    && grep -Fxq 'checkout-present-after: false' "${observations}" \
    && grep -Fxq 'branch-present: false' "${observations}" \
    && grep -Fxq 'repository-intact: true' "${observations}" \
    && grep -Fxq 'other-checkouts: ' "${observations}" \
    && grep -Fxq 'default-checkout-present: false' "${observations}"
}

run_trunk_closure_owned_context_counterexamples() {
  local work field
  work=$(mktemp -d)
  # shellcheck disable=SC2064
  trap "rm -rf -- '${work}'" RETURN
  trunk_closure_write_assessor_observation \
    "${work}/valid.txt" owned-context not_required success 0
  printf '%s\n' 'cleanup-observer-state: stopped' 'branch-present: false' \
    'repository-intact: true' 'other-checkouts: ' \
    'default-checkout-present: false' >> "${work}/valid.txt"
  trunk_closure_assess owned-context "${work}/valid.txt"
  for field in 'cleanup-observer-state: missing' \
    'cleanup-observer-state: running' 'checkout-present-after: true' \
    'branch-present: true' 'repository-intact: false' \
    "other-checkouts: ${work}/integration" 'default-checkout-present: true'; do
    sed "s|^${field%%: *}: .*|${field}|" "${work}/valid.txt" > "${work}/bad.txt"
    if trunk_closure_assess owned-context "${work}/bad.txt"; then
      printf 'FAIL: trunk-closure/owned-context passed with %s\n' "${field}" >&2
      return 1
    fi
  done
}
