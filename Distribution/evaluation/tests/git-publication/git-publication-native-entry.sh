#!/usr/bin/env bash
# The public native entry must run without a test bootstrap in its child shell,
# retain the selected result and release scratch when evidence has its own home.
# shellcheck disable=SC1091,SC2154 # Reuse the suite's controlled host boundary.
set -euo pipefail
source_dir=$(dirname -- "${BASH_SOURCE[0]}")
source_dir=$(cd -- "${source_dir}/../../../.." && pwd)
source "${source_dir}/Distribution/evaluation/tests/git-publication/support/git-publication-native-substitute-suite.sh"
prepare_substitute_hosts
trap 'rm -rf -- "${substitute_work}"' EXIT
host_input=Distribution/evaluation/cases/git-publication/git-publication-native-host.sh
host_hash=$(shasum -a 256 "${source_dir}/${host_input}" | awk '{ print $1 }')

assert_retained_publication() {
  local retained_attempt=$1 artifact
  [[ -d ${retained_attempt} ]]
  grep -Fxq 'host: codex' "${retained_attempt}/record"
  grep -Fxq 'case: publication/publish-boundary' "${retained_attempt}/record"
  grep -Fxq "input-hash: ${host_hash} ${host_input}" "${retained_attempt}/record"
  for artifact in events.jsonl response.md stderr.log observations.txt; do
    [[ -f ${retained_attempt}/${artifact} ]]
  done
}

scratch="${substitute_work}/scratch"
results="${substitute_work}/results"
mkdir -p -- "${scratch}" "${results}"
output="${substitute_work}/entry.out"
if ! TMPDIR="${scratch}/" NATIVE_AGENT_SENTINEL_LOG="${substitute_run_log}" \
  bash "${source_dir}/Distribution/evaluation/cases/git-publication/git-publication-native.sh" \
  --native codex --case publication/publish-boundary --results-dir "${results}" \
  > "${output}" 2>&1; then
  cat -- "${output}" >&2
  exit 1
fi
attempt=$(sed -n 's/^result-path: //p' "${output}")
[[ ${attempt} == "${results}/codex/publication/publish-boundary/"* ]]
assert_retained_publication "${attempt}"
grep -Fxq 'execution-status: completed' "${attempt}/record"
grep -Fxq 'assessment-status: pass' "${attempt}/record"
grep -Eq '^input-hash: [0-9a-f]{64} Distribution/evaluation/cases/git-publication/git-publication-native.sh$' "${attempt}/record"
[[ -s ${substitute_run_log} ]]
remaining=$(find "${scratch}" -mindepth 1 ! -name xcrun_db -print)
if [[ -n ${remaining} ]]; then
  printf 'FAIL: public native entry left scratch paths:\n%s\n' "${remaining}" >&2
  exit 1
fi

# The observations identify the actual owned work root. Plain mktemp -d can
# ignore TMPDIR on macOS; Linux additionally keeps the strict scratch check.
# Each variant isolates its environment and releases intentionally kept data.
check_retention_variant() (
  variant=$1
  variant_home="${substitute_work}/${variant}"
  scratch="${variant_home}/scratch"
  results="${variant_home}/results"
  output="${variant_home}/entry.out"
  owned_work=
  trap 'if [[ -n ${owned_work} ]]; then rm -rf -- "${owned_work}"; fi' EXIT
  mkdir -p -- "${scratch}"
  unset GIT_PUBLICATION_KEEP NATIVE_AGENT_EXIT_AFTER_COMPLETE
  result_args=(--results-dir "${results}")
  case ${variant} in
    default) result_args=() ;;
    keep) export GIT_PUBLICATION_KEEP=1 ;;
    failure) export NATIVE_AGENT_EXIT_AFTER_COMPLETE=1 ;;
    *)
      printf 'FAIL: unknown retention variant %s\n' "${variant}" >&2
      exit 1
      ;;
  esac
  status=0
  TMPDIR="${scratch}/" NATIVE_AGENT_SENTINEL_LOG="${variant_home}/sentinel.log" \
    bash "${source_dir}/Distribution/evaluation/cases/git-publication/git-publication-native.sh" \
    --native codex --case publication/publish-boundary "${result_args[@]}" \
    > "${output}" 2>&1 || status=$?
  workspace=$(sed -n 's/^workspace: //p' "${output}")
  [[ ${workspace} == */publish-boundary.*/git-pub-native.*/owned ]]
  owned_work=${workspace%%/publish-boundary.*}
  attempt=$(sed -n 's/^result-path: //p' "${output}")
  assert_retained_publication "${attempt}"
  # Version probes alone do not prove execution of the controlled host body.
  grep -q '^codex exec ' "${variant_home}/sentinel.log"
  stream_status=$(native_host_stream codex "${attempt}/events.jsonl" status)
  [[ ${stream_status} == complete ]]
  grep -Fxq 'remote-accepted: true' "${attempt}/observations.txt"
  if [[ ${variant} == failure ]]; then
    [[ ${status} -ne 0 && ! -e ${owned_work} ]]
    grep -Fxq 'execution-status: failed' "${attempt}/record"
    grep -Fxq 'assessment-status: fail' "${attempt}/record"
    [[ ${attempt} == "${results}/codex/publication/publish-boundary/"* ]]
    remaining=$(find "${scratch}" -mindepth 1 ! -name xcrun_db -print)
    if [[ -n ${remaining} ]]; then
      printf 'FAIL: failed host left scratch:\n%s\n' "${remaining}" >&2
      exit 1
    fi
  else
    [[ ${status} -eq 0 && -d ${owned_work} ]]
    grep -Fxq 'execution-status: completed' "${attempt}/record"
    grep -Fxq 'assessment-status: pass' "${attempt}/record"
    if [[ ${variant} == default ]]; then
      results=$(sed -n 's/^Results directory: //p' "${output}")
      [[ ${results} == "${owned_work}/results" ]]
    fi
    [[ ${attempt} == "${results}/codex/publication/publish-boundary/"* ]]
    retained_events=$(find "${owned_work}" -path '*/publish-boundary.*/events.jsonl' -print)
    [[ -n ${retained_events} ]]
  fi
)

check_retention_variant default
check_retention_variant keep
check_retention_variant failure
