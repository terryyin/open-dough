#!/usr/bin/env bash
# scripts/test-jobs.sh [--from DIR] [path…]
# Lists the jobs one run of scripts/test.sh starts, in the order it starts
# them: a `<kind><TAB><label>` record per job, each ended by NUL, where kind is
# `shell` or `node`. The runner runs it from the repository root. Named paths,
# resolved from DIR (default the current directory), are exactly the jobs;
# with none, every check in the test directory is.
set -euo pipefail

from=${PWD}
if [[ ${1:-} == --from ]]; then
  from=$2
  shift 2
fi

# OPEN_DOUGH_TEST_SPLIT=<i>/<n> lists only share i of n (see the partition
# below), so separate runs, such as CI jobs, can divide the checks between them.
# Unset, every check is listed.
split=${OPEN_DOUGH_TEST_SPLIT:-}
if [[ -n ${split} ]]; then
  if [[ ! ${split} =~ ^([1-9][0-9]*)/([1-9][0-9]*)$ ]] \
    || ((BASH_REMATCH[1] > BASH_REMATCH[2])); then
    printf 'FAIL: OPEN_DOUGH_TEST_SPLIT=%s is not <i>/<n> with i from 1 to n.\n' "${split}" >&2
    exit 1
  fi
  split_share=${BASH_REMATCH[1]} split_count=${BASH_REMATCH[2]}
fi

# OPEN_DOUGH_TEST_DIR names another directory of checks, such as substitutes
# in a runner test; it replaces the suite's own checks entirely.
test_dir=${OPEN_DOUGH_TEST_DIR:-tests}
declare -A job_kinds=()
discovered=()
# Adds one job once, as the kind given first.
add_job() {
  if [[ -z ${job_kinds[$2]+set} ]]; then
    job_kinds[$2]=$1
    discovered+=("$2")
  fi
}

# Adds each named check. Every path must be a shell check (`.sh`) or a
# `node --test` file (`.mjs`, `.js`); otherwise the run fails naming it before
# any job starts. A path inside this checkout keeps a label relative to it, as
# a full run's labels are.
add_chosen_jobs() {
  local path resolved kind
  for path in "$@"; do
    resolved=${path}
    [[ ${resolved} == /* ]] || resolved=${from}/${resolved}
    if [[ ! -f ${resolved} ]]; then
      printf 'FAIL: %s is not a file; no check was run.\n' "${path}" >&2
      exit 1
    fi
    case ${resolved} in
      *.sh) kind=shell ;;
      *.mjs | *.js) kind=node ;;
      *)
        printf 'FAIL: %s is neither a shell check (.sh) nor a node --test file (.mjs, .js); no check was run.\n' \
          "${path}" >&2
        exit 1
        ;;
    esac
    add_job "${kind}" "${resolved#"${PWD}"/}"
  done
}

# Files, not process substitutions, so a failing command fails the listing.
work_dir=$(mktemp -d)
trap 'rm -rf -- "${work_dir}"' EXIT
if (($#)); then
  add_chosen_jobs "$@"
else
  find "${test_dir}" -type f -name '*.sh' ! -path "${test_dir}/support/*" -print0 \
    > "${work_dir}/tests"
  while IFS= read -r -d '' test_file; do
    add_job shell "${test_file}"
  done < "${work_dir}/tests"

  # `node-test-files` lists glob patterns, relative to the repository root, of
  # `node --test` files; each matching file is scheduled as its own job.
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
fi

# `longest-first` names known long jobs, longest first. They start before the
# rest so the longest job does not begin last; unknown names are ignored. The
# rest follow sorted bytewise, not in discovery order, which differs between
# file systems, so every run of the same checks gets the same order.
labels=()
declare -A scheduled=()
if [[ -f ${test_dir}/longest-first ]]; then
  while read -r label; do
    [[ -z ${label} || ${label} == '#'* ]] && continue
    if [[ -n ${job_kinds[${label}]+set} && -z ${scheduled[${label}]+set} ]]; then
      labels+=("${label}")
      scheduled[${label}]=1
    fi
  done < "${test_dir}/longest-first"
fi
others=()
for label in "${discovered[@]}"; do
  [[ -n ${scheduled[${label}]+set} ]] || others+=("${label}")
done
if ((${#others[@]} > 0)); then
  printf '%s\0' "${others[@]}" | LC_ALL=C sort -z > "${work_dir}/others"
  mapfile -d '' -t others < "${work_dir}/others"
  labels+=("${others[@]}")
fi

# A split deals that order round-robin across its shares and keeps share i,
# so every check lands in exactly one share and known long jobs stay apart.
for index in "${!labels[@]}"; do
  [[ -z ${split} ]] || ((index % split_count == split_share - 1)) || continue
  printf '%s\t%s\0' "${job_kinds[${labels[index]}]}" "${labels[index]}"
done
