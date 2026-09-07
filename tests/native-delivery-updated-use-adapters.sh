#!/usr/bin/env bash
# Credential-free proof that Cursor and Claude Code selected delivery/updated-use
# use the shared journey through each host's command/event adapter. One successful
# recorded journey per adapter covers routing, identity, stream decoding, and
# retained artifacts. Truncated stream-json is the adapter decoding difference.
# Shared transition and product-failure proofs stay in native-delivery-updated-use.sh.
# shellcheck disable=SC1091,SC2034,SC2312 # Sourced asserts use work paths; pipefail covers logs.
set -euo pipefail

source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)
journey_fixture="${source_dir}/tests/support/native-agent-journey.sh"

work_dir=$(mktemp -d)
finish() {
  chmod -R u+w "${work_dir}" 2> /dev/null || true
  rm -rf -- "${work_dir}"
}
trap finish EXIT

sentinel_bin="${work_dir}/bin"
watched_dir="${work_dir}/watched"
results_dir="${work_dir}/results"
run_log="${work_dir}/run.log"
stdout_file="${work_dir}/stdout.txt"
stderr_file="${work_dir}/stderr.txt"
mkdir -p -- "${sentinel_bin}" "${watched_dir}" "${results_dir}"
cp -- "${journey_fixture}" "${sentinel_bin}/cursor"
cp -- "${journey_fixture}" "${sentinel_bin}/claude"
chmod a+x "${sentinel_bin}/cursor" "${sentinel_bin}/claude"
export PATH="${sentinel_bin}:${PATH}"

# shellcheck source=tests/support/native-updated-use-adapter-assert.sh
# shellcheck disable=SC1091
source "${source_dir}/tests/support/native-updated-use-adapter-assert.sh"

for host in cursor claude; do
  success=$(run_selected "${host}" 0)
  assert_adapter_success "${host}" "${success}"

  truncated=$(
    NATIVE_AGENT_STREAM=truncated run_selected "${host}" 1
  )
  assert_adapter_truncated "${host}" "${truncated}" "${success}"
done

echo 'PASS: Cursor and Claude Code delivery/updated-use launch the shared journey through each adapter, retain decoded stream-json artifacts, and keep truncated streams incomplete.'
