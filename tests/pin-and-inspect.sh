#!/usr/bin/env bash
set -euo pipefail

source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)
# shellcheck disable=SC1091
# shellcheck source=tests/helpers/release-fixture.bash
source "${source_dir}/tests/helpers/release-fixture.bash"

temporary_dir=$(mktemp -d)
trap 'rm -rf -- "${temporary_dir}"' EXIT
cd -- "${temporary_dir}"

fixture="${temporary_dir}/fixture.git"
build_latest_fixture "${fixture}"

inject_bootstrap_leak() {
  local file=$1
  local label=$2
  local staged

  staged=$(mktemp)
  cat > "${staged}" << EOF
#!/usr/bin/env bash
if [[ -n "\${OPEN_DOUGH_BOOTSTRAP_LEAK:-}" ]]; then
  printf '%s\\n' '${label}' >> "\${OPEN_DOUGH_BOOTSTRAP_LEAK}"
fi
EOF
  tail -n +2 "${file}" >> "${staged}"
  mv -- "${staged}" "${file}"
}

inject_bootstrap_leak "${fixture}/src/install/open-dough-release.sh" helper
inject_bootstrap_leak "${fixture}/install.sh" installer
commit_all "${fixture}" 'poison default branch helper and installer'

peeled=''
plain=''
listing=$(git ls-remote --tags -- "${fixture}")
while IFS=$'\t' read -r sha ref; do
  [[ "${ref}" == refs/tags/v0.1.10^{} ]] && peeled=${sha}
  [[ "${ref}" == refs/tags/v0.1.10 ]] && plain=${sha}
done << EOF
${listing}
EOF
commit=${peeled:-${plain}}
[[ -n "${commit}" ]]
[[ ${#commit} -eq 40 ]]

snapshot="${temporary_dir}/snapshot"
mkdir -p -- "${snapshot}"
git -C "${snapshot}" init --quiet
git -C "${snapshot}" fetch --quiet --depth 1 "file://${fixture}" "${commit}"
git -C "${snapshot}" -c advice.detachedHead=false checkout --quiet --detach FETCH_HEAD
head=$(git -C "${snapshot}" rev-parse HEAD)
[[ "${head}" == "${commit}" ]]
grep -Fq 'open-dough-payload payload-0.1.10' \
  "${snapshot}/src/skills/dough-update/SKILL.md"

target="${temporary_dir}/target project"
prepare_target "${target}"
leak="${temporary_dir}/bootstrap.leak"
: > "${leak}"
export OPEN_DOUGH_BOOTSTRAP_LEAK="${leak}"
output=$(bash "${snapshot}/src/install/open-dough-release.sh" apply \
  --url "${fixture}" --target "${target}" --platform cursor \
  --checkout "${snapshot}")
[[ "${output}" == *"Source: ${fixture}"* ]]
[[ "${output}" == *"Release: v0.1.10 (commit ${commit})"* ]]
[[ "${output}" == *'Outcome: installed 0.1.10.'* ]]
assert_payload "${target}/.cursor/skills/dough-update" 0.1.10 payload-0.1.10
assert_sentinels "${target}"
[[ ! -s "${leak}" ]]

poisoned="${temporary_dir}/poisoned clone"
git clone --quiet "${fixture}" "${poisoned}"
poison_target="${temporary_dir}/poison target"
prepare_target "${poison_target}"
: > "${leak}"
output=$(bash "${poisoned}/src/install/open-dough-release.sh" apply \
  --url "${fixture}" --target "${poison_target}" --platform cursor)
[[ "${output}" == *'Outcome: installed 0.1.10.'* ]]
grep -qx helper "${leak}"
if grep -qx installer "${leak}"; then
  echo "FAIL: default-branch installer must not run after apply fetches the release." >&2
  exit 1
fi

mismatch_target="${temporary_dir}/mismatch project"
prepare_target "${mismatch_target}"
: > "${leak}"
if output=$(bash "${poisoned}/src/install/open-dough-release.sh" apply \
  --url "${fixture}" --target "${mismatch_target}" --platform cursor \
  --checkout "${poisoned}" 2>&1); then
  echo "FAIL: apply --checkout must refuse a checkout that is not pinned latest." >&2
  exit 1
fi
[[ "${output}" == *'not replacing inspected files'* ]]
[[ ! -e "${mismatch_target}/.cursor/skills/dough-update" ]]
assert_sentinels "${mismatch_target}"
grep -qx helper "${leak}"
head_after=$(git -C "${poisoned}" rev-parse HEAD)
poisoned_head=$(git -C "${fixture}" rev-parse HEAD)
[[ "${head_after}" == "${poisoned_head}" ]]

echo "PASS: git bootstrap executes only the inspected pinned release; default-branch helper never runs on that path; apply --checkout does not replace inspected files."
