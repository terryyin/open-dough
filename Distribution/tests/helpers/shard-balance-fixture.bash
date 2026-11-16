#!/usr/bin/env bash
# A repository in REPOSITORY holding the runner and scripts/ci-shard-balance.mjs
# with its modules, a `gh` stand-in in FAKE serving fixture ci.yml runs and
# their times artifacts, the builders of those runs and files, and
# run_balance. Requires these and source_dir, temporary_dir and scratch; the
# sourcing check writes the repository's .github/workflows/ci.yml.
: "${source_dir:?source_dir must be set before sourcing this helper}"
: "${temporary_dir:?temporary_dir must be set before sourcing this helper}"
: "${fake:?fake must be set before sourcing this helper}"
: "${repository:?repository must be set before sourcing this helper}"
: "${scratch:?scratch must be set before sourcing this helper}"
# shellcheck disable=SC1091
# shellcheck source=Distribution/tests/helpers/copy-runner.bash
source "${source_dir}/Distribution/tests/helpers/copy-runner.bash"

# The stand-in logs its calls, prints the `--jq` listing from fixture `listing`
# (or fails with `list-error`), applies an artifacts call's `--jq` filter to
# the run's fixture artifact directories, and copies those matching a
# download's pattern into its directory.
cat > "${fake}/bin/gh" << 'STANDIN'
#!/usr/bin/env bash
set -euo pipefail
printf '%s\n' "$*" >> "${FAKE_GH}/calls"
case "$1 $2" in
  'run list')
    if [[ -f ${FAKE_GH}/list-error ]]; then
      cat -- "${FAKE_GH}/list-error" >&2
      exit 1
    fi
    cat -- "${FAKE_GH}/listing"
    ;;
  api\ *)
    run=${2#*/runs/}
    run=${run%%/*}
    mkdir -p -- "${FAKE_GH}/runs/${run}"
    find "${FAKE_GH}/runs/${run}" -mindepth 1 -maxdepth 1 -type d -exec basename {} \; \
      | jq -R '{name: ., expired: false}' | jq -s '{artifacts: .}' | jq -r "$4"
    ;;
  'run download')
    mkdir -p -- "$7"
    for artifact in "${FAKE_GH}/runs/$3"/*/; do
      name=$(basename -- "${artifact}")
      # shellcheck disable=SC2053 # The pattern is gh's artifact-name glob.
      [[ ${name} != $5 ]] || cp -R -- "${artifact}" "$7/${name}"
    done
    ;;
  *) exit 2 ;;
esac
STANDIN
chmod +x "${fake}/bin/gh"

# Lists runs as gh's `--jq` listing prints them, newest first: `RUN CREATED`.
list_runs() {
  : > "${fake}/listing"
  while (($#)); do
    printf '%s\t%s\n' "$1" "$2" >> "${fake}/listing"
    shift 2
  done
}

# Gives run RUN the artifact NAME holding FILE, one `<seconds><TAB><label>`
# row per remaining `SECONDS LABEL` pair.
times_artifact() {
  local run=$1 name=$2 file=$3
  shift 3
  mkdir -p -- "${fake}/runs/${run}/${name}"
  : > "${fake}/runs/${run}/${name}/${file}"
  while (($#)); do
    printf '%s\t%s\n' "$1" "$2" >> "${fake}/runs/${run}/${name}/${file}"
    shift 2
  done
}

# Creates empty files at the repository-relative paths given.
discovered() {
  local path
  for path in "$@"; do
    mkdir -p -- "$(dirname -- "${repository}/${path}")"
    : > "${repository}/${path}"
  done
}

copy_runner "${repository}"
cp -- "${source_dir}/scripts/ci-shard-balance.mjs" "${source_dir}/scripts/ci-shard-times.mjs" \
  "${source_dir}/scripts/ci-shard-proposal.mjs" "${repository}/scripts/"
mkdir -p -- "${repository}/dashboard/tests/support" "${repository}/.github/workflows"
cp -- "${source_dir}/dashboard/tests/support/testFiles.mjs" "${repository}/dashboard/tests/support/"

# Runs the copied command for GROUP with the stand-in, logging to <name>.log and
# setting command_status for expect_report.
# shellcheck disable=SC2034
run_balance() {
  command_status=0
  (cd "${repository}" && PATH="${fake}/bin:${PATH}" FAKE_GH="${fake}" TMPDIR="${scratch}" \
    node scripts/ci-shard-balance.mjs "$2") > "${temporary_dir}/$1.log" 2>&1 || command_status=$?
}
