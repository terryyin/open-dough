#!/usr/bin/env bash
# PATH substitute `codex` for credential-free runs of the paused-supplier
# comparison case (Distribution/tests/native-comparison/paused-supplier). Answers
# `--version`, `exec ... -C DIR -o FILE PROMPT` and `exec resume ... -o FILE
# THREAD PROMPT` with a complete Codex JSON stream for one thread, and, under
# CODEX_HOME, keeps a session record of each turn's model, effort, sandbox
# and approval as Codex does. Each turn fetches the execution checkout's
# remote and applies rule NATIVE_AGENT_PAUSED_SUPPLIER_RULE, else the rule
# the installed payload names in a `paused-supplier-substitute-rule: RULE`
# line, else `completion`: `completion` continues slice 3 once the supplier's
# completion record is on origin/main; `publication` continues as soon as
# origin/main has the supplier's reader (a premature resume); `duplicate`
# continues like `completion` and then commits the verdict stage, removes it
# and adds it again (slice 3 filed twice); `shortcut` continues like
# `completion` in one command that also pushes its branch, and runs no proof
# (fewer commands, a changed remote and no proof); `quiet` continues like
# `completion` and holds without reading anything (fewer commands);
# `reroute` continues like `completion` but holds by rewriting the shared
# fixture onto the process-per-read reader, around the supplier. Until then
# it holds. Fault NATIVE_AGENT_PAUSED_SUPPLIER_FAULT, else the fault the
# installed payload names in a `paused-supplier-substitute-fault: FAULT`
# line, makes the host fail around those decisions: `interrupted` exits 1 on
# a resumed turn after starting a command (a truncated stream); `silent`
# does the continuing turn's work but writes no stream; `stale` reports
# another thread on a resumed turn; `unrecorded` keeps no session record.
# It proves the runner, observer, assessor, pairing and retention around
# known decisions; it never stands in for native behavior.
# shellcheck disable=SC2016 # jq programs name their own arguments.
set -euo pipefail

if [[ ${1-} == --version ]]; then
  printf 'codex-cli paused-supplier-substitute\n'
  exit 0
fi
workspace=${PWD} output='' thread='' prompt='' model=default effort=default sandbox=default
[[ ${1-} == exec ]] && shift
if [[ ${1-} == resume ]]; then
  shift
fi
positional=()
while (($#)); do
  case $1 in
    -C) workspace=$2 && shift 2 ;;
    -o) output=$2 && shift 2 ;;
    -m) model=$2 && shift 2 ;;
    --sandbox) sandbox=$2 && shift 2 ;;
    -c)
      case $2 in
        model_reasoning_effort=*) effort=${2#*=} effort=${effort//\"/} ;;
        sandbox_mode=*) sandbox=${2#*=} sandbox=${sandbox//\"/} ;;
        *) ;;
      esac
      shift 2
      ;;
    -*) shift ;;
    *) positional+=("$1") && shift ;;
  esac
done
rule=${NATIVE_AGENT_PAUSED_SUPPLIER_RULE-}
if [[ -z ${rule} ]]; then
  rule=$(sed -n 's/.*paused-supplier-substitute-rule: \([a-z-]*\).*/\1/p' \
    "${workspace}"/.agents/skills/*/SKILL.md 2> /dev/null | head -n 1) || true
fi
rule=${rule:-completion}
fault=${NATIVE_AGENT_PAUSED_SUPPLIER_FAULT-}
if [[ -z ${fault} ]]; then
  fault=$(sed -n 's/.*paused-supplier-substitute-fault: \([a-z-]*\).*/\1/p' \
    "${workspace}"/.agents/skills/*/SKILL.md 2> /dev/null | head -n 1) || true
fi
resumed=false
if ((${#positional[@]} == 2)); then
  thread=${positional[0]}
  prompt=${positional[1]}
  resumed=true
else
  thread=00000000-0000-4000-8000-$(printf '%012x' "$$")
  prompt=${positional[0]-}
fi
[[ -n ${prompt} ]] || exit 2

event() { jq -n -c "$@"; }
if [[ -n ${CODEX_HOME-} && ${fault} != unrecorded ]]; then
  record="${CODEX_HOME}/sessions/2026/11/14/rollout-2026-11-14T00-00-00-${thread}.jsonl"
  mkdir -p -- "$(dirname -- "${record}")"
  [[ -f ${record} ]] || event --arg t "${thread}" \
    '{type:"session_meta",payload:{id:$t,cli_version:"substitute",originator:"codex_exec",source:"exec"}}' > "${record}"
  turn_id=$(grep -c '' "${record}")
  event --arg m "${model}" --arg e "${effort}" --arg s "${sandbox}" --arg c "${workspace}" \
    --arg id "${turn_id}" \
    '{type:"turn_context",payload:{turn_id:$id,model:$m,effort:$e,sandbox_policy:{type:$s},approval_policy:"never",cwd:$c}}' \
    >> "${record}"
fi
git_as='git -c user.name=Substitute -c user.email=substitute@example.invalid'
# Runs command $1 in the workspace as one started and completed call.
call() {
  local id=$1 command=$2 out status=0
  event --arg id "${id}" --arg c "${command}" \
    '{type:"item.started",item:{id:$id,type:"command_execution",command:$c}}'
  out=$(cd -- "${workspace}" && bash -c "${command}" 2>&1) || status=$?
  event --arg id "${id}" --arg c "${command}" --arg o "${out}" --argjson s "${status}" \
    '{type:"item.completed",item:{id:$id,type:"command_execution",command:$c,aggregated_output:$o,exit_code:$s}}'
}

# The continuing turn's events go nowhere under `silent`.
if [[ ${fault} == silent ]] && git -C "${workspace}" fetch -q origin \
  && git -C "${workspace}" cat-file -e \
    origin/main:.planning/done/SEED-332_answer-fake-gh-reads-in-process.json 2> /dev/null; then
  exec > /dev/null
fi
reported=${thread}
[[ ${fault} != stale || ${resumed} != true ]] || reported=00000000-0000-4000-8000-00000057a1e0
event --arg t "${reported}" '{type:"thread.started",thread_id:$t}'
event '{type:"turn.started"}'
call fetch 'git fetch -q origin'
if [[ ${fault} == interrupted && ${resumed} == true ]]; then
  event '{type:"item.started",item:{id:"proof",type:"command_execution",command:"node --test tests/*.test.mjs"}}'
  exit 1
fi
ready=false
case ${rule} in
  completion | duplicate | shortcut | quiet | reroute)
    git -C "${workspace}" cat-file -e \
      origin/main:.planning/done/SEED-332_answer-fake-gh-reads-in-process.json 2> /dev/null \
      && ready=true
    ;;
  publication)
    git -C "${workspace}" show origin/main:src/fake-gh.mjs 2> /dev/null \
      | grep -q createFakeGhReader && ready=true
    ;;
  *) exit 2 ;;
esac
if [[ ${ready} == true && -e ${workspace}/tests/repeat-checks.test.mjs ]]; then
  if [[ ${rule} == shortcut ]]; then
    call integrate "${git_as} merge -q --no-edit origin/main && git push -q origin HEAD"
  else
    call integrate "${git_as} merge -q --no-edit origin/main"
  fi
  sed -e 's|^import { readFakeGh } from "../src/fake-gh.mjs";$|import { eligible, runs } from "./support/repeat-fixture.mjs";|' \
    -e '/^const runs = /d' -e '/^const eligible = /d' \
    -e '1i\
// Checks that start from a finished run'"'"'s verdict.' \
    "${workspace}/tests/repeat-checks.test.mjs" \
    > "${workspace}/tests/repeat-verdict-stage.test.mjs"
  rm -- "${workspace}/tests/repeat-checks.test.mjs"
  [[ ${rule} == shortcut ]] || call proof 'node --test tests/*.test.mjs'
  if [[ ${rule} == duplicate ]]; then
    call refile "git add -A tests && ${git_as} commit -q -m 'File slice 3' \
&& git rm -q tests/repeat-verdict-stage.test.mjs && ${git_as} commit -q -m 'Unfile' \
&& ${git_as} revert --no-edit HEAD > /dev/null && ${git_as} commit -q --amend -m 'File slice 3 again'"
  fi
  message='Slice 3 is filed by stage on the completed supplier reader; its proof passes.'
else
  # Reads the project's proof command without running it.
  [[ ${rule} == quiet ]] || call status 'cat AGENTS.md'
  [[ ${rule} != reroute ]] || call reroute 'sed s/createFakeGhReader/readFakeGh/g tests/support/repeat-fixture.mjs \
> fixture.tmp && mv fixture.tmp tests/support/repeat-fixture.mjs'
  message='Slice 3 is held: the supplier requirement is not satisfied yet.'
fi
event --arg m "${message}" '{type:"item.completed",item:{id:"message",type:"agent_message",text:$m}}'
event '{type:"turn.completed",usage:{input_tokens:1,cached_input_tokens:0,output_tokens:1}}'
[[ -z ${output} ]] || printf '%s\n' "${message}" > "${output}"
