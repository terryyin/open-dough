#!/usr/bin/env bash
# Checks a native comparison request
# (Distribution/tests/native-comparison.sh --native) before anything costs
# time or money: before a payload is frozen, a case materializes or a session
# starts. It refuses, naming every problem it finds, a host the runner does not
# drive, an unknown case, a missing prerequisite of the runner or of the case
# (its optional case_preflight ROOT, given the directory that will hold the
# arms) and a payload revision that names no commit. An uncommitted case
# basis is refused next, by the pair (native-comparison-basis.sh), still
# before freezing. It reads a payload revision as the pair does
# (native_comparison_pair_commit, native-comparison-pair.sh, sourced first).
#
#   native_comparison_preflight HOST CASE SOURCE_DIR WORK [REPOSITORY BASELINE CANDIDATE]
#     Returns 0 when the request can start, else prints `error:` lines and a
#     `refused:` line to standard error and returns 1.
# shellcheck disable=SC1090,SC1091,SC2312 # The case's own definitions; checks print what they find.

native_comparison_preflight() {
  local host=$1 case_name=$2 source_dir=$3 work=$4 repository=${5-} arm rev tool problem
  local case_path="${source_dir}/Distribution/tests/native-comparison/${case_name}" problems=()
  case ${host} in
    codex) ;;
    claude | cursor)
      problems+=("${host} is not qualified for comparison cases: the runner drives only codex, and ${host} stays unqualified until its own native observations are obtained")
      ;;
    *) problems+=("unknown host ${host}: the runner drives only codex") ;;
  esac
  if [[ ! -f ${case_path}/case.bash ]]; then
    problems+=("no comparison case ${case_name}; --list shows the cases")
  fi
  for tool in git jq node; do
    command -v "${tool}" > /dev/null 2>&1 || problems+=("missing prerequisite: ${tool} is not on PATH")
  done
  if [[ ${host} == codex ]] && ! command -v codex > /dev/null 2>&1; then
    problems+=('missing prerequisite: codex is not on PATH (a logged-in Codex CLI runs the arms)')
  fi
  if [[ -f ${case_path}/case.bash ]] && ! (
    source "${case_path}/case.bash"
    ! declare -F case_preflight > /dev/null || case_preflight "${work}"
  ); then
    problems+=("missing prerequisite of case ${case_name}: see its message above and the prerequisites in its case.md")
  fi
  if [[ -n ${repository} ]]; then
    for arm in baseline candidate; do
      rev=$6
      [[ ${arm} == baseline ]] || rev=$7
      problem=$(native_comparison_pair_commit "${repository}" "${arm}" "${rev}" 2>&1 > /dev/null) \
        || problems+=("${problem#error: }")
    done
  fi
  ((${#problems[@]})) || return 0
  printf 'error: %s\n' "${problems[@]}" >&2
  printf 'refused: no payload was frozen, no case materialized and no session started\n' >&2
  return 1
}
