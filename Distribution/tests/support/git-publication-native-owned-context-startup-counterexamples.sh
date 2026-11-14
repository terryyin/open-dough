#!/usr/bin/env bash
# Credential-free counterexamples for the startup owned-context journey: each
# mutation alone, observed again, changes one signal of the passing observation.
# Sourced by git-publication-native-owned-context-suite.sh.
# shellcheck disable=SC2034,SC2154,SC2312 # Globals assigned by sourced helpers.

run_startup_owned_context_counterexamples() {
  local workspace=${git_publication_fixture_workspace} seed=.planning/seeds/A.md
  local retained=${git_publication_owned_retained} transcript=${owned_context_transcript}
  git_publication_suite_passes_observed "${owned_context_obs}" \
    owned_context_observe -- 'left the retained worktree untouched'

  # The same start also given the retained worktree as a default checkout.
  cp -- "${transcript}" "${transcript}.kept"
  jq -c --arg d "${retained}" 'if (.item.command? // "" | test("execution-start.mjs start"))
    then .item.command += " --integration \($d)" else . end' \
    "${transcript}.kept" > "${transcript}"
  native_assessor_rejects_observed default-checkout default-checkout \
    "${owned_context_obs}.default-checkout" owned_context_observe -- fail \
    'given a default checkout (--integration)'

  # The same start split by line continuations names --repository on a later
  # line, and a --help probe beside it is not a startup.
  jq -c 'if (.item.command? // "" | test("execution-start.mjs start"))
    then .item.command |= gsub(" --"; " \\\n  --") else . end' \
    "${transcript}.kept" > "${transcript}"
  git_publication_suite_passes_observed "${owned_context_obs}" \
    owned_context_observe -- 'left the retained worktree untouched'
  owned_context_append_started \
    "node execution-start.mjs start --integration ${retained} --help"
  git_publication_suite_passes_observed "${owned_context_obs}" \
    owned_context_observe -- 'left the retained worktree untouched'

  # The shell may quote the script path, which may hold a space: the start
  # still counts with --repository on a later line, and a quoted --help probe
  # (here naming --integration) still does not.
  local quote
  for quote in '"' "'"; do
    jq -c --arg q "${quote}" 'if (.item.command? // "" | test("execution-start.mjs start"))
      then .item.command |= (sub("[^ ]*execution-start[.]mjs"; "\($q)/owned dir/execution-start.mjs\($q)")
        | gsub(" --"; " \\\n  --")) else . end' \
      "${transcript}.kept" > "${transcript}"
    grep -Fq "/owned dir/execution-start.mjs${quote//\"/\\\"} start \\\\" "${transcript}"
    git_publication_suite_passes_observed "${owned_context_obs}" \
      owned_context_observe -- 'left the retained worktree untouched'
    owned_context_append_started \
      "node ${quote}/owned dir/execution-start.mjs${quote} start --integration ${retained} --help"
    git_publication_suite_passes_observed "${owned_context_obs}" \
      owned_context_observe -- 'left the retained worktree untouched'
  done
  mv -- "${transcript}.kept" "${transcript}"

  printf 'changed\n' >> "${retained}/trunk.txt"
  native_assessor_rejects_observed retained-changed retained \
    "${owned_context_obs}.retained-changed" owned_context_observe -- fail \
    'retained worktree changed'
  git -C "${retained}" checkout -q -- trunk.txt

  cp -- "${workspace}/${seed}" "${workspace}/${seed}.kept"
  cp -- "${retained}/${seed}" "${workspace}/${seed}"
  native_assessor_rejects_observed local-copy workspace-source \
    "${owned_context_obs}.local-copy" owned_context_observe -- fail 'published source (local-copy)'
  mv -- "${workspace}/${seed}.kept" "${workspace}/${seed}"

  touch -t 200001010000 "${workspace}/feature.txt"
  native_assessor_rejects_observed feature-before-claim claim-order \
    "${owned_context_obs}.feature-before-claim" owned_context_observe -- fail \
    'crossed claim boundary'
  touch "${workspace}/feature.txt"

  git_publication_suite_passes_observed "${owned_context_obs}" \
    owned_context_observe -- 'left the retained worktree untouched'
}
