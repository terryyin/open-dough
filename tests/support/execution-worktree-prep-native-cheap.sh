#!/usr/bin/env bash
# Cheap credential-free contracts for tests/execution-worktree-preparation-native.sh.
# shellcheck disable=SC1091,SC2034,SC2154,SC2310,SC2312

prep_native_observation_dir="${prep_native_support_dir}/execution-worktree-prep-native-observations"
# shellcheck source=tests/support/native-assessor-counterexample.sh
source "${prep_native_support_dir}/native-assessor-counterexample.sh"

assert_observation_passes() {
  local file=$1
  local snippet=$2
  local status reason output
  output=$(node "${prep_native_assess_js}" --observation "${file}") || true
  status=$(jq -r '.status' <<< "${output}")
  reason=$(jq -r '.reason' <<< "${output}")
  if [[ ${status} != pass ]]; then
    echo "FAIL: $(basename -- "${file}") expected pass, got ${status}." >&2
    printf 'reason: %s\n' "${reason}" >&2
    printf '%s\n' "${output}" >&2
    return 1
  fi
  grep -Fq "${snippet}" <<< "${reason}"
}

# Assesses flattened observation $1 into prep_native_flat_status and
# prep_native_flat_reason.
assess_flat_observation() {
  local output
  output=$(node "${prep_native_assess_js}" --flat-observation "$1") || true
  {
    read -r prep_native_flat_status
    read -r prep_native_flat_reason
  } < <(jq -r '.status, .reason' <<< "${output}")
}

run_cheap_assessor_contracts() {
  local work=$1
  local passing="${work}/fresh-pass.flat"
  local setup='{"role":"setup","command":"npm ci","cwd":"/tmp/exec","code":0,"stdout":"","stderr":""}'
  local command='{"role":"command","command":"npm run prove","cwd":"/tmp/exec","code":0,"stdout":"fixture-cli-ok\n","stderr":""}'
  local delegate='{"role":"delegate","command":"write greeting.txt","cwd":"/tmp/exec","code":0,"stdout":"","stderr":""}'
  assert_observation_passes "${prep_native_observation_dir}/fresh-pass.json" \
    'setup then project command'
  assert_observation_passes "${prep_native_observation_dir}/failed-pass.json" \
    'failed preparation stopped recoverably'
  assert_observation_passes "${prep_native_observation_dir}/reuse-pass.json" \
    'reused host-established preparation'
  assert_observation_passes "${prep_native_observation_dir}/wrapper-pass.json" \
    'setup then project command'
  assert_observation_passes \
    "${prep_native_observation_dir}/traces-without-stream-commands.json" \
    'setup then project command'

  node "${prep_native_support_dir}/execution-worktree-prep-native-flat.mjs" \
    "${prep_native_observation_dir}/fresh-pass.json" > "${passing}"
  native_assessor_counterexamples "${prep_native_assess_js}" "${passing}" \
    --verdict prep_native_flat_status prep_native_flat_reason \
    -- assess_flat_observation
  native_assessor_rejects_fields truncated-stream stream-status \
    'streamStatus: "truncated"' -- pending 'truncated terminal stream'
  native_assessor_rejects_fields delegate-before-setup command-order \
    'commands: ["write greeting.txt hello-ok","npm ci","npm run prove"]' \
    "invocations: [${delegate},${setup},${command}]" \
    -- fail 'implementation delegated before the project command'
  # The greeting is written, but no setup or project command ran.
  native_assessor_rejects_fields setup-skipped preparation-gate \
    'commands: ["write greeting.txt hello-ok"]' 'traces: []' \
    "invocations: [${delegate}]" 'executionOwnsInstall: false' \
    -- fail 'missing setup or project-command trace'
  native_assessor_rejects_fields greeting-missing outcome 'greeting: null' \
    -- fail 'missing completed outcome in the selected execution checkout'
}

run_cheap_flag_contracts() {
  local work=$1
  local wrapper=$2
  local sentinel_bin="${work}/bin"
  local sentinel_log="${work}/sentinel.log"
  local watched="${work}/watched"
  local stdout_file="${work}/stdout.txt"
  local stderr_file="${work}/stderr.txt"
  local listing status leftover
  mkdir -p -- "${sentinel_bin}" "${watched}"
  : > "${sentinel_log}"
  cp -- "${source_dir}/tests/support/native-agent-sentinel.sh" "${sentinel_bin}/codex"
  cp -- "${source_dir}/tests/support/native-agent-sentinel.sh" "${sentinel_bin}/cursor"
  cp -- "${source_dir}/tests/support/native-agent-sentinel.sh" "${sentinel_bin}/claude"
  chmod a+x "${sentinel_bin}/codex" "${sentinel_bin}/cursor" "${sentinel_bin}/claude"

  listing=$(
    env TMPDIR="${watched}" PATH="${sentinel_bin}:${PATH}" \
      NATIVE_AGENT_SENTINEL_LOG="${sentinel_log}" \
      bash "${wrapper}" --list
  )
  grep -Fq 'usage:' <<< "${listing}"
  grep -Fq 'host: codex' <<< "${listing}"
  grep -Fq 'host: cursor' <<< "${listing}"
  grep -Fq 'host: claude' <<< "${listing}"
  grep -Fq 'case: fresh-node' <<< "${listing}"
  grep -Fq 'case: failed-prep' <<< "${listing}"
  grep -Fq 'case: reuse' <<< "${listing}"
  grep -Fq 'case: wrapper' <<< "${listing}"
  if [[ -s ${sentinel_log} ]]; then
    echo 'FAIL: --list launched a native executable.' >&2
    cat "${sentinel_log}" >&2
    return 1
  fi
  leftover=$(find "${watched}" -mindepth 1 \
    \( -name xcrun_db -o -name node-compile-cache \) -prune -o -print)
  if [[ -n ${leftover} ]]; then
    echo 'FAIL: --list wrote under TMPDIR.' >&2
    printf '%s\n' "${leftover}" >&2
    return 1
  fi

  for args in '--native' '--native java' '--case fresh-node' '--bogus' \
    '--deadline 30' '--native cursor --case unknown'; do
    : > "${stdout_file}"
    : > "${stderr_file}"
    set +e
    # shellcheck disable=SC2086 # intentional word-splitting of test args
    env TMPDIR="${watched}" PATH="${sentinel_bin}:${PATH}" \
      NATIVE_AGENT_SENTINEL_LOG="${sentinel_log}" \
      bash "${wrapper}" ${args} > "${stdout_file}" 2> "${stderr_file}"
    status=$?
    set -e
    if [[ ${status} -eq 0 ]]; then
      echo "FAIL: expected usage error for: ${args}" >&2
      cat "${stdout_file}" >&2
      cat "${stderr_file}" >&2
      return 1
    fi
    grep -Fq 'error:' "${stderr_file}"
    grep -Fq 'usage:' "${stderr_file}"
    if [[ -s ${sentinel_log} ]]; then
      echo 'FAIL: invalid selection launched a native executable.' >&2
      cat "${sentinel_log}" >&2
      return 1
    fi
  done
}

run_cheap_isolation() {
  local work=$1
  local wrapper=$2
  local sentinel_bin="${work}/iso-bin"
  local watched="${work}/iso-watched"
  local results_dir="${work}/iso-results"
  local run_log="${work}/iso-run.log"
  local stdout_file="${work}/iso-stdout.txt"
  local stderr_file="${work}/iso-stderr.txt"
  local status leftover attempt
  mkdir -p -- "${sentinel_bin}" "${watched}" "${results_dir}"
  cat > "${sentinel_bin}/cursor" << 'EOF'
#!/usr/bin/env bash
set -euo pipefail
if [[ -z ${NATIVE_AGENT_SENTINEL_LOG:-} ]]; then
  printf 'error: NATIVE_AGENT_SENTINEL_LOG must name a writable log file.\n' >&2
  exit 1
fi
{
  printf '%s' "${0##*/}"
  if [[ $# -gt 0 ]]; then
    printf ' %s' "$@"
  fi
  printf '\n'
} >> "${NATIVE_AGENT_SENTINEL_LOG}"
if [[ ${1:-} == 'agent' && ${2:-} == '--version' ]]; then
  printf 'cursor-agent recorded-1\n'
  exit 0
fi
if [[ ${1:-} == 'agent' ]]; then
  shift
fi
workspace=
args=("$@")
idx=0
while [[ ${idx} -lt ${#args[@]} ]]; do
  case ${args[idx]} in
    --workspace)
      idx=$((idx + 1))
      workspace=${args[idx]}
      ;;
  esac
  idx=$((idx + 1))
done
if [[ -z ${workspace} ]]; then
  workspace=${PWD}
fi
jq -n -c --arg result 'Recorded substitute completed without preparing a worktree.' \
  '{type:"result",result:$result}'
rm -rf -- "$(dirname -- "${workspace}")"
EOF
  chmod a+x "${sentinel_bin}/cursor"
  cp -- "${sentinel_bin}/cursor" "${sentinel_bin}/codex"
  cp -- "${sentinel_bin}/cursor" "${sentinel_bin}/claude"

  : > "${run_log}"
  set +e
  env TMPDIR="${watched}" PATH="${sentinel_bin}:${PATH}" \
    NATIVE_AGENT_SENTINEL_LOG="${run_log}" \
    bash "${wrapper}" --native cursor --case fresh-node \
    --results-dir "${results_dir}" --deadline 3600 --grace 15 \
    > "${stdout_file}" 2> "${stderr_file}"
  status=$?
  set -e
  leftover=$(find "${watched}" -mindepth 1 \
    \( -name xcrun_db -o -name node-compile-cache \) -prune -o -print)
  if [[ -n ${leftover} ]]; then
    echo 'FAIL: native scratch remained after isolation run.' >&2
    printf '%s\n' "${leftover}" >&2
    cat "${stdout_file}" >&2
    cat "${stderr_file}" >&2
    return 1
  fi
  attempt=$(awk '/^result-path: / { sub(/^result-path: /, ""); path=$0 } END { if (path=="") exit 1; print path }' \
    "${stdout_file}")
  [[ -f ${attempt}/record ]]
  [[ -f ${attempt}/events.jsonl ]]
  grep -Fq 'cursor agent --version' "${run_log}"
  if grep -Fq 'assessment-status: pass' "${attempt}/record"; then
    echo 'FAIL: recorded substitute without filesystem evidence was a wording pass.' >&2
    cat "${attempt}/record" >&2
    return 1
  fi
  # Isolation owns retained artifacts, not a green native verdict.
  [[ ${status} -ne 0 ]]
}
