#!/usr/bin/env bash
# scripts/test-jobs.sh [--from DIR] [path…]
# Lists the jobs one run of scripts/test.sh starts, in the order it starts
# them: a `<kind><TAB><label>` record per job, each ended by NUL, where kind is
# `shell` or `node`. The runner runs it from the repository root. Named paths,
# resolved from DIR (default the current directory), are exactly the jobs;
# with none, every check in the test directory is.
set -euo pipefail
# Before any Bash 5 syntax below, so an older bash meets the floor instead.
# scripts/test.sh has already checked the same PATH bash, so the floor stops
# here only for a direct run, such as the preview's listing.
# shellcheck disable=SC1091
# shellcheck source=scripts/bash-floor.bash
source "$(dirname -- "${BASH_SOURCE[0]}")/bash-floor.bash"
require_bash_floor 'rerun the preview'

from=${PWD}
if [[ ${1:-} == --from ]]; then
  from=$2
  shift 2
fi

# OPEN_DOUGH_TEST_SPLIT=<i>/<n> lists only share i of n (see the deal below),
# so separate runs, such as CI jobs, can divide the checks between them.
# Unset, every check is listed.
split=${OPEN_DOUGH_TEST_SPLIT:-}
if [[ -n ${split} ]]; then
  if [[ ! ${split} =~ ^([1-9][0-9]*)/([1-9][0-9]*)$ ]] \
    || ((BASH_REMATCH[1] > BASH_REMATCH[2])); then
    printf 'FAIL: OPEN_DOUGH_TEST_SPLIT=%s is not <i>/<n> with i from 1 to n.\n' "${split}" >&2
    exit 1
  fi
fi

# scripts/test.sh resolves the test directory once (OPEN_DOUGH_TEST_DIR,
# default `tests`) and hands it over. Another directory names substitute
# checks, such as in a runner test; it replaces the suite's own checks
# entirely.
if [[ -z ${OPEN_DOUGH_TEST_DIR:-} ]]; then
  printf 'FAIL: OPEN_DOUGH_TEST_DIR is unset; scripts/test.sh resolves the test directory and hands it over.\n' >&2
  exit 1
fi
test_dir=${OPEN_DOUGH_TEST_DIR}
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
    # The one-shot aggregate remains available for explicit focused proof;
    # its two discovered group wrappers own the same journeys in CI.
    [[ ${test_file} != tests/git-publication-native-one-shot.sh ]] || continue
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

  # The suite's own run also checks its installation; a substitute directory
  # replaces the suite's own checks entirely.
  if [[ ${test_dir} == tests ]]; then
    add_job shell 'scripts/check-self-installation.sh'
  fi
fi

# `longest-first` records each job's seconds from a CI run (see its header).
# scripts/test-shares.mjs owns the order and the split: it deals the jobs by
# those seconds (scripts/share-deal.mjs, tests/test-shares.md), so every run
# of the same checks gets the same order whatever order the file system lists
# them in, and a split puts every check in exactly one share. A list line that
# is not `<seconds><TAB><label>` fails the listing naming it, before any job
# starts.
allocator=(node "$(dirname -- "${BASH_SOURCE[0]}")/test-shares.mjs" share)
[[ ! -f ${test_dir}/longest-first ]] || allocator+=(--list "${test_dir}/longest-first")
[[ -z ${split} ]] || allocator+=(--split "${split}")
labels=()
if ((${#discovered[@]} > 0)); then
  printf '%s\0' "${discovered[@]}" | "${allocator[@]}" > "${work_dir}/share"
  mapfile -d '' -t labels < "${work_dir}/share"
fi
for label in "${labels[@]}"; do
  printf '%s\t%s\0' "${job_kinds[${label}]}" "${label}"
done
