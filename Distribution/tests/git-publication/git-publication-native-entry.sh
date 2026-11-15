#!/usr/bin/env bash
# The public native entry must run without a test bootstrap in its child shell,
# retain the selected result and release scratch when evidence has its own home.
# shellcheck disable=SC1091,SC2154 # Reuse the suite's controlled host boundary.
set -euo pipefail
source_dir=$(dirname -- "${BASH_SOURCE[0]}")
source_dir=$(cd -- "${source_dir}/../../.." && pwd)
source "${source_dir}/Distribution/tests/support/git-publication-native-substitute-suite.sh"
prepare_substitute_hosts
trap 'rm -rf -- "${substitute_work}"' EXIT
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
[[ -d ${attempt} && ${attempt} == "${results}/codex/publication/publish-boundary/"* ]]
grep -Fxq 'host: codex' "${attempt}/record"
grep -Fxq 'case: publication/publish-boundary' "${attempt}/record"
grep -Fxq 'execution-status: completed' "${attempt}/record"
grep -Fxq 'assessment-status: pass' "${attempt}/record"
grep -Eq '^input-hash: [0-9a-f]{64} Distribution/evaluation/cases/git-publication/git-publication-native.sh$' "${attempt}/record"
for artifact in events.jsonl response.md stderr.log observations.txt; do
  [[ -f ${attempt}/${artifact} ]]
done
[[ -s ${substitute_run_log} ]]
remaining=$(find "${scratch}" -mindepth 1 ! -name xcrun_db -print)
[[ -z ${remaining} ]]
