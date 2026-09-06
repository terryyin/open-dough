#!/usr/bin/env bash
set -euo pipefail

source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)
# shellcheck disable=SC1091
# shellcheck source=tests/helpers/release-fixture.bash
source "${source_dir}/tests/helpers/release-fixture.bash"

temporary_dir=$(mktemp -d)
trap 'rm -rf -- "${temporary_dir}"' EXIT
cd -- "${temporary_dir}"

helper="${source_dir}/src/install/open-dough-release.sh"
apply_tmp="${temporary_dir}/apply-tmp"
mkdir -p -- "${apply_tmp}"
target="${temporary_dir}/target project"
prepare_target "${target}"

assert_apply_tmp_empty() {
  local leftover
  leftover=$(find "${apply_tmp}" -mindepth 1 -print -quit)
  if [[ -n "${leftover}" ]]; then
    echo "FAIL: apply left temporary work under ${apply_tmp}: ${leftover}" >&2
    find "${apply_tmp}" -mindepth 1 -print >&2
    exit 1
  fi
}

export TMPDIR="${apply_tmp}"

if output=$(bash "${helper}" apply --url "${temporary_dir}/missing.git" \
  --target "${target}" --platform cursor 2>&1); then
  echo "FAIL: missing source must not succeed." >&2
  exit 1
fi
[[ "${output}" == *'Failed to fetch tags'* || "${output}" == *'Failed to fetch'* ]]
[[ ! -e "${target}/.cursor/skills/dough-update" ]]
assert_sentinels "${target}"
assert_apply_tmp_empty

invalid_highest="${temporary_dir}/invalid-highest.git"
mkdir -p -- "${invalid_highest}"
git -C "${invalid_highest}" init --quiet -b main
git_identity "${invalid_highest}"
write_candidate_payload "${invalid_highest}" 0.1.2 payload-0.1.2
commit_all "${invalid_highest}" 'valid lower release'
tag_release "${invalid_highest}" 0.1.2 '2026-09-01T00:00:00'
write_candidate_payload "${invalid_highest}" 0.1.2 payload-mismatch
printf '%s\n' '0.1.9' > "${invalid_highest}/VERSION"
commit_all "${invalid_highest}" 'invalid highest'
tag_release "${invalid_highest}" 0.1.10 '2026-09-02T00:00:00'

if output=$(bash "${helper}" apply --url "${invalid_highest}" \
  --target "${target}" --platform cursor 2>&1); then
  echo "FAIL: invalid highest release must not succeed." >&2
  exit 1
fi
[[ "${output}" == *'invalid'* ]]
[[ ! -e "${target}/.cursor/skills/dough-update" ]]
assert_sentinels "${target}"
assert_apply_tmp_empty

echo "PASS: failed apply setup removes operation-owned temporary work and leaves the target untouched."
