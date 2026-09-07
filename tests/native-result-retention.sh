#!/usr/bin/env bash
# Credential-free proof that a selected context attempt survives scratch cleanup.
# shellcheck disable=SC2312 # pipefail covers listings, logs, and result-path parses.
set -euo pipefail

source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)
context_wrapper="${source_dir}/tests/dough-adr-awareness-context.sh"

work_dir=$(mktemp -d)
finish() {
  chmod -R u+w "${work_dir}" 2> /dev/null || true
  rm -rf -- "${work_dir}"
}
trap finish EXIT

sentinel_bin="${work_dir}/bin"
watched_dir="${work_dir}/watched"
results_dir="${work_dir}/results"
unwritable_dir="${work_dir}/unwritable"
list_log="${work_dir}/list.log"
run_log="${work_dir}/run.log"
stdout_file="${work_dir}/stdout.txt"
stderr_file="${work_dir}/stderr.txt"
mkdir -p -- "${sentinel_bin}" "${watched_dir}" "${results_dir}" "${unwritable_dir}"
chmod a-w "${unwritable_dir}"
cp -- "${source_dir}/tests/support/native-agent-recorded.sh" "${sentinel_bin}/codex"
cp -- "${source_dir}/tests/support/native-agent-recorded.sh" "${sentinel_bin}/cursor"
cp -- "${source_dir}/tests/support/native-agent-recorded.sh" "${sentinel_bin}/claude"
chmod a+x "${sentinel_bin}/codex" "${sentinel_bin}/cursor" "${sentinel_bin}/claude"
export PATH="${sentinel_bin}:${PATH}"

assert_watched_empty() {
  local leftover
  leftover=$(find "${watched_dir}" -mindepth 1 -print)
  if [[ -n ${leftover} ]]; then
    echo 'FAIL: scratch remained after the wrapper returned.' >&2
    printf '%s\n' "${leftover}" >&2
    return 1
  fi
}

assert_only_host() {
  local log=$1
  local host=$2
  local line

  if [[ ! -s ${log} ]]; then
    echo 'FAIL: selected run recorded no native invocations.' >&2
    return 1
  fi
  while IFS= read -r line; do
    case ${line} in
      "${host}" | "${host}"' '*) ;;
      *)
        echo "FAIL: invocation log included a non-${host} command." >&2
        printf '%s\n' "${line}" >&2
        return 1
        ;;
    esac
  done < "${log}"
}

assert_attempt() {
  local attempt=$1
  local host=$2
  local case_id=$3
  local version_command=$4

  [[ -d ${attempt} ]]
  [[ -f ${attempt}/record ]]
  [[ -f ${attempt}/events.jsonl ]]
  [[ -f ${attempt}/response.md ]]
  [[ -f ${attempt}/observations.txt ]]
  [[ -f ${attempt}/before-snapshot.txt ]]
  [[ ! -e ${attempt}/adopter ]]
  [[ ! -e ${attempt}/candidate ]]
  [[ ! -e ${attempt}/codex-state ]]
  grep -Fq "host: ${host}" "${attempt}/record"
  grep -Fq "case: ${case_id}" "${attempt}/record"
  grep -Fq 'origin: fresh' "${attempt}/record"
  grep -Fq 'execution-status: completed' "${attempt}/record"
  grep -Fq "native-version-command: ${version_command}" "${attempt}/record"
  grep -Fq 'assessment-status: not-run' "${attempt}/record"
  grep -Fq 'assessment-interpretation: none' "${attempt}/record"
  if grep -Fq 'assessment-status: pass' "${attempt}/record"; then
    echo 'FAIL: complete execution was recorded as a wording pass.' >&2
    cat "${attempt}/record" >&2
    return 1
  fi
  if grep -Fq 'assessment-interpretation: limited-wording' "${attempt}/record"; then
    echo 'FAIL: complete execution used the success wording interpretation.' >&2
    cat "${attempt}/record" >&2
    return 1
  fi
  grep -Fq 'prerequisite-reason:' "${attempt}/record"
  grep -Fq 'prerequisite-evidence:' "${attempt}/record"
  case ${host} in
    claude)
      grep -Fq 'prerequisite-result: inconclusive' "${attempt}/record"
      ;;
    *)
      grep -Fq 'prerequisite-result: pass' "${attempt}/record"
      ;;
  esac
}

assert_unreviewed() {
  local host=$1
  local case_id=$2
  local attempt=$3
  local listing record

  : > "${list_log}"
  listing=$(
    env TMPDIR="${watched_dir}" PATH="${PATH}" \
      NATIVE_AGENT_SENTINEL_LOG="${list_log}" \
      bash "${context_wrapper}" --list --results-dir "${results_dir}"
  )
  if [[ -s ${list_log} ]]; then
    echo 'FAIL: listing invoked a native command.' >&2
    cat "${list_log}" >&2
    return 1
  fi
  assert_watched_empty
  record=$(awk -v h="${host}" -v c="${case_id}" '
    BEGIN { RS = "" }
    index($0, "host: " h "\n") == 1 && $0 ~ ("\ncase: " c "(\n|$)") {
      print
      found = 1
      exit
    }
    END { if (!found) exit 1 }
  ' <<< "${listing}")
  grep -Fq "prior-evidence: unreviewed ${attempt}" <<< "${record}"
  if grep -Eq 'prior-evidence: (pass|certified|accepted)' <<< "${record}"; then
    echo 'FAIL: listing certified retained evidence.' >&2
    printf '%s\n' "${record}" >&2
    return 1
  fi
}

run_selected() {
  local host=$1
  local case_id=$2
  shift 2
  local status attempt version_command

  : > "${run_log}"
  : > "${stdout_file}"
  : > "${stderr_file}"
  set +e
  env TMPDIR="${watched_dir}" PATH="${PATH}" \
    NATIVE_AGENT_SENTINEL_LOG="${run_log}" \
    bash "${context_wrapper}" "$@" > "${stdout_file}" 2> "${stderr_file}"
  status=$?
  set -e
  if [[ ${status} -ne 0 ]]; then
    echo "FAIL: selected ${host} ${case_id} exited ${status}." >&2
    cat "${stdout_file}" >&2
    cat "${stderr_file}" >&2
    cat "${run_log}" >&2
    return 1
  fi
  assert_watched_empty
  assert_only_host "${run_log}" "${host}"
  attempt=$(awk '/^result-path: / { sub(/^result-path: /, ""); path=$0 } END { if (path=="") exit 1; print path }' \
    "${stdout_file}")
  case ${host} in
    cursor) version_command='cursor agent --version' ;;
    claude) version_command='claude --version' ;;
    *) version_command='codex --version' ;;
  esac
  grep -Fq "${version_command}" "${run_log}"
  if [[ ${host} == 'cursor' ]]; then
    if grep -Exq 'cursor --version' "${run_log}"; then
      echo 'FAIL: Cursor runtime used editor cursor --version.' >&2
      cat "${run_log}" >&2
      return 1
    fi
    grep -Fq 'native-version: cursor-agent recorded-1' "${attempt}/record"
  fi
  assert_attempt "${attempt}" "${host}" "${case_id}" "${version_command}"
  assert_unreviewed "${host}" "${case_id}" "${attempt}"
  printf '%s\n' "${attempt}"
}

: > "${run_log}"
set +e
env TMPDIR="${watched_dir}" PATH="${PATH}" \
  NATIVE_AGENT_SENTINEL_LOG="${run_log}" \
  bash "${context_wrapper}" --native cursor clear \
  --results-dir "${unwritable_dir}" > "${stdout_file}" 2> "${stderr_file}"
unwritable_status=$?
set -e
if [[ ${unwritable_status} -eq 0 ]]; then
  echo 'FAIL: unwritable --results-dir launched a native check.' >&2
  cat "${stdout_file}" >&2
  exit 1
fi
grep -Fq 'error: --results-dir is not a writable directory' "${stderr_file}"
if [[ -s ${run_log} ]]; then
  echo 'FAIL: unwritable destination invoked a native command.' >&2
  cat "${run_log}" >&2
  exit 1
fi
assert_watched_empty
if [[ -n $(find "${unwritable_dir}" -mindepth 1 -print) ]]; then
  echo 'FAIL: unwritable destination grew an attempt directory.' >&2
  exit 1
fi

cursor_clear=$(run_selected cursor context/clear \
  --native cursor clear --results-dir "${results_dir}" \
  --deadline 3600 --grace 15)
codex_clear=$(run_selected codex context/clear \
  --native codex clear --results-dir "${results_dir}")
claude_clear=$(run_selected claude context/clear \
  --native claude clear --results-dir "${results_dir}")
cursor_conflict=$(run_selected cursor context/conflict \
  --native cursor --case context/conflict --results-dir "${results_dir}")
codex_conflict=$(run_selected codex context/conflict \
  --native codex --case context/conflict --results-dir "${results_dir}")
claude_conflict=$(run_selected claude context/conflict \
  --native claude --case context/conflict --results-dir "${results_dir}")

cursor_clear_again=$(run_selected cursor context/clear \
  --native cursor clear --results-dir "${results_dir}")
if [[ ${cursor_clear} == "${cursor_clear_again}" ]]; then
  echo 'FAIL: second attempt reused the first result path.' >&2
  exit 1
fi
assert_unreviewed cursor context/clear "${cursor_clear}"
assert_unreviewed cursor context/clear "${cursor_clear_again}"
[[ -d ${codex_clear} && -d ${claude_clear} ]]
[[ -d ${cursor_conflict} && -d ${codex_conflict} && -d ${claude_conflict} ]]

echo 'PASS: selected context attempts stay readable after scratch cleanup, listing reports them unreviewed, a second attempt is distinct, and an unwritable destination launches nothing.'
