#!/usr/bin/env bash
# Credential-free substitute-host suites for Distribution/tests/git-publication-native.sh,
# Distribution/tests/git-publication-native-one-shot.sh and
# tests/git-publication-native-owned-context.sh.
# shellcheck disable=SC2034,SC2154,SC2312 # Globals assigned by sourced helpers.

# shellcheck source=Distribution/tests/support/git-publication-native-substitute-admission.sh
# shellcheck disable=SC1091
source "$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)/git-publication-native-substitute-admission.sh"
# shellcheck source=Distribution/tests/support/git-publication-native-substitute-one-shot.sh
# shellcheck disable=SC1091
source "$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)/git-publication-native-substitute-one-shot.sh"

# Puts substitute hosts first on PATH: every host runs the publication
# sentinel, beside the admission, one-shot and owned-context sentinels. Sets
# substitute_work, the suite's scratch directory, and substitute_run_log, the
# sentinels' invocation log inside it.
prepare_substitute_hosts() {
  local sentinel_bin host
  substitute_work=$(mktemp -d)
  sentinel_bin="${substitute_work}/bin"
  substitute_run_log="${substitute_work}/run.log"
  mkdir -p -- "${sentinel_bin}"
  for host in codex cursor claude; do
    cp -- "${source_dir}/Distribution/tests/support/native-agent-publication.sh" \
      "${sentinel_bin}/${host}"
    chmod a+x "${sentinel_bin}/${host}"
  done
  cp -- "${source_dir}/Distribution/tests/support/native-agent-admission.sh" \
    "${source_dir}/Distribution/tests/support/native-agent-land-default.sh" \
    "${source_dir}/Distribution/tests/support/native-agent-one-shot.sh" \
    "${source_dir}/Distribution/tests/support/native-agent-one-shot-escalation.sh" \
    "${source_dir}/Distribution/tests/support/native-agent-one-shot-review.sh" \
    "${source_dir}/Distribution/tests/support/native-agent-one-shot-policy.sh" \
    "${source_dir}/Distribution/tests/support/native-agent-owned-context.sh" \
    "${sentinel_bin}/"

  export PATH="${sentinel_bin}:${PATH}"
  # Credential-free counterexamples do not retain attempt directories.
  native_case_results_dir=
}

# Runs journey $3 on substitute host $2 under the environment assignments
# after them, into a new run directory, substitute_artifact, named after $1 in
# substitute_work. Leaves the runner's verdict in git_publication_assess_*,
# the run's exit status in substitute_status, and its observation, with
# run-specific values named, in substitute_work/$1.txt. The run directory's
# host-exit.log holds the run's status, outcome and seconds after each host
# session's own record (native-agent-publication.sh).
substitute_run() {
  local name=$1 host=$2 journey=$3 assignment started
  shift 3
  substitute_artifact=$(mktemp -d "${substitute_work}/${name}.XXXXXX")
  for assignment in "$@"; do export "${assignment?}"; done
  substitute_status=0
  started=${EPOCHREALTIME}
  NATIVE_AGENT_SENTINEL_LOG="${substitute_run_log}" \
    NATIVE_AGENT_EXIT_LOG="${substitute_artifact}/host-exit.log" \
    git_publication_run_journey "${source_dir}" "${host}" "${journey}" \
    "${substitute_artifact}" || substitute_status=$?
  awk -v s="${started}" -v e="${EPOCHREALTIME}" -v status="${substitute_status}" \
    -v outcome="${native_run_outcome:-}" -v reason="${native_run_failure_reason:-}" \
    'BEGIN { printf "run exited %s after %.1f s; native outcome %s: %s\n", status, e - s, outcome, reason }' \
    >> "${substitute_artifact}/host-exit.log"
  for assignment in "$@"; do unset "${assignment%%=*}"; done
  substitute_observation "${substitute_artifact}/observations.txt" \
    "${substitute_artifact}" > "${substitute_work}/${name}.txt"
}

# substitute_run, then exits the suite, showing the run's records and
# removing any kept fixture, unless the run exited 0 and its journey passed.
substitute_run_passes() {
  local file
  substitute_run "$@"
  if [[ ${substitute_status} -eq 0 && ${git_publication_assess_status} == pass ]]; then
    return 0
  fi
  echo "FAIL: substitute $2 $3 exited ${substitute_status}, assessment ${git_publication_assess_status}: ${git_publication_assess_reason}" >&2
  for file in host-exit.log stderr.log observations.txt response.md events.jsonl; do
    printf -- '--- %s\n' "${file}" >&2
    cat "${substitute_artifact}/${file}" >&2 2> /dev/null || true
  done
  substitute_hosts_running "${substitute_artifact}/host-exit.log" >&2
  git_publication_fixture_cleanup
  exit 1
}

# Prints each host session that host exit log $1 shows started and not ended
# and that is still running now; one gone without an end was killed.
substitute_hosts_running() {
  local pid
  # A session record reads `<host> pid <pid> after <seconds> s: <event>`.
  awk '$2 != "pid" { next }
    $7 == "started" { open[$3] = 1 }
    $7 == "exited" || $7 == "caught" { delete open[$3] }
    END { for (pid in open) print pid }' "$1" 2> /dev/null \
    | while read -r pid; do
      if kill -0 "${pid}" 2> /dev/null; then
        printf 'host pid %s is still running\n' "${pid}"
      fi
    done
}

# Prints observation $1 with the values that differ between runs named: the
# SHA each of candidate-sha, trunk-sha and base-sha holds as that field's
# name, any other SHA as <sha>, and each path below run directory $2 as
# <run>.
substitute_observation() {
  awk -v run="$2/" '
    BEGIN { for (i = 0; i < 40; i++) hex = hex "[0-9a-f]" }
    NR == FNR {
      if ($0 ~ ("^(candidate-sha|trunk-sha|base-sha): " hex "$"))
        name[substr($0, index($0, ": ") + 2)] = "<" substr($0, 1, index($0, ":") - 1) ">"
      next
    }
    {
      line = $0
      out = ""
      while (match(line, hex)) {
        sha = substr(line, RSTART, RLENGTH)
        out = out substr(line, 1, RSTART - 1) ((sha in name) ? name[sha] : "<sha>")
        line = substr(line, RSTART + RLENGTH)
      }
      line = out line
      while ((at = index(line, run)) > 0) {
        rest = substr(line, at + length(run))
        sub(/^[^\/]*/, "", rest)
        line = substr(line, 1, at - 1) "<run>" rest
      }
      print line
    }
  ' "$1" "$1"
}

run_substitute_host_journeys() {
  local work host journey journey_host
  prepare_substitute_hosts
  work=${substitute_work}

  for host in codex cursor claude; do
    : > "${substitute_run_log}"
    substitute_run_passes "${host}-publish-boundary" "${host}" publish-boundary
    if ! grep -Fq "${host}" "${substitute_run_log}"; then
      echo "FAIL: substitute ${host} left no invocation log." >&2
      cat "${substitute_run_log}" >&2
      exit 1
    fi
  done

  # Whole-run switches, each a rejected case against the same host's normal
  # run above: a stream cut after the push, and a claimed push that never
  # happened.
  git_publication_candidate_counterexamples "${work}/codex-publish-boundary.txt"
  substitute_run truncated codex publish-boundary NATIVE_AGENT_STREAM=truncated
  [[ ${substitute_status} -ne 0 ]]
  native_assessor_rejects truncated stream "${work}/truncated.txt" \
    fail 'incomplete or stale native stream'
  substitute_run skip-push codex publish-boundary NATIVE_PUBLICATION_SKIP_PUSH=1
  [[ ${substitute_status} -eq 0 ]]
  native_assessor_rejects skip-push remote-acceptance "${work}/skip-push.txt" \
    fail 'missing remote acceptance'
  # A host exiting non-zero after a complete stream leaves the observation of
  # a normal run; the runner, not the assessor, fails that journey.
  substitute_run exit-after-complete cursor publish-boundary \
    NATIVE_AGENT_EXIT_AFTER_COMPLETE=1
  [[ ${substitute_status} -ne 0 ]]
  cmp -s "${work}/cursor-publish-boundary.txt" "${work}/exit-after-complete.txt"
  [[ ${git_publication_assess_reason} == 'native host exited 1 before completing the journey' ]]
  grep -Eq '^cursor pid [0-9]+ after [0-9.]+ s: exited 1$' "${substitute_artifact}/host-exit.log"

  for journey in local-only claim-race uncertain-recovery preparation \
    story-branch-increment \
    trunk-closure story-branch-closure bug-disposition; do
    journey_host=cursor
    if [[ ${journey} == 'story-branch-increment' ]]; then
      journey_host=codex
    fi
    substitute_run_passes "journey-${journey}" "${journey_host}" "${journey}"
  done

  substitute_run_passes journey-land-default-checkout claude land-default-checkout
  run_land_default_assessor_counterexamples \
    "${work}/journey-land-default-checkout.txt"
}
