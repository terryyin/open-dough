#!/usr/bin/env bash
# shellcheck disable=SC2034 # Wrappers consume parsed native_case_* globals.
# Option parsing for the ADR-awareness native-check wrappers.
# Listing is read-only: it never runs an agent or probes a version.

native_case_entry=
native_case_wrapper=
native_case_fixed_host=
native_case_mode=
native_case_host=
native_case_id=
native_case_results_dir=
native_case_deadline=
native_case_grace=

native_case_print_usage() {
  printf 'usage: %s\n' "${native_case_entry}"
  printf '   or: %s --list [--results-dir DIR]\n' "${native_case_entry}"
  case ${native_case_wrapper} in
    context)
      printf '   or: %s --native HOST SCENARIO [--results-dir DIR] [--deadline SECONDS] [--grace SECONDS]\n' \
        "${native_case_entry}"
      printf '   or: %s --native HOST --case context/clear|context/conflict [--results-dir DIR] [--deadline SECONDS] [--grace SECONDS]\n' \
        "${native_case_entry}"
      printf 'HOST is codex, cursor, or claude. SCENARIO is clear or conflict.\n'
      printf 'Default --deadline is 3600 seconds; default --grace is 15 seconds.\n'
      ;;
    delivery)
      printf '   or: %s --native\n' "${native_case_entry}"
      printf '   or: %s --native --case CASE [--results-dir DIR]\n' \
        "${native_case_entry}"
      printf 'CASE is delivery/legacy-refusal, delivery/ordinary-update, or delivery/updated-use.\n'
      printf 'Selected --case does not launch the full three-session --native journey.\n'
      ;;
    *)
      printf 'error: internal error: unknown wrapper %s\n' \
        "${native_case_wrapper}" >&2
      ;;
  esac
  printf 'Listing is read-only and does not run an agent or probe its version.\n'
  printf '%s\n' \
    '--results-dir is optional for listing and need not be writable or exist.'
  printf '%s\n' \
    'Selected native launch with --results-dir requires a writable directory; without it the native path still uses disposable scratch.'
  printf '%s\n' \
    '--deadline and --grace apply to selected native launch. --deadline is an integer >= 1; --grace is an integer >= 0.'
}

native_case_fail() {
  printf 'error: %s\n' "$1" >&2
  native_case_print_usage >&2
  exit 2
}

native_case_reject_unlaunched_selected() {
  native_case_fail "selected case '${native_case_id}' is recognized and not launched"
}

native_case_support_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)
# shellcheck source=tests/support/native-case-inventory.sh
# shellcheck disable=SC1091
source "${native_case_support_dir}/native-case-inventory.sh"

native_case_parse() {
  local native_flag=0
  local list_flag=0
  local host_arg=
  local scenario_arg=
  local option

  native_case_wrapper=
  native_case_fixed_host=
  native_case_mode=
  native_case_host=
  native_case_id=
  native_case_results_dir=
  native_case_deadline=
  native_case_grace=
  native_case_entry=${native_case_entry:-$0}

  while [[ $# -gt 0 ]]; do
    case $1 in
      --wrapper)
        if [[ $# -lt 2 || $2 == --* ]]; then
          native_case_fail 'missing --wrapper value'
        fi
        native_case_wrapper=$2
        shift 2
        ;;
      --host)
        if [[ $# -lt 2 || $2 == --* ]]; then
          native_case_fail 'missing --host value'
        fi
        native_case_fixed_host=$2
        shift 2
        ;;
      *)
        break
        ;;
    esac
  done

  if [[ ${native_case_wrapper} != 'context' && ${native_case_wrapper} != 'delivery' ]]; then
    native_case_fail 'internal error: wrapper must be context or delivery'
  fi
  if [[ ${native_case_wrapper} == 'delivery' ]]; then
    if ! native_case_known_host "${native_case_fixed_host}"; then
      native_case_fail 'internal error: delivery host must be codex, cursor, or claude'
    fi
  fi

  while [[ $# -gt 0 ]]; do
    case $1 in
      --list)
        list_flag=1
        shift
        ;;
      --results-dir)
        if [[ $# -lt 2 || $2 == --* ]]; then
          native_case_fail 'missing --results-dir value'
        fi
        native_case_results_dir=$2
        shift 2
        ;;
      --case)
        if [[ $# -lt 2 || $2 == --* ]]; then
          native_case_fail 'missing --case value'
        fi
        native_case_id=$2
        shift 2
        ;;
      --native)
        native_flag=1
        shift
        ;;
      --deadline | --grace)
        if [[ $# -lt 2 || $2 == --* ]]; then
          native_case_fail "missing $1 value"
        fi
        if [[ ! $2 =~ ^[0-9]+$ ]]; then
          native_case_fail "$1 must be a non-negative integer: $2"
        fi
        if [[ $1 == '--deadline' && $2 -lt 1 ]]; then
          native_case_fail '--deadline must be an integer >= 1'
        fi
        if [[ $1 == '--deadline' ]]; then
          native_case_deadline=$2
        else
          native_case_grace=$2
        fi
        shift 2
        ;;
      --*)
        native_case_fail "unknown option $1"
        ;;
      *)
        if [[ -z ${host_arg} ]]; then
          host_arg=$1
        elif [[ -z ${scenario_arg} ]]; then
          scenario_arg=$1
        else
          native_case_fail "unexpected argument $1"
        fi
        shift
        ;;
    esac
  done

  if [[ -n ${native_case_results_dir} && -e "${native_case_results_dir}" &&
    ! -d "${native_case_results_dir}" ]]; then
    native_case_fail "--results-dir must be a directory: ${native_case_results_dir}"
  fi

  if [[ ${list_flag} -eq 1 ]]; then
    if [[ ${native_flag} -eq 1 || -n ${native_case_id} || -n ${host_arg} ||
      -n ${native_case_deadline} || -n ${native_case_grace} ]]; then
      native_case_fail '--list does not accept --native, --case, --deadline, --grace, or extra arguments'
    fi
    native_case_mode=list
    if [[ ${native_case_wrapper} == 'delivery' ]]; then
      native_case_host=${native_case_fixed_host}
    fi
    return
  fi

  if [[ ${native_case_wrapper} == 'context' ]]; then
    if [[ ${native_flag} -eq 0 && -z ${native_case_id} && -z ${host_arg} ]]; then
      if [[ -n ${native_case_results_dir} ]]; then
        native_case_fail '--results-dir requires --list or --native'
      fi
      if [[ -n ${native_case_deadline} || -n ${native_case_grace} ]]; then
        native_case_fail '--deadline and --grace require --native'
      fi
      native_case_mode=default
      return
    fi
    if [[ ${native_flag} -eq 0 ]]; then
      native_case_fail 'selected checks require --native'
    fi
    if [[ -z ${host_arg} ]]; then
      native_case_fail 'missing host: expected --native codex|cursor|claude'
    fi
    if ! native_case_known_host "${host_arg}"; then
      native_case_fail "unknown host '${host_arg}'"
    fi
    native_case_host=${host_arg}
    if [[ -n ${native_case_id} ]]; then
      if ! native_case_known_context_id "${native_case_id}"; then
        native_case_fail "unknown case '${native_case_id}'"
      fi
      option=${native_case_id#context/}
      if [[ -n ${scenario_arg} && ${scenario_arg} != "${option}" ]]; then
        native_case_fail "scenario '${scenario_arg}' does not match --case ${native_case_id}"
      fi
    else
      if [[ -z ${scenario_arg} ]]; then
        native_case_fail 'missing scenario: expected clear or conflict'
      fi
      if ! native_case_known_context_id "context/${scenario_arg}"; then
        native_case_fail "unknown case '${scenario_arg}'"
      fi
      native_case_id="context/${scenario_arg}"
    fi
    native_case_mode=native-context
    return
  fi

  if [[ -n ${host_arg} ]]; then
    native_case_fail "unexpected argument '${host_arg}'"
  fi
  if [[ ${native_flag} -eq 0 ]]; then
    if [[ -n ${native_case_id} || -n ${native_case_results_dir} ||
      -n ${native_case_deadline} || -n ${native_case_grace} ]]; then
      native_case_fail 'selected checks require --native or --list'
    fi
    native_case_mode=default
    native_case_host=${native_case_fixed_host}
    return
  fi

  native_case_host=${native_case_fixed_host}
  if [[ -z ${native_case_id} ]]; then
    native_case_mode=native-full
    return
  fi
  if ! native_case_known_delivery_id "${native_case_id}"; then
    native_case_fail "unknown case '${native_case_id}'"
  fi
  native_case_mode=native-selected
}
