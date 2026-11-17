#!/usr/bin/env bash
# Probes of the launch-command-tests case (case.md, Assessment): case.bash
# sources this file. Each probe edits one product file of the participant's
# final workspace, runs only the specs that decide it, and restores the file
# byte for byte; it prints a turn-N field and judges nothing.
# shellcheck disable=SC2034,SC2154,SC2312 # case_* globals are read by case.bash, case_e2e_specs is its own; observations print what each command gives.

# name|file|sed expression: the unrelated perturbation, then one fault per
# promise. The perturbation moves the effort option before the name and
# changes the default effort; the faults break the launch name, give a blank
# launch a prompt, and change only the admitted default.
case_probe_edits=(
  'perturbation|dashboard/src/hostDescription.ts|s/defaultEffort: "medium"/defaultEffort: "high"/'
  'perturbation|dashboard/server/hosts/claude/runtime.ts|/^ *\.\.\.(effort === undefined/d'
  'perturbation|dashboard/server/hosts/claude/runtime.ts|s/"--bg",$/"--bg", ...(effort === undefined ? [] : ["--effort", effort]),/'
  'fault-name|dashboard/server/hosts/claude/runtime.ts|s/^\( *\)name,$/\1name.replace(" · Ad hoc", ""),/'
  'fault-instruction|dashboard/server/hosts/claude/runtime.ts|s/instruction === undefined ? \[\]/instruction === undefined ? ["go"]/'
  'fault-default|dashboard/server/agentLaunchAccept.ts|s/effort: hostDescriptions.claude.defaultEffort/effort: "low"/'
)

# Applies probe NAME's edits to WORKSPACE, keeping originals under SAVED;
# prints `edited` or `unapplied` when an edit changed nothing.
case_probe_apply() {
  local workspace=$1 name=$2 saved=$3 row probe file expression
  mkdir -p -- "${saved}"
  for row in "${case_probe_edits[@]}"; do
    IFS='|' read -r probe file expression <<< "${row}"
    [[ ${probe} == "${name}" ]] || continue
    [[ -f ${saved}/${file//\//_} ]] || cp -- "${workspace}/${file}" "${saved}/${file//\//_}"
    cp -- "${workspace}/${file}" "${saved}/before"
    sed -i.probe -e "${expression}" "${workspace}/${file}" && rm -f -- "${workspace}/${file}.probe"
    if cmp -s "${saved}/before" "${workspace}/${file}"; then
      echo unapplied
      return
    fi
  done
  echo edited
}

# Restores every file probe edits saved under SAVED in WORKSPACE.
case_probe_restore() {
  local workspace=$1 saved=$2 row probe file expression
  for row in "${case_probe_edits[@]}"; do
    IFS='|' read -r probe file expression <<< "${row}"
    [[ ! -f ${saved}/${file//\//_} ]] || cp -- "${saved}/${file//\//_}" "${workspace}/${file}"
  done
  rm -rf -- "${saved}"
}

# Runs probe NAME over the specs SPECS of Playwright config CONFIG; prints
# `turn-N-FIELD: green|red|missing|unapplied`.
case_probe() {
  local workspace=$1 turn=$2 evidence=$3 field=$4 name=$5 config=$6 applied counts
  shift 6
  applied=$(case_probe_apply "${workspace}" "${name}" "${evidence}/probe-saved")
  if [[ ${applied} == edited ]]; then
    counts=$(case_run_specs "${workspace}" "${config}" "${evidence}/${field}-turn-${turn}.json" "$@")
    case $(case_outcome "${counts}") in
      passed) applied=green ;;
      failed) applied=red ;;
      *) applied=missing ;;
    esac
  fi
  case_probe_restore "${workspace}" "${evidence}/probe-saved"
  printf 'turn-%s-%s: %s\n' "${turn}" "${field}" "${applied}"
}

# Prints the probe fields of WORKSPACE after turn N and whether its tree
# still matches FINAL afterwards.
case_observe_probes() {
  local workspace=$1 turn=$2 evidence=$3 final=$4 backend=dashboard/backend.playwright.config.ts
  local ad_hoc=dashboard/backend-tests/launches/agent-launch-ad-hoc-boundary.spec.ts
  local model=dashboard/backend-tests/launches/agent-launch-model-boundary.spec.ts
  local e2e=e2e/playwright.config.ts
  case_probe "${workspace}" "${turn}" "${evidence}" perturbation-e2e perturbation "${e2e}" "${case_e2e_specs[@]}"
  case_probe "${workspace}" "${turn}" "${evidence}" perturbation-ad-hoc perturbation "${backend}" "${ad_hoc}"
  case_probe "${workspace}" "${turn}" "${evidence}" fault-name fault-name "${backend}" "${ad_hoc}"
  case_probe "${workspace}" "${turn}" "${evidence}" fault-instruction fault-instruction "${e2e}" "${case_e2e_specs[@]}"
  case_probe "${workspace}" "${turn}" "${evidence}" fault-default fault-default "${backend}" "${model}"
  if [[ $(case_tree "${workspace}" "${evidence}/probed.index") == "${final}" ]]; then
    printf 'turn-%s-probes-restored: true\n' "${turn}"
  else
    printf 'turn-%s-probes-restored: false\n' "${turn}"
  fi
  rm -f -- "${evidence}/probed.index"
}
