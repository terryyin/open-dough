#!/usr/bin/env bash
# The jobs scripts/test.sh runs. Sourced by it after the check environment;
# `collect_jobs` fills the runner's `job_kinds` (job label to `shell` or `node`)
# and `labels` (the start order), both declared by the runner.
# shellcheck disable=SC2034 # job_kinds and labels are the runner's.

# Adds one job once, as the kind given first.
add_job() {
  if [[ -z ${job_kinds[$2]+set} ]]; then
    job_kinds[$2]=$1
    discovered+=("$2")
  fi
}

# Prints the job kind for a check file's name: shell for `.sh`, node for
# `.mjs` or `.js`; fails for any other name.
job_kind() {
  case $1 in
    *.sh) echo shell ;;
    *.mjs | *.js) echo node ;;
    *) return 1 ;;
  esac
}

# Adds each named check, resolved from the caller's directory given first.
# Every path must be a shell or `node --test` file; otherwise the run fails
# naming it before any job starts. A path inside this checkout keeps a label
# relative to it, as a full run's labels are.
add_chosen_jobs() {
  local caller_dir=$1 path resolved kind
  shift
  for path in "$@"; do
    resolved=${path}
    [[ ${resolved} == /* ]] || resolved=${caller_dir}/${resolved}
    if [[ ! -f ${resolved} ]]; then
      printf 'FAIL: %s is not a file; no check was run.\n' "${path}" >&2
      exit 1
    fi
    if ! kind=$(job_kind "${resolved}"); then
      printf 'FAIL: %s is neither a shell check (.sh) nor a node --test file (.mjs, .js); no check was run.\n' \
        "${path}" >&2
      exit 1
    fi
    add_job "${kind}" "${resolved#"${PWD}"/}"
  done
}

# Adds every check in the test directory: each `*.sh` outside `support/`, each
# `node --test` file matched by a glob in its `node-test-files` (relative to
# the repository root), and, for the suite's own directory, the self-
# installation check. The scratch file given second holds the found names.
add_all_jobs() {
  local test_dir=$1 found=$2 test_file pattern node_file
  find "${test_dir}" -type f -name '*.sh' ! -path "${test_dir}/support/*" -print0 \
    > "${found}"
  while IFS= read -r -d '' test_file; do
    add_job shell "${test_file}"
  done < "${found}"
  if [[ -f ${test_dir}/node-test-files ]]; then
    while read -r pattern; do
      [[ -z ${pattern} || ${pattern} == '#'* ]] && continue
      while IFS= read -r node_file; do
        add_job node "${node_file}"
      done < <(compgen -G "${pattern}" || true)
    done < "${test_dir}/node-test-files"
  fi
  if [[ -z ${OPEN_DOUGH_TEST_DIR:-} ]]; then
    add_job shell 'scripts/check-self-installation.sh'
  fi
}

# collect_jobs <test-dir> <scratch-file> <caller-dir> [path…]
# With paths, the jobs are exactly those checks; otherwise every check in the
# test directory. Jobs named in its `longest-first`, longest first, start
# before the rest so the longest job does not begin last; unknown names are
# ignored.
collect_jobs() {
  local test_dir=$1 found=$2 caller_dir=$3 label
  shift 3
  local discovered=()
  if (($#)); then
    add_chosen_jobs "${caller_dir}" "$@"
  else
    add_all_jobs "${test_dir}" "${found}"
  fi
  local -A scheduled=()
  if [[ -f ${test_dir}/longest-first ]]; then
    while read -r label; do
      [[ -z ${label} || ${label} == '#'* ]] && continue
      if [[ -n ${job_kinds[${label}]+set} && -z ${scheduled[${label}]+set} ]]; then
        labels+=("${label}")
        scheduled[${label}]=1
      fi
    done < "${test_dir}/longest-first"
  fi
  for label in "${discovered[@]}"; do
    [[ -n ${scheduled[${label}]+set} ]] || labels+=("${label}")
  done
}
