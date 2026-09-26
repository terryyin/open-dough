#!/usr/bin/env bash
# Admission journeys for the credential-free publication substitute. Sourced
# by native-agent-publication.sh (copied beside it) with ${host}, ${journey}
# and ${workspace} (the originating checkout) set. Runs the installed CLIs the
# guidance names, in the order it requires, so observations come from real
# repository state; emits each command and its output in the host's stream
# shape and sets ${response}.
# NATIVE_ADMISSION_EXECUTION, _BRANCH, _PUBLISHER and _IDENTITY carry the
# fixture's owned workspace, branch, publisher ID and admitted identity.
# NATIVE_ADMISSION_ORDER=probe-first runs the investigation before admission.
# NATIVE_ADMISSION_CORRECTION=new-story admits a newly drafted story instead of
# the retrospective's correction story.
# NATIVE_ADMISSION_CLOSURE=keep-seed closes without deleting the spent seed;
# =stale-force force-pushes the closure from the stale admission base.
# shellcheck disable=SC2034,SC2154 # host, journey, workspace and response are shared with the sourcing substitute.

admission_events=
admission_tool=0

admission_record() {
  local command=$1 output=$2 id
  admission_tool=$((admission_tool + 1))
  id="admission-${admission_tool}"
  if [[ ${host} == codex ]]; then
    admission_events+=$(jq -n -c --arg c "${command}" --arg id "${id}" \
      '{type:"item.started",item:{id:$id,type:"command_execution",command:$c}}')$'\n'
    admission_events+=$(jq -n -c --arg c "${command}" --arg o "${output}" \
      --arg id "${id}" \
      '{type:"item.completed",item:{id:$id,type:"command_execution",command:$c,aggregated_output:$o}}')$'\n'
  else
    admission_events+=$(jq -n -c --arg c "${command}" --arg id "${id}" \
      '{type:"assistant",message:{content:[{type:"tool_use",id:$id,input:{command:$c}}]}}')$'\n'
    admission_events+=$(jq -n -c --arg o "${output}" --arg id "${id}" \
      '{type:"user",message:{content:[{type:"tool_result",tool_use_id:$id,content:$o}]}}')$'\n'
  fi
}

# Runs one command in the originating checkout and records it.
admission_run() {
  admission_run_in "${workspace}" "$@"
}

# Runs one command in directory $1 and records it.
admission_run_in() {
  local output dir=$1
  shift
  output=$(cd -- "${dir}" && "$@" 2>&1) || true
  admission_record "$*" "${output}"
  admission_last=${output}
}

admission_installed() {
  if [[ -d ${workspace}/.claude/skills ]]; then
    printf '%s\n' "${workspace}/.claude/skills"
  else
    printf '%s\n' "${workspace}/.agents/skills"
  fi
}

admission_start() {
  local skills
  skills=$(admission_installed)
  admission_run node "${skills}/dough-execute-plan/scripts/execution-start.mjs" \
    start --integration "${workspace}" \
    --workspace "${NATIVE_ADMISSION_EXECUTION}" \
    --branch "${NATIVE_ADMISSION_BRANCH}" --identity "$1" \
    --publisher-id "${NATIVE_ADMISSION_PUBLISHER}" --mode trunk \
    --remote origin --target main --push-authorized --workspace-authorized \
    --host "${host}" "${@:2}"
}

admission_probe() {
  admission_run node "${NATIVE_ADMISSION_EXECUTION}/scripts/probe.js"
}

native_admission_substitute() {
  local skills identity=SEED-900#slow-start
  local link=seeds/SEED-900-slow-start.md#slow-start
  skills=$(admission_installed)
  case ${journey} in
    admission-investigation)
      if [[ ${NATIVE_ADMISSION_ORDER:-} == probe-first ]]; then
        # A counterexample: investigate in a checkout of trunk before admitting.
        git -C "${workspace}" worktree add -q -b "${NATIVE_ADMISSION_BRANCH}" \
          "${NATIVE_ADMISSION_EXECUTION}" origin/main
        admission_probe
        git -C "${workspace}" worktree remove --force \
          "${NATIVE_ADMISSION_EXECUTION}"
        git -C "${workspace}" branch -q -D "${NATIVE_ADMISSION_BRANCH}"
      fi
      cat > "${workspace}/.planning/seeds/SEED-900-slow-start.md" << 'EOF'
---
id: SEED-900
---

# Slow startup

<a id="slow-start"></a>

### Investigate slow startup

**Identity:** SEED-900#slow-start

**Goal:** Find why startup is slow; investigation only.
EOF
      admission_run node "${skills}/dough-product-backlog/scripts/product-backlog.mjs" \
        record-state --identity "${identity}" --link "${link}" \
        --refinement refined --approach unselected
      admission_start "${identity}" --admit --link "${link}" \
        --title 'Investigate slow startup'
      if [[ ${admission_last} == *'"ok":true'* &&
        ${NATIVE_ADMISSION_ORDER:-} != probe-first ]]; then
        admission_probe
      fi
      response="Admitted ${identity} to Taken before investigating. The probe reports that startup spends most of its time loading configuration. No product change was made."
      ;;
    admission-continuation)
      # shellcheck disable=SC2086 # Intentional split of the counterexample flags.
      admission_start "${NATIVE_ADMISSION_IDENTITY}" \
        ${NATIVE_ADMISSION_CONTINUE_FLAGS:-}
      if [[ ${admission_last} == *'"ok":true'* ]]; then
        printf 'implemented\n' > "${NATIVE_ADMISSION_EXECUTION}/feature.txt"
        admission_record "write feature.txt" ''
      fi
      response="Continued ${NATIVE_ADMISSION_IDENTITY} under its existing claim and implemented feature.txt."
      ;;
    admission-correction)
      if [[ ${NATIVE_ADMISSION_CORRECTION:-} == new-story ]]; then
        # A counterexample: draft another story instead of reusing the
        # retrospective's correction story.
        identity=SEED-901#order-notes link=seeds/SEED-901.md#order-notes
        printf -- '---\nid: SEED-901\n---\n\n# Notes\n\n<a id="order-notes"></a>\n\n### Order notes\n\n**Identity:** %s\n\n**Goal:** Order notes by tag.\n' \
          "${identity}" > "${workspace}/.planning/seeds/SEED-901.md"
        admission_run node "${skills}/dough-product-backlog/scripts/product-backlog.mjs" \
          record-state --identity "${identity}" --link "${link}" \
          --refinement refined --approach unselected
      else
        identity=${NATIVE_ADMISSION_IDENTITY} link=seeds/R.md#order-notes
        admission_run node "${skills}/dough-product-backlog/scripts/product-backlog.mjs" \
          read-state --link "${link}"
      fi
      admission_start "${identity}" --admit --link "${link}" \
        --title 'Order release notes by tag date'
      response="Admitted the retrospective's correction story ${identity} to Taken with its plan. No product change was made."
      ;;
    admission-closure)
      admission_close "${skills}"
      response="Closed ${NATIVE_ADMISSION_IDENTITY}: the investigation concluded no product change is needed; its Taken entry, agent profile and spent seed were removed on remote trunk."
      ;;
    *) return 1 ;;
  esac
}

# Ordinary Trunk Mode wrap-up of the concluded investigation from its owned
# workspace: nothing to commit before cleanup (the admission is published),
# then delete the spent seed, complete the entry and publish final closure.
admission_close() {
  local skills=$1 execution=${NATIVE_ADMISSION_EXECUTION}
  if [[ ${NATIVE_ADMISSION_CLOSURE:-} != stale-force ]]; then
    admission_run_in "${execution}" git fetch -q origin
    admission_run_in "${execution}" git rebase -q origin/main
  fi
  if [[ ${NATIVE_ADMISSION_CLOSURE:-} != keep-seed ]]; then
    admission_run_in "${execution}" git rm -q .planning/seeds/N.md
  fi
  admission_run_in "${execution}" node \
    "${skills}/dough-product-backlog/scripts/product-backlog.mjs" complete \
    --identity "${NATIVE_ADMISSION_IDENTITY}"
  admission_run_in "${execution}" git add -A .planning
  admission_run_in "${execution}" git commit -qm \
    "Close ${NATIVE_ADMISSION_IDENTITY}"
  if [[ ${NATIVE_ADMISSION_CLOSURE:-} == stale-force ]]; then
    admission_run_in "${execution}" git push -q --force origin HEAD:main
  else
    admission_run_in "${execution}" git push -q origin HEAD:main
  fi
}
