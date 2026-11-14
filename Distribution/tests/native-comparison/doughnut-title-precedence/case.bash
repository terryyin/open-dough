#!/usr/bin/env bash
# Fixture, cleanup and observer of the doughnut-title-precedence case
# (case.md): the runner (Distribution/tests/support/native-comparison-run.sh) sources this
# file and assess.bash. The fixture materializes Doughnut at the pinned
# revision from a durable Git source as a fresh checkout with its own Gradle
# home, caches, temporary files and MySQL server under ROOT; cleanup stops
# that server. The observer prints `turn-1-*` fields from the test runs
# record-tests.gradle recorded and the checkout's final state. None of them
# judges.
# shellcheck disable=SC2016,SC2034,SC2312 # case_* globals are read by the runner; observations print what each command gives; the server script expands inside its Nix shell.

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
# The project's fixed local MySQL and Redis ports, where a developer's live
# servers listen: the agent's sandbox may connect to neither.
native_codex_denied_ports=(3309 6380)

# Requires what the project's backend proof needs from this host: Nix, Git,
# Node and an arm ROOT outside macOS's per-user temporary directory, where
# Nix ignores TMPDIR and falls back to /tmp, which the agent's sandbox cannot
# write.
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
}

# A free local TCP port.
case_free_port() {
  node -e 'const s = require("node:net").createServer();
    s.listen(0, "127.0.0.1", () => { console.log(s.address().port); s.close(); });'
}

# Starts the arm's own MySQL server under ROOT/mysql through the project's
# own server setup (scripts/mysql_nix_shared.sh in its Nix profile) on free
# ports, creates the project's users and databases from its
# scripts/sql/init_doughnut_db.sql, and leaves case_mysql_admin (the
# server's mysqladmin) and case_database_url.
case_database_start() {
  local root=$1 port xport
  port=$(case_free_port) && xport=$(case_free_port) || return
  case_mysql_admin=$(cd -- "${root}/workspace" && ./scripts/run.sh bash -c '
    export MYSQL_HOME=$1 MYSQL_DATADIR=$1/data MYSQL_PID_FILE=$1/mysql.pid
    export MYSQL_UNIX_SOCKET=$1/mysql.sock MYSQLX_UNIX_SOCKET=$1/mysqlx.sock
    export MYSQL_TCP_PORT=$2 MYSQLX_TCP_PORT=$3
    mkdir -p -- "$1" && source scripts/mysql_nix_shared.sh \
      && mysql_nix_prepare_datadir > "$1/initialize.log" 2>&1 \
      && { mysql_nix_start_mysqld_background; } \
      && "${MYSQL_BASEDIR}/bin/mysqladmin" --wait=120 -u root -S "$1/mysql.sock" ping > /dev/null \
      && "${MYSQL_BASEDIR}/bin/mysql" -u root -S "$1/mysql.sock" < scripts/sql/init_doughnut_db.sql \
      && echo "case-mysqladmin: ${MYSQL_BASEDIR}/bin/mysqladmin"' _ "${root}/mysql" "${port}" "${xport}" \
    2>> "${root}/setup.log" | sed -n 's/^case-mysqladmin: //p') && [[ -x ${case_mysql_admin} ]] || return
  case_database_url="jdbc:mysql://127.0.0.1:${port}/doughnut_test?connectionTimeZone=UTC&forceConnectionTimeZoneToSession=true"
}

# Builds ROOT/workspace, a fresh checkout of the pinned revision, with this
# arm's Gradle home (seeded caches, record-tests.gradle and
# arm-database.gradle), pnpm store, caches and temporary directory under ROOT,
# exported for the agent's commands; installs the payload from PAYLOAD_DIR for
# HOST; enters the project's recorded Nix profile and runs its worktree
# setup; starts the arm's MySQL server and migrates its test database. The
# checkout is a primary one, so the project's backend proof keeps a
# caller-supplied datasource URL: the arm's server's. Leaves case_basis_seam
# and case_project_basis.
case_materialize() {
  local root=$1 payload=$2 host=$3 workspace="$1/workspace" gradle="$1/gradle"
  case_preflight "${root}" || return
  git init -q "${workspace}" \
    && git -C "${workspace}" fetch -q --depth 1 "${case_source}" "${case_revision}" \
    && git -C "${workspace}" -c advice.detachedHead=false checkout -q --detach FETCH_HEAD \
    || return
  mkdir -p -- "${gradle}/init.d" "${gradle}/caches" "${root}/tmp" "${root}/cache" || return
  if [[ -d ${case_gradle_seed}/caches/modules-2 ]]; then
    /bin/cp -cR "${case_gradle_seed}/caches/modules-2" "${gradle}/caches/" \
      && /bin/cp -cR "${case_gradle_seed}/wrapper" "${gradle}/" || return
  fi
  cp -- "${case_dir}/record-tests.gradle" "${case_dir}/arm-database.gradle" "${gradle}/init.d/" || return
  # Single-use build processes, as the project's isolated-checkout route
  # runs them, so none outlives the arm.
  printf 'org.gradle.daemon=false\n' > "${gradle}/gradle.properties"
  # Before the project's setup links Claude skill directories to the
  # installed ones, the selected payload replaces the project's own copy.
  delivery_evidence_install_payload "${payload}" "${workspace}" "${host}" --force || return
  export GRADLE_USER_HOME=${gradle} TMPDIR="${root}/tmp" XDG_CACHE_HOME="${root}/cache"
  # zsh writes here-documents under TMPPREFIX (default /tmp/zsh), not TMPDIR.
  export TMPPREFIX="${root}/tmp/zsh"
  export npm_config_store_dir="${root}/pnpm-store" pnpm_config_store_dir="${root}/pnpm-store"
  # Java takes its temporary directory from the host, not TMPDIR; the agent's
  # write sandbox admits only the arm's own.
  export JAVA_TOOL_OPTIONS="${JAVA_TOOL_OPTIONS:+${JAVA_TOOL_OPTIONS} }-Djava.io.tmpdir=${root}/tmp"
  export CYPRESS_INSTALL_BINARY=0
  unset DB_URL SPRING_FLYWAY_URL
  (cd -- "${workspace}" && ./scripts/run.sh bash scripts/worktree_setup.sh) \
    > "${root}/setup.log" 2>&1 || return
  case_database_start "${root}" || return
  printf '%s\n' "${case_database_url}" > "${gradle}/arm-database.url"
  export SPRING_DATASOURCE_URL=${case_database_url}
  (cd -- "${workspace}" \
    && ./scripts/run.sh backend/gradlew -p backend migrateTestDB -Dspring.profiles.active=test) \
    >> "${root}/setup.log" 2>&1 || return
  case_basis_seam=$(git -C "${workspace}" rev-parse "HEAD:${case_seam}")
  case_project_basis="doughnut=$(git -C "${workspace}" rev-parse HEAD) seam=${case_basis_seam}"
}

# Stops the arm's MySQL server and prints the cleanup field.
case_cleanup() {
  local mysql="$1/mysql" pid
  pid=$(cat -- "${mysql}/mysql.pid" 2> /dev/null) || {
    echo 'cleanup: no-database-server'
    return 0
  }
  "${case_mysql_admin}" -u root -S "${mysql}/mysql.sock" shutdown > /dev/null 2>&1 || true
  if kill -0 "${pid}" 2> /dev/null; then
    kill "${pid}" 2> /dev/null
    echo 'cleanup: database-server-killed'
  else
    echo 'cleanup: database-server-stopped'
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
  mkdir -p -- "${scratch}/case-evidence"
  case_test_runs "${root}/gradle" > "${scratch}/case-evidence/test-run-facts-turn-${turn}.txt"
  case_proof_fields "${turn}" < "${scratch}/case-evidence/test-run-facts-turn-${turn}.txt"
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
