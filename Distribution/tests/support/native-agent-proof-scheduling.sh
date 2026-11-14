#!/usr/bin/env bash
# PATH substitute for credential-free delivery-evidence/scheduling runs.
# Installed as codex, cursor or claude; logs every invocation to
# NATIVE_AGENT_SENTINEL_LOG, then replays controlled sequence
# NATIVE_AGENT_SCHEDULING_SEQUENCE (delivery-evidence-scheduling-native-
# checks.sh) through the fixture's product commands in the workspace it is
# launched in, and emits a complete Claude Code or Cursor stream-json result.
# It never decides a schedule; it proves the runner, observer, assessor and
# retention path around a known sequence.
set -euo pipefail

if [[ -z ${NATIVE_AGENT_SENTINEL_LOG:-} || -z ${NATIVE_AGENT_SCHEDULING_SUPPORT:-} ]]; then
  printf 'error: NATIVE_AGENT_SENTINEL_LOG and NATIVE_AGENT_SCHEDULING_SUPPORT are required.\n' >&2
  exit 1
fi
printf '%s %s\n' "${0##*/}" "$*" >> "${NATIVE_AGENT_SENTINEL_LOG}"
if [[ ${1-} == --version || ${2-} == --version ]]; then
  printf '%s scheduling-substitute\n' "${0##*/}"
  exit 0
fi

delivery_evidence_support_dir=${NATIVE_AGENT_SCHEDULING_SUPPORT}
# shellcheck disable=SC1091
source "${delivery_evidence_support_dir}/delivery-evidence-scheduling-native-scenario-content.sh"
# shellcheck disable=SC1091
source "${delivery_evidence_support_dir}/delivery-evidence-scheduling-native-checks.sh"
delivery_evidence_scheduling_play "${PWD}" \
  "${NATIVE_AGENT_SCHEDULING_SEQUENCE:-corrected}" > /dev/null 2>&1
jq -n -c '{type:"assistant",message:{content:[{type:"tool_use",id:"suite",name:"Bash",input:{command:"bin/suite.sh"}}]}}'
jq -n -c '{type:"result",result:"Replayed the controlled proof sequence."}'
