#!/usr/bin/env bash
# Disposable Trunk Mode closure fixture with an independently released CI run.
# The observer is real; the fixture never writes coverage or terminal evidence,
# and trunk-closure-native-arming.sh gives its coordinator the observer each
# host's guidance does.
# The owned workspace is a worktree created for this execution at trunk, whose
# base commit stands for the accepted before-cleanup commit, so the installed
# `finish` command publishes, completes, and retires it. A watcher records the
# observer's state at the moment the worktree disappears.
# Harness-only shims, logs, and markers live in a separate directory outside
# the project root the agent reads, so they are never part of its task.
# shellcheck disable=SC2034,SC2154,SC2312

# shellcheck source=tests/support/trunk-closure-native-owned-context.sh
# shellcheck disable=SC1091
source "$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)/trunk-closure-native-owned-context.sh"
# shellcheck source=tests/support/trunk-closure-native-arming.sh
# shellcheck disable=SC1091
source "$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)/trunk-closure-native-arming.sh"
# shellcheck source=tests/support/native-harness-observation.sh
# shellcheck disable=SC1091
source "$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)/native-harness-observation.sh"

trunk_closure_git() {
  local cwd=$1
  shift
  git -C "${cwd}" -c user.name='Trunk Closure Fixture' \
    -c user.email='trunk-closure@example.invalid' "$@"
}

trunk_closure_write_gh() {
  local destination=$1
  # shellcheck disable=SC2016 # Variables belong to the generated shim.
  printf '%s\n' \
    '#!/usr/bin/env bash' \
    'set -euo pipefail' \
    'printf "%s\n" "$*" >> "${TRUNK_CLOSURE_GH_LOG}"' \
    'if [[ " $* " == *" run list "* ]]; then' \
    '  if [[ ${TRUNK_CLOSURE_SCENARIO} == source && -f ${TRUNK_CLOSURE_RELEASE} ]]; then' \
    '    printf "%s\n" "${TRUNK_CLOSURE_CANDIDATE_SHA}" >> "${TRUNK_CLOSURE_GH_LOG}"' \
    '    jq -n --arg base "${TRUNK_CLOSURE_BASE_SHA}" --arg candidate "${TRUNK_CLOSURE_CANDIDATE_SHA}" '\''[{databaseId:1,attempt:1,headSha:$base,headBranch:"main",workflowName:"CI",event:"push",status:"completed",conclusion:"success",url:"https://ci.invalid/base",createdAt:"2026-09-22T00:00:00Z"},{databaseId:2,attempt:1,headSha:$candidate,headBranch:"main",workflowName:"CI",event:"push",status:"completed",conclusion:"success",url:"https://ci.invalid/candidate",createdAt:"2026-09-22T00:01:00Z"}]'\''' \
    '  else' \
    '    jq -n --arg base "${TRUNK_CLOSURE_BASE_SHA}" '\''[{databaseId:1,attempt:1,headSha:$base,headBranch:"main",workflowName:"CI",event:"push",status:"completed",conclusion:"success",url:"https://ci.invalid/base",createdAt:"2026-09-22T00:00:00Z"}]'\''' \
    '  fi' \
    'else' \
    '  jq -n '\''{attempt:1,status:"completed",conclusion:"success",url:"https://ci.invalid/run"}'\''' \
    'fi' > "${destination}"
  chmod +x "${destination}"
}

trunk_closure_create_fixture() {
  local source_dir=$1
  local host=$2
  local scenario=$3
  local root=$4
  local harness=$5
  local skill_root
  trunk_closure_origin="${root}/remote.git"
  trunk_closure_integration="${root}/integration"
  trunk_closure_workspace="${root}/owned"
  trunk_closure_storage="${root}/mailboxes"
  trunk_closure_harness=${harness}
  trunk_closure_release="${harness}/release-ci"
  trunk_closure_gh_log="${harness}/gh-calls.log"
  trunk_closure_control_log="${harness}/control.log"
  trunk_closure_cleanup_marker="${harness}/cleanup"
  mkdir -p "${harness}/bin"
  : > "${trunk_closure_gh_log}"
  : > "${trunk_closure_control_log}"

  git init --bare -q -b main "${trunk_closure_origin}"
  git init -q -b main "${trunk_closure_integration}"
  trunk_closure_git "${trunk_closure_integration}" remote add origin \
    "${trunk_closure_origin}"
  mkdir -p "${trunk_closure_integration}/.github/workflows"
  printf 'base\n' > "${trunk_closure_integration}/product.txt"
  printf '%s\n' \
    'name: CI' \
    'on:' \
    '  push:' \
    '    paths-ignore:' \
    "      - '.planning/**'" \
    'jobs:' \
    '  check:' \
    '    runs-on: ubuntu-latest' \
    '    steps:' \
    '      - run: true' \
    > "${trunk_closure_integration}/.github/workflows/ci.yml"
  if [[ ${scenario} == owned-context ]]; then
    trunk_closure_owned_context_base "${source_dir}" "${host}"
  else
    # Installed into the worktree below, as a project ignores it.
    printf '%s\n' '.agents/' '.claude/' '.codex/' '.cursor/' \
      '.planning/execution-state.txt' > "${trunk_closure_integration}/.gitignore"
  fi
  trunk_closure_git "${trunk_closure_integration}" add .
  trunk_closure_git "${trunk_closure_integration}" commit -q -m base
  trunk_closure_git "${trunk_closure_integration}" push -q origin main
  trunk_closure_base_sha=$(git -C "${trunk_closure_integration}" rev-parse HEAD)

  if [[ ${scenario} == owned-context ]]; then
    export TRUNK_CLOSURE_IDENTITY=SEED-T#final-closure
    trunk_closure_owned_context_worktree "${source_dir}"
  else
    trunk_closure_repository=${trunk_closure_integration}
    git -C "${trunk_closure_integration}" worktree add -q -b exec/trunk \
      "${trunk_closure_workspace}" "${trunk_closure_base_sha}"
    # As Git lists it, so the retirement command recognizes its own entry.
    trunk_closure_workspace=$(cd -- "${trunk_closure_workspace}" && pwd -P)
  fi
  mkdir -p "${trunk_closure_workspace}/.planning"
  if [[ ${scenario} == source ]]; then
    printf 'base\nfinal source closure\n' > "${trunk_closure_workspace}/product.txt"
  else
    printf 'final ignored-only closure\n' \
      > "${trunk_closure_workspace}/.planning/final-closure.md"
  fi
  trunk_closure_git "${trunk_closure_workspace}" add .
  trunk_closure_git "${trunk_closure_workspace}" commit -q -m 'final closure'
  trunk_closure_candidate_sha=$(git -C "${trunk_closure_workspace}" rev-parse HEAD)
  if [[ ${scenario} == owned-context ]]; then
    rm -rf -- "${trunk_closure_integration}"
  else
    printf 'base\nhuman pending\n' > "${trunk_closure_integration}/product.txt"
    bash "${source_dir}/install.sh" --target "${trunk_closure_workspace}" \
      --source "${source_dir}" --platform "${host}" > /dev/null
  fi
  skill_root="${trunk_closure_workspace}/.agents/skills/dough-execute-plan"
  [[ ${host} == claude ]] \
    && skill_root="${trunk_closure_workspace}/.claude/skills/dough-execute-plan"
  trunk_closure_launcher="${skill_root}/scripts/ci-mailbox.mjs"

  native_harness_observe_node "${harness}" "${source_dir}" "${host}"
  trunk_closure_node_log=${native_harness_node_log}
  trunk_closure_write_gh "${harness}/bin/gh"
  export DOUGH_CI_MAILBOX_ROOT="${trunk_closure_storage}"
  export TRUNK_CLOSURE_BASE_SHA="${trunk_closure_base_sha}"
  export TRUNK_CLOSURE_CANDIDATE_SHA="${trunk_closure_candidate_sha}"
  export TRUNK_CLOSURE_SCENARIO="${scenario}"
  export TRUNK_CLOSURE_RELEASE="${trunk_closure_release}"
  export TRUNK_CLOSURE_GH_LOG="${trunk_closure_gh_log}"
  trunk_closure_arm_observer "${host}" "${harness}" || return
  if [[ ${scenario} == owned-context ]]; then
    trunk_closure_owned_context_state "${root}" "${host}"
  else
    printf '%s\n' \
      'Execution mode: Trunk Mode' \
      'Authorized target: owner/project main' \
      "Before-cleanup commit: ${trunk_closure_base_sha}, accepted on remote trunk" \
      "Final closure candidate: ${trunk_closure_candidate_sha}" \
      "$(trunk_closure_observer_record "${host}")" \
      "Execution worktree: ${trunk_closure_workspace} on branch exec/trunk, created by this execution" \
      "Default checkout: ${trunk_closure_integration}" \
      'Applicable CI: pending' \
      > "${trunk_closure_workspace}/.planning/execution-state.txt"
  fi
  trunk_closure_watch_cleanup "${harness}"
}

# Records into harness directory $1 the state, when the worktree disappears,
# of the observer the final closure is registered on.
trunk_closure_watch_cleanup() {
  (
    while [[ -d ${trunk_closure_workspace} ]]; do sleep 0.05; done
    trunk_closure_find_observer || true
    jq -r .status "${trunk_closure_mailbox}/result.json" 2> /dev/null \
      > "$1/cleanup-observer-state" || echo missing > "$1/cleanup-observer-state"
    printf 'cleanup\n' >> "${trunk_closure_control_log}"
    : > "${trunk_closure_cleanup_marker}"
  ) &
  trunk_closure_watcher=$!
}

trunk_closure_stop_watch() {
  [[ -n ${trunk_closure_watcher:-} ]] || return 0
  kill "${trunk_closure_watcher}" 2> /dev/null || true
  wait "${trunk_closure_watcher}" 2> /dev/null || true
  trunk_closure_watcher=
}

trunk_closure_cleanup_fixture() {
  trunk_closure_stop_watch
  trunk_closure_end_stream
  native_harness_restore
  unset DOUGH_CI_MAILBOX_ROOT TRUNK_CLOSURE_BASE_SHA
  unset TRUNK_CLOSURE_CANDIDATE_SHA TRUNK_CLOSURE_SCENARIO
  unset TRUNK_CLOSURE_RELEASE
  unset TRUNK_CLOSURE_GH_LOG
  unset TRUNK_CLOSURE_IDENTITY TRUNK_CLOSURE_STATE
}
