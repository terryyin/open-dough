#!/usr/bin/env bash
# shellcheck disable=SC2312
set -euo pipefail

source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)
# shellcheck disable=SC1091
source "${source_dir}/tests/helpers/public-payload-fixture.bash"
# shellcheck disable=SC1091
source "${source_dir}/tests/helpers/release-fixture.bash"

temporary_dir=$(mktemp -d)
trap 'rm -rf -- "${temporary_dir}"' EXIT
fixture="${temporary_dir}/fixture.git"
target="${temporary_dir}/target"
build_latest_fixture "${fixture}"
prepare_target "${target}"
helper="${source_dir}/src/install/open-dough-release.sh"
bash "${helper}" apply --url "${fixture}" --target "${target}" --platform cursor > /dev/null
before=$(snapshot_path_state "${target}")
trace="${temporary_dir}/trace"
OPEN_DOUGH_TRACE="${trace}" bash "${helper}" apply --target "${target}" --platform cursor > "${temporary_dir}/output"
[[ $(snapshot_path_state "${target}") == "${before}" ]]
grep -Fq 'both physical installations are current' "${temporary_dir}/output"
grep -qx "apply-skip-equal ${target}/.agents/skills/dough-update" "${trace}"
if grep -q '^install ' "${trace}"; then
  echo 'FAIL: fully current roots must remain unwritten.' >&2
  exit 1
fi
echo 'PASS: all verified current roots skip together without target writes.'
