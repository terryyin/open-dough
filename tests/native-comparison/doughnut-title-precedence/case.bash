#!/usr/bin/env bash
# Fixture, cleanup and observer of the doughnut-title-precedence case
# (case.md): the runner (tests/support/native-comparison-run.sh) sources this
# file and assess.bash. The fixture materializes Doughnut at the pinned
# revision from a durable Git source as a fresh linked worktree with its own
# Gradle home, caches and temporary files under ROOT; cleanup retires the
# worktree database the agent's backend tests provision. The observer prints
# `turn-1-*` fields from the test runs record-tests.gradle recorded and the
# checkout's final state. None of them judges.
# shellcheck disable=SC2034,SC2312 # case_* globals are read by the runner; observations print what each command gives.

case_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)
case_events=''
case_revision=e257b144d1e9120528922da0f5dc045acb6c9d6d
case_source=${NATIVE_COMPARISON_DOUGHNUT_SOURCE:-https://github.com/nerds-odd-e/doughnut.git}
# An optional Gradle user home whose dependency and wrapper caches seed each
# arm's own copy (copy-on-write where the file system allows); without it
# Gradle downloads them.
case_gradle_seed=${NATIVE_COMPARISON_GRADLE_SEED-${HOME}/.gradle}
case_seam=backend/src/main/java/com/odde/donut/services/WikiLinkNoteCandidates.java
case_assertion='NoteControllerShowWikiLinkTitlePrecedenceTests	selectsTitleBeforeAliasesAcrossAuthoredLinkForms'

# Requires what the project's backend proof needs from this host: Nix, Git,
# MySQL on 127.0.0.1:3309 (Doughnut's docs/worktree-backend-tests.md) and an
# arm ROOT outside macOS's per-user temporary directory, where Nix ignores
# TMPDIR and falls back to /tmp, which the agent's sandbox cannot write.
case_preflight() {
  local user_temp
  user_temp=$(getconf DARWIN_USER_TEMP_DIR 2> /dev/null) && user_temp=$(cd -- "${user_temp}" && pwd -P)
  if [[ -n ${user_temp} && $(cd -- "$1" && pwd -P)/ == "${user_temp}"/* ]]; then
    echo 'doughnut-title-precedence: place the arm outside the per-user temporary directory (set TMPDIR)' >&2
    return 1
  fi
  command -v nix > /dev/null || {
    echo 'doughnut-title-precedence: Nix is required' >&2
    return 1
  }
  nc -z 127.0.0.1 3309 2> /dev/null || {
    echo 'doughnut-title-precedence: MySQL must listen on 127.0.0.1:3309' >&2
    return 1
  }
}

# Builds ROOT/workspace, a linked worktree of the pinned revision, with this
# arm's Gradle home (seeded caches plus record-tests.gradle), pnpm store,
# caches and temporary directory under ROOT, exported for the agent's
# commands; installs the payload from SOURCE_DIR for HOST; then enters the
# project's recorded Nix profile and runs its worktree setup. Leaves
# case_basis_seam and case_project_basis.
case_materialize() {
  local root=$1 source_dir=$2 host=$3 workspace="$1/workspace" gradle="$1/gradle"
  case_preflight "${root}" || return
  git init -q --bare "${root}/doughnut.git" \
    && git -C "${root}/doughnut.git" fetch -q --depth 1 "${case_source}" "${case_revision}" \
    && git -C "${root}/doughnut.git" worktree add -q --detach "${workspace}" "${case_revision}" \
    || return
  mkdir -p -- "${gradle}/init.d" "${gradle}/caches" "${root}/tmp" "${root}/cache" || return
  if [[ -d ${case_gradle_seed}/caches/modules-2 ]]; then
    /bin/cp -cR "${case_gradle_seed}/caches/modules-2" "${gradle}/caches/" \
      && /bin/cp -cR "${case_gradle_seed}/wrapper" "${gradle}/" || return
  fi
  cp -- "${case_dir}/record-tests.gradle" "${gradle}/init.d/" || return
  # Before the project's setup links Claude skill directories to the
  # installed ones, the selected payload replaces the project's own copy.
  delivery_evidence_install_payload "${source_dir}" "${workspace}" "${host}" --force || return
  export GRADLE_USER_HOME=${gradle} TMPDIR="${root}/tmp" XDG_CACHE_HOME="${root}/cache"
  # zsh writes here-documents under TMPPREFIX (default /tmp/zsh), not TMPDIR.
  export TMPPREFIX="${root}/tmp/zsh"
  export npm_config_store_dir="${root}/pnpm-store" pnpm_config_store_dir="${root}/pnpm-store"
  # Java takes its temporary directory from the host, not TMPDIR; the agent's
  # write sandbox admits only the arm's own.
  export JAVA_TOOL_OPTIONS="${JAVA_TOOL_OPTIONS:+${JAVA_TOOL_OPTIONS} }-Djava.io.tmpdir=${root}/tmp"
  export CYPRESS_INSTALL_BINARY=0
  unset SPRING_DATASOURCE_URL DB_URL SPRING_FLYWAY_URL
  (cd -- "${workspace}" && ./scripts/run.sh bash scripts/worktree_setup.sh) \
    > "${root}/setup.log" 2>&1 || return
  case_basis_seam=$(git -C "${workspace}" rev-parse "HEAD:${case_seam}")
  case_project_basis="doughnut=$(git -C "${workspace}" rev-parse HEAD) seam=${case_basis_seam}"
}

# Retires the worktree database the agent's backend tests provisioned, through
# the project's own retirement, and prints the cleanup field.
case_cleanup() {
  local workspace="$1/workspace"
  if [[ ! -f ${workspace}/.worktree.local.json ]]; then
    # None was provisioned, or the agent retired its own with the identity.
    echo 'cleanup: no-worktree-identity'
  elif (cd -- "${workspace}" && ./scripts/run.sh pnpm worktree:retire) > "$1/retire.log" 2>&1; then
    echo 'cleanup: database-retired'
  else
    echo 'cleanup: retirement-failed'
  fi
}

# One line per recorded test run under GRADLE_HOME, in start order:
# `STATE SELECTED FAILURES TESTS SCRATCH WITNESS` where STATE is pinned (no
# product or test change), seam (only the resolver changed), tests-changed
# or other; SELECTED is the case assertion's result (or absent), with
# DESTINATION when its failure is the destination-ID assertion; SCRATCH the
# untracked test results; WITNESS yes when their output or messages show an
# ambiguous or missing destination.
case_test_runs() {
  local run state files
  for run in "$1"/test-runs/*/; do
    [[ -f ${run}state ]] || continue
    files=("${run}state" "${run}results")
    [[ ! -f ${run}output ]] || files+=("${run}output")
    state=$(awk -v seam="${case_seam}" '
      $1 != "changed" || $3 ~ /^\.(agents|claude)\// { next }
      $3 == seam { s = 1; next }
      $3 ~ /\/src\/test\// { t = 1; next }
      { o = 1 }
      END { print t ? "tests-changed" : o ? "other" : s ? "seam" : "pinned" }' "${run}state")
    awk -F '\t' -v state="${state}" -v assertion="${case_assertion}" \
      -v wrong_destination='ambiguous|destination[a-z]*["'"'"']? *[=:] *null' '
      BEGIN { split(assertion, a, "\t") }
      FILENAME ~ /state$/ {
        if ($0 ~ /^untracked .*src\/test\/java\/.*\.java$/) {
          path = $0; sub(/^.*src\/test\/java\//, "", path); sub(/\.java$/, "", path)
          gsub("/", ".", path); scratch[path] = 1
        }
        next
      }
      FILENAME ~ /results$/ {
        tests++; if ($1 == "FAILURE") failures++
        method = $3; sub(/\(\)$/, "", method)
        if ($2 ~ "\\." a[1] "$" && method == a[2]) {
          selected = $1
          if ($1 == "FAILURE" && $4 ~ /every item is/) selected = "DESTINATION"
        }
        owner = $2; sub(/\$.*/, "", owner)
        if (owner in scratch) { scratched++; if (tolower($4) ~ wrong_destination) witness = "yes" }
        next
      }
      { if (tolower($2) ~ wrong_destination) witness = "yes" }
      END { printf "%s %s %d %d %d %s\n", state, selected ? selected : "absent", failures, tests, scratched, witness ? witness : "no" }
    ' "${files[@]}"
  done
}

# Prints the baseline, fault, witness and restored fields from case_test_runs
# lines on standard input: the baseline is the first pinned run that ran the
# assertion before any seam run; the fault, every seam-only run that ran it;
# the witness, untracked tests in a seam-only run; the restored proof, the
# last pinned run that ran the assertion after the last seam run.
case_proof_fields() {
  awk -v turn="$1" '
    { n++ }
    $1 == "seam" { seen = 1; restored = ""; if ($5 > 0) witness = (witness == "observed" || $6 == "yes") ? "observed" : "silent" }
    $1 == "seam" && $2 != "absent" { fault = (fault == "destination-id-failed" || $2 == "DESTINATION") ? "destination-id-failed" : (fault == "green" || $2 == "SUCCESS") ? "green" : "other-assertion" }
    $1 == "tests-changed" && !fault { fault = "assertions-changed" }
    $1 == "pinned" && $2 != "absent" && !seen && !baseline { baseline = ($2 == "SUCCESS" && $3 == 0) ? "passed" : "failed"; baseline_tests = $4 }
    $1 == "pinned" && $2 != "absent" && seen { restored = ($2 != "SUCCESS" || $3 > 0) ? "failed" : $5 > 0 ? "with-scratch" : "passed"; restored_tests = $4 }
    END {
      printf "turn-%s-proof-runs: %d\n", turn, n
      printf "turn-%s-baseline: %s\nturn-%s-baseline-tests: %d\n", turn, baseline ? baseline : "none", turn, baseline_tests
      printf "turn-%s-fault: %s\n", turn, fault ? fault : "none"
      printf "turn-%s-witness: %s\n", turn, witness ? witness : "none"
      printf "turn-%s-restored: %s\nturn-%s-restored-tests: %d\n", turn, restored ? restored : "none", turn, restored_tests
    }'
}

# The skill verdict the agent's final response names first, or missing.
case_verdict() {
  native_host_stream codex "$1" response | grep -Eio -m 1 \
    'caught|assertion gap|confirmed missing test path|insufficient evidence' \
    | head -n 1 | tr 'A-Z ' 'a-z-' | grep . || echo missing
}

# Prints the turn-N fields of ROOT after turn N, whose stream is STREAM, and
# keeps the recorded test runs in SCRATCH/case-evidence; HARNESS is a pattern
# naming the controller's paths. Turn status and thread come from the runner.
case_observe() {
  local root=$1 turn=$2 stream=$3 scratch=$4 harness=$5 workspace="$1/workspace" checkout=restored
  case_test_runs "${root}/gradle" | case_proof_fields "${turn}"
  if [[ -d ${root}/gradle/test-runs ]]; then
    mkdir -p -- "${scratch}/case-evidence"
    rm -rf -- "${scratch}/case-evidence/test-runs-turn-${turn}"
    cp -R -- "${root}/gradle/test-runs" "${scratch}/case-evidence/test-runs-turn-${turn}"
  fi
  [[ $(git -C "${workspace}" hash-object -- "${case_seam}") == "${case_basis_seam}" ]] || checkout=changed
  [[ -z $(git -C "${workspace}" status --porcelain --untracked-files=all -- . ':!.agents' ':!.claude') ]] \
    || checkout=changed
  printf 'turn-%s-source: %s\n' "${turn}" "${checkout}"
  printf 'turn-%s-verdict: %s\n' "${turn}" "$(case_verdict "${stream}")"
  printf 'turn-%s-harness-inspected: %s\n' "${turn}" \
    "$(native_host_stream codex "${stream}" commands \
      | native_harness_inspected "${harness}|init\.d|test-runs" -)"
  printf 'turn-%s-commands: %s\n' "${turn}" \
    "$(native_host_stream codex "${stream}" commands | wc -l | tr -d ' ')"
}
