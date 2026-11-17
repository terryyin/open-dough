#!/usr/bin/env bash
# Test-only words for native entry checks. Expectations are silent on success.
# shellcheck disable=SC2312,SC2034 # Captured status is consumed by the sourcing check.

native_check_workspaces=()

native_check_cleanup() {
  local status=$? directory
  for directory in "${native_check_workspaces[@]}"; do
    chmod -R u+w "${directory}" 2> /dev/null || true
    rm -rf -- "${directory}"
  done
  return "${status}"
}

# Call directly, not through command substitution, so the exit trap stays here.
native_check_workspace() {
  local directory
  directory=$(mktemp -d)
  native_check_workspaces+=("${directory}")
  printf -v "$1" '%s' "${directory}"
  trap native_check_cleanup EXIT
}

# The entry's status is captured without changing the caller's errexit setting.
native_check_run() {
  local hosts=$1 stdout=$2 stderr=$3
  shift 3
  if env PATH="${hosts}:${PATH}" "$@" > "${stdout}" 2> "${stderr}"; then
    native_check_status=0
  else
    native_check_status=$?
  fi
}

native_check_fail() {
  local fact=$1 expected=$2 actual=$3 evidence
  shift 3
  printf 'expectation failed: %s\nexpected: %s\nactual: %s\n' \
    "${fact}" "${expected}" "${actual}" >&2
  for evidence in "$@"; do
    printf 'evidence: %s\n' "${evidence}" >&2
    if [[ -f ${evidence} ]]; then
      cat -- "${evidence}" >&2
    elif [[ -e ${evidence} || -L ${evidence} ]]; then
      ls -ld -- "${evidence}" >&2
    else
      printf '%s\n' '<absent>' >&2
    fi
  done
  return 1
}

native_check_expect_status() {
  local fact=$1 expected=$2 actual=$3
  shift 3
  [[ ${actual} == "${expected}" ]] || native_check_fail "${fact}" "${expected}" "${actual}" "$@"
}

native_check_expect_field() {
  local fact=$1 record=$2 field=$3 expected=$4 actual='<missing>'
  if [[ -f ${record} ]]; then
    actual=$(awk -v prefix="${field}: " 'index($0, prefix) == 1 { print substr($0, length(prefix) + 1); found=1 } END { if (!found) print "<missing>" }' "${record}")
  fi
  [[ ${actual} == "${expected}" ]] || native_check_fail "${fact} (${field})" "${expected}" "${actual}" "${record}"
}

native_check_expect_line() {
  local fact=$1 file=$2 expected=$3
  grep -Fq -- "${expected}" "${file}" 2> /dev/null || native_check_fail "${fact}" "${expected}" '<line absent>' "${file}"
}

native_check_expect_absent() {
  local fact=$1 path=$2
  [[ ! -e ${path} && ! -L ${path} ]] || native_check_fail "${fact}" '<absent>' '<present>' "${path}"
}
