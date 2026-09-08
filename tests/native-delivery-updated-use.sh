#!/usr/bin/env bash
# Credential-free proof that Codex delivery/updated-use keeps ordinary no-URL
# update then use as one retained journey: real fixture apply, no refusal, no retry.
# shellcheck disable=SC2016,SC2034,SC2312 # Literal invocation marker; sourced asserts use work paths.
set -euo pipefail

source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)
codex_wrapper="${source_dir}/tests/dough-adr-awareness-codex-delivery-to-use.sh"
journey_fixture="${source_dir}/tests/support/native-agent-journey.sh"
fail_fixture="${source_dir}/tests/support/native-agent-fail.sh"

work_dir=$(mktemp -d)
finish() {
  chmod -R u+w "${work_dir}" 2> /dev/null || true
  rm -rf -- "${work_dir}"
}
trap finish EXIT

sentinel_bin="${work_dir}/bin"
fail_bin="${work_dir}/fail-bin"
watched_dir="${work_dir}/watched"
results_dir="${work_dir}/results"
run_log="${work_dir}/run.log"
stdout_file="${work_dir}/stdout.txt"
stderr_file="${work_dir}/stderr.txt"
mkdir -p -- "${sentinel_bin}" "${fail_bin}" "${watched_dir}" "${results_dir}"
cp -- "${journey_fixture}" "${sentinel_bin}/codex"
cp -- "${fail_fixture}" "${fail_bin}/codex"
chmod a+x "${sentinel_bin}/codex" "${fail_bin}/codex"

# shellcheck source=tests/support/native-updated-use-codex-assert.sh
# shellcheck disable=SC1091
source "${source_dir}/tests/support/native-updated-use-codex-assert.sh"

# Success: real installer apply, then recorded use, one attempt.
export PATH="${sentinel_bin}:${PATH}"
success=$(run_selected 0)
assert_single_attempt "${success}"
assert_record_identity "${success}"
assert_no_legacy_or_retry "${run_log}" 2
grep -Fq 'execution-status: completed' "${success}/record"
grep -Fq 'prerequisite-result: pass' "${success}/record"
grep -Fq 'native-version: codex journey-1' "${success}/record"
[[ -f ${success}/update-events.jsonl ]]
[[ -f ${success}/update-response.md ]]
[[ -f ${success}/update-stderr.log ]]
[[ -f ${success}/use-events.jsonl ]]
[[ -f ${success}/use-response.md ]]
[[ -f ${success}/use-stderr.log ]]
[[ -f ${success}/update-before-snapshot.txt ]]
[[ -f ${success}/update-after-snapshot.txt ]]
[[ -f ${success}/use-before-snapshot.txt ]]
[[ -f ${success}/source-before-snapshot.txt ]]
[[ -f ${success}/source-after-snapshot.txt ]]
[[ -f ${success}/observations.txt ]]
grep -Fq 'update-execution: completed' "${success}/observations.txt"
grep -Fq 'use-execution: completed' "${success}/observations.txt"
grep -Fq 'same-target: true' "${success}/observations.txt"
grep -Fq 'source-preserved: true' "${success}/observations.txt"
grep -Fq 'companion-preserved: true' "${success}/observations.txt"
grep -Fq 'real-transition: true' "${success}/observations.txt"
grep -Fq 'update-version-before: 0.2.1' "${success}/observations.txt"
grep -Fq 'update-version-after: 0.2.2' "${success}/observations.txt"
grep -Fq 'improvement-after-update: true' "${success}/observations.txt"
grep -Fq 'other-tool-root-cursor-preserved: true' "${success}/observations.txt"
grep -Fq 'other-tool-root-claude-preserved: true' "${success}/observations.txt"
if grep -Fq 'use-pending: true' "${success}/observations.txt"; then
  echo 'FAIL: successful journey marked use as pending.' >&2
  cat "${success}/observations.txt" >&2
  exit 1
fi
if cmp -s "${success}/update-before-snapshot.txt" \
  "${success}/update-after-snapshot.txt"; then
  echo 'FAIL: success path inferred an update without a real target transition.' >&2
  exit 1
fi
if ! cmp -s "${success}/use-before-snapshot.txt" \
  "${success}/update-after-snapshot.txt"; then
  echo 'FAIL: use did not start from the verified updated target.' >&2
  exit 1
fi
if ! cmp -s "${success}/source-before-snapshot.txt" \
  "${success}/source-after-snapshot.txt"; then
  echo 'FAIL: fixture source changed during the journey.' >&2
  exit 1
fi
grep -Fq 'Outcome: updated from 0.2.1 to 0.2.2.' "${success}/update-response.md"
grep -Fq 'assessment-status: pass' "${success}/record"
grep -Fq 'named conflicting authorities and stopped' "${success}/record"
if grep -Fq '"type":"item.completed"' "${success}/update-events.jsonl" \
  && grep -Fq '"type":"turn.completed"' "${success}/update-events.jsonl"; then
  :
else
  echo 'FAIL: update stream omitted Codex completed activity or terminal turn completion.' >&2
  cat "${success}/update-events.jsonl" >&2
  exit 1
fi
: > "${work_dir}/list.log"
listing=$(
  env TMPDIR="${watched_dir}" PATH="${PATH}" \
    NATIVE_AGENT_SENTINEL_LOG="${work_dir}/list.log" \
    bash "${codex_wrapper}" --list --results-dir "${results_dir}"
)
if [[ -s ${work_dir}/list.log ]]; then
  echo 'FAIL: listing invoked a native command.' >&2
  cat "${work_dir}/list.log" >&2
  exit 1
fi
grep -Fq "prior-evidence: unreviewed ${success}" <<< "${listing}"

# Failed update: retain update evidence, do not start use, do not retry.
fail_update=$(
  PATH="${fail_bin}:${PATH}" NATIVE_AGENT_FAIL_CODE=1 \
    run_selected 1
)
assert_single_attempt "${fail_update}"
assert_record_identity "${fail_update}"
assert_no_legacy_or_retry "${run_log}" 1
[[ ${fail_update} != "${success}" ]]
grep -Fq 'execution-status: failed' "${fail_update}/record"
grep -Fq 'prerequisite-result: fail' "${fail_update}/record"
grep -Fq 'update-execution: failed' "${fail_update}/observations.txt"
grep -Fq 'use-execution: unrun' "${fail_update}/observations.txt"
grep -Fq 'use-pending: true' "${fail_update}/observations.txt"
grep -Fq 'real-transition: false' "${fail_update}/observations.txt"
grep -Fq 'assessment-status: not-run' "${fail_update}/record"
[[ -f ${fail_update}/update-stderr.log ]]
[[ ! -e ${fail_update}/use-events.jsonl ]]
[[ ! -e ${fail_update}/use-response.md ]]
[[ ! -e ${fail_update}/use-before-snapshot.txt ]]
if grep -Fq 'dough-adr-awareness' "${run_log}"; then
  echo 'FAIL: failed update started a use session.' >&2
  cat "${run_log}" >&2
  exit 1
fi

# Failed use: retain the successful update and the use failure, no retry.
fail_use=$(
  PATH="${sentinel_bin}:${PATH}" NATIVE_AGENT_FAIL_STAGE=use \
    run_selected 1
)
assert_single_attempt "${fail_use}"
assert_record_identity "${fail_use}"
assert_no_legacy_or_retry "${run_log}" 2
[[ ${fail_use} != "${success}" && ${fail_use} != "${fail_update}" ]]
grep -Fq 'execution-status: failed' "${fail_use}/record"
grep -Fq 'prerequisite-result: fail' "${fail_use}/record"
grep -Fq 'update-execution: completed' "${fail_use}/observations.txt"
grep -Fq 'use-execution: failed' "${fail_use}/observations.txt"
grep -Fq 'real-transition: true' "${fail_use}/observations.txt"
grep -Fq 'update-version-after: 0.2.2' "${fail_use}/observations.txt"
[[ -f ${fail_use}/update-response.md ]]
[[ -f ${fail_use}/use-stderr.log ]]
grep -Fq 'Outcome: updated from 0.2.1 to 0.2.2.' "${fail_use}/update-response.md"
if cmp -s "${fail_use}/update-before-snapshot.txt" \
  "${fail_use}/update-after-snapshot.txt"; then
  echo 'FAIL: failed-use path lost the successful update transition.' >&2
  exit 1
fi
if grep -Fq 'use-pending: true' "${fail_use}/observations.txt"; then
  echo 'FAIL: failed use was recorded as unrun/pending.' >&2
  cat "${fail_use}/observations.txt" >&2
  exit 1
fi

echo 'PASS: Codex delivery/updated-use retains a combined real-update then use journey, keeps failures without retry, and does not launch a separate ordinary-update or refusal case.'
