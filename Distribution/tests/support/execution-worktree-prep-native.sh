#!/usr/bin/env bash
# Parse, listing, and inventory helpers for
# tests/execution-worktree-preparation-native.sh.
# shellcheck disable=SC2034,SC2154,SC2249,SC2310,SC2312
# Globals are shared with the wrapper; known_case rejects unknown variants.

prep_native_support_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)
prep_native_repo_root=$(cd -- "${prep_native_support_dir}/../.." && pwd)
prep_native_assess_js="${prep_native_support_dir}/execution-worktree-prep-native-assess.mjs"
prep_native_fixture_js="${prep_native_support_dir}/execution-worktree-prep-native-fixture.mjs"

prep_native_hosts=(codex cursor claude)
prep_native_cases=(fresh-node failed-prep reuse wrapper)

prep_native_known_host() {
  case $1 in
    codex | cursor | claude) return 0 ;;
    *) return 1 ;;
  esac
}

prep_native_known_case() {
  case $1 in
    fresh-node | failed-prep | reuse | wrapper) return 0 ;;
    *) return 1 ;;
  esac
}

prep_native_fail() {
  printf 'error: %s\n' "$1" >&2
  prep_native_print_usage >&2
  exit 2
}

prep_native_print_usage() {
  printf 'usage: %s\n' "${prep_native_entry}"
  printf '   or: %s --list [--results-dir DIR]\n' "${prep_native_entry}"
  printf '   or: %s --native HOST [--case CASE] [--results-dir DIR] [--deadline SECONDS] [--grace SECONDS]\n' \
    "${prep_native_entry}"
  printf 'HOST is codex, cursor, or claude.\n'
  printf 'CASE is fresh-node (default), failed-prep, reuse, or wrapper.\n'
  printf 'Default --deadline is 3600 seconds; default --grace is 15 seconds.\n'
  printf 'Listing is read-only and does not run an agent or probe its version.\n'
  printf '%s\n' \
    '--results-dir is optional for listing and need not be writable or exist.'
  printf '%s\n' \
    'Selected native launch with --results-dir requires a writable directory; without it the native path still retains a disposable attempt directory.'
  printf '%s\n' \
    '--deadline and --grace apply to selected native launch. --deadline is an integer >= 1; --grace is an integer >= 0.'
}

prep_native_print_description() {
  local host=$1
  local case_id=$2

  printf 'purpose: '
  case ${case_id} in
    fresh-node)
      printf 'Ordinary execute-plan in a fresh locked Node worktree prepares that checkout before implementation.\n'
      ;;
    failed-prep)
      printf 'Failed project setup stops before implementation delegation and preserves recovery evidence.\n'
      ;;
    reuse)
      printf 'Verified exact-checkout preparation is reused without a second clean install.\n'
      ;;
    wrapper)
      printf 'A wrapper-driven non-Node project uses its own setup and command, not npm or Nix.\n'
      ;;
  esac
  printf 'setup: Isolated %s project with the candidate payload installed and a separately located execution worktree.\n' \
    "${host}"
  printf 'dependencies: none\n'
}

prep_native_print_prior_evidence() {
  local host=$1
  local case_id=$2
  local results_dir=${prep_native_results_dir}
  local case_dir attempt printed=0

  if [[ -z ${results_dir} || ! -d ${results_dir} ]]; then
    printf 'prior-evidence: none\n'
    return
  fi
  case_dir="${results_dir}/${host}/${case_id}"
  if [[ -d ${case_dir} ]]; then
    for attempt in "${case_dir}"/*; do
      if [[ -e ${attempt} ]]; then
        printf 'prior-evidence: unreviewed %s\n' "${attempt}"
        printed=1
      fi
    done
  fi
  if [[ ${printed} -eq 0 ]]; then
    printf 'prior-evidence: none\n'
  fi
}

prep_native_print_listing() {
  local host case_id

  prep_native_print_usage
  printf '\n'
  for host in "${prep_native_hosts[@]}"; do
    for case_id in "${prep_native_cases[@]}"; do
      printf 'host: %s\n' "${host}"
      printf 'case: %s\n' "${case_id}"
      prep_native_print_description "${host}" "${case_id}"
      prep_native_print_prior_evidence "${host}" "${case_id}"
      printf '\n'
    done
  done
}

prep_native_parse() {
  local native_flag=0
  local list_flag=0
  local host_arg=
  local option

  prep_native_mode=
  prep_native_host=
  prep_native_case=
  prep_native_results_dir=
  prep_native_deadline=
  prep_native_grace=
  prep_native_entry=${prep_native_entry:-$0}

  while [[ $# -gt 0 ]]; do
    case $1 in
      --list)
        list_flag=1
        shift
        ;;
      --results-dir)
        if [[ $# -lt 2 || $2 == --* ]]; then
          prep_native_fail 'missing --results-dir value'
        fi
        prep_native_results_dir=$2
        shift 2
        ;;
      --case)
        if [[ $# -lt 2 || $2 == --* ]]; then
          prep_native_fail 'missing --case value'
        fi
        prep_native_case=$2
        shift 2
        ;;
      --native)
        native_flag=1
        shift
        ;;
      --deadline | --grace)
        option=$1
        if [[ $# -lt 2 || $2 == --* ]]; then
          prep_native_fail "missing ${option} value"
        fi
        if [[ ! $2 =~ ^[0-9]+$ ]]; then
          prep_native_fail "${option} must be a non-negative integer: $2"
        fi
        if [[ ${option} == '--deadline' && $2 -lt 1 ]]; then
          prep_native_fail '--deadline must be an integer >= 1'
        fi
        if [[ ${option} == '--deadline' ]]; then
          prep_native_deadline=$2
        else
          prep_native_grace=$2
        fi
        shift 2
        ;;
      --help | -h)
        prep_native_print_usage
        exit 0
        ;;
      --*)
        prep_native_fail "unknown option $1"
        ;;
      *)
        if [[ -n ${host_arg} ]]; then
          prep_native_fail "unexpected argument $1"
        fi
        host_arg=$1
        shift
        ;;
    esac
  done

  if [[ -n ${prep_native_results_dir} && -e ${prep_native_results_dir} &&
    ! -d ${prep_native_results_dir} ]]; then
    prep_native_fail "--results-dir must be a directory: ${prep_native_results_dir}"
  fi

  if [[ ${list_flag} -eq 1 ]]; then
    if [[ ${native_flag} -eq 1 || -n ${prep_native_case} || -n ${host_arg} ||
      -n ${prep_native_deadline} || -n ${prep_native_grace} ]]; then
      prep_native_fail '--list does not accept --native, --case, --deadline, --grace, or extra arguments'
    fi
    prep_native_mode=list
    return
  fi

  if [[ ${native_flag} -eq 0 ]]; then
    if [[ -n ${host_arg} || -n ${prep_native_case} ]]; then
      prep_native_fail '--case and a host require --native'
    fi
    if [[ -n ${prep_native_results_dir} ]]; then
      prep_native_fail '--results-dir requires --list or --native'
    fi
    if [[ -n ${prep_native_deadline} || -n ${prep_native_grace} ]]; then
      prep_native_fail '--deadline and --grace require --native'
    fi
    prep_native_mode=default
    return
  fi

  if [[ -z ${host_arg} ]]; then
    prep_native_fail 'missing host: expected --native codex|cursor|claude'
  fi
  if ! prep_native_known_host "${host_arg}"; then
    prep_native_fail "unknown host '${host_arg}'"
  fi
  prep_native_host=${host_arg}
  if [[ -z ${prep_native_case} ]]; then
    prep_native_case=fresh-node
  fi
  if ! prep_native_known_case "${prep_native_case}"; then
    prep_native_fail "unknown case '${prep_native_case}'"
  fi
  prep_native_mode=native
}
