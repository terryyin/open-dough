#!/usr/bin/env bash
# PATH substitute `codex` for credential-free runs of the paused-supplier
# comparison case (tests/native-comparison/paused-supplier). Answers
# `--version`, `exec ... -C DIR -o FILE PROMPT` and `exec resume ... -o FILE
# THREAD PROMPT` with a complete Codex JSON stream for one thread. Each turn
# fetches the execution checkout's remote and applies rule
# NATIVE_AGENT_PAUSED_SUPPLIER_RULE: `completion` continues slice 3 once the
# supplier's completion record is on origin/main; `publication` continues as
# soon as origin/main has the supplier's reader (a premature resume);
# `duplicate` continues like `completion` and then commits the verdict stage,
# removes it and adds it again (slice 3 filed twice). Until then it holds. It
# proves the runner, observer, assessor and retention around a known
# decision; it never stands in for native behavior.
# shellcheck disable=SC2016 # jq programs name their own arguments.
set -euo pipefail

if [[ ${1-} == --version ]]; then
  printf 'codex-cli paused-supplier-substitute\n'
  exit 0
fi
rule=${NATIVE_AGENT_PAUSED_SUPPLIER_RULE:-completion}
workspace=${PWD} output='' thread='' prompt=''
[[ ${1-} == exec ]] && shift
if [[ ${1-} == resume ]]; then
  shift
fi
positional=()
while (($#)); do
  case $1 in
    -C) workspace=$2 && shift 2 ;;
    -o) output=$2 && shift 2 ;;
    -c | -m | --sandbox) shift 2 ;;
    -*) shift ;;
    *) positional+=("$1") && shift ;;
  esac
done
if ((${#positional[@]} == 2)); then
  thread=${positional[0]}
  prompt=${positional[1]}
else
  thread=00000000-0000-4000-8000-$(printf '%012x' "$$")
  prompt=${positional[0]-}
fi
[[ -n ${prompt} ]] || exit 2

event() { jq -n -c "$@"; }
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

event --arg t "${thread}" '{type:"thread.started",thread_id:$t}'
event '{type:"turn.started"}'
call fetch 'git fetch -q origin'
ready=false
case ${rule} in
  completion | duplicate)
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
  call integrate "${git_as} merge -q --no-edit origin/main"
  sed -e 's|^import { readFakeGh } from "../src/fake-gh.mjs";$|import { eligible, runs } from "./support/repeat-fixture.mjs";|' \
    -e '/^const runs = /d' -e '/^const eligible = /d' \
    -e '1i\
// Checks that start from a finished run'"'"'s verdict.' \
    "${workspace}/tests/repeat-checks.test.mjs" \
    > "${workspace}/tests/repeat-verdict-stage.test.mjs"
  rm -- "${workspace}/tests/repeat-checks.test.mjs"
  call proof 'node --test tests/*.test.mjs'
  if [[ ${rule} == duplicate ]]; then
    call refile "git add -A tests && ${git_as} commit -q -m 'File slice 3' \
&& git rm -q tests/repeat-verdict-stage.test.mjs && ${git_as} commit -q -m 'Unfile' \
&& ${git_as} revert --no-edit HEAD > /dev/null && ${git_as} commit -q --amend -m 'File slice 3 again'"
  fi
  message='Slice 3 is filed by stage on the completed supplier reader; its proof passes.'
else
  # Reads the project's proof command without running it.
  call status 'cat AGENTS.md'
  message='Slice 3 is held: the supplier requirement is not satisfied yet.'
fi
event --arg m "${message}" '{type:"item.completed",item:{id:"message",type:"agent_message",text:$m}}'
event '{type:"turn.completed",usage:{input_tokens:1,cached_input_tokens:0,output_tokens:1}}'
[[ -z ${output} ]] || printf '%s\n' "${message}" > "${output}"
