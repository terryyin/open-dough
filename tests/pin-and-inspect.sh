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

leak="${temporary_dir}/bootstrap.leak"
: > "${leak}"
export OPEN_DOUGH_BOOTSTRAP_LEAK="${leak}"

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
output=$(bash "${snapshot}/src/install/open-dough-release.sh" apply \
  --url "${fixture}" --target "${target}" --platform cursor \
  --checkout "${snapshot}")
[[ "${output}" == *"Source: ${fixture}"* ]]
[[ "${output}" == *"Release: v0.1.10 (commit ${commit})"* ]]
[[ "${output}" == *'Outcome: installed 0.1.10.'* ]]
assert_payload "${target}/.cursor/skills/dough-update" 0.1.10 payload-0.1.10
assert_sentinels "${target}"
[[ ! -s "${leak}" ]]

pinned_commit=${commit}

# Direct installation follows the public guide after a separate inspection.
# The fixture knows the peeled commit; native runs prove agent tag selection.
install_inspected_release() (
  set -euo pipefail
  target_project=$1
  install_dir=$2
  selected_tag=v0.1.10
  selected_version=0.1.10
  selected_commit=${commit}
  source_url="file://${fixture}"
  platform=cursor
  snapshot="${install_dir}/release"
  mkdir -p -- "${install_dir}"
  trap 'rm -rf -- "${install_dir}"' EXIT
  git init --quiet "${snapshot}"
  git -C "${snapshot}" fetch --quiet --depth 1 "${source_url}" "${selected_commit}"
  git -C "${snapshot}" -c advice.detachedHead=false checkout --quiet --detach FETCH_HEAD
  head=$(git -C "${snapshot}" rev-parse HEAD)
  [[ "${head}" == "${selected_commit}" ]]
  for inspected_file in install.sh src/install/open-dough-release.sh \
    src/install/open-dough-platform.sh src/install/open-dough-release-version.sh \
    src/install/open-dough-release-resolve.sh src/skills/dough-update/SKILL.md \
    src/skills/dough-adr-awareness/SKILL.md src/skills/dough-adr-awareness/RECOGNITION.md; do
    cat "${snapshot}/${inspected_file}" > /dev/null
    printf '%s\n' "${inspected_file}" >> "${install_dir}.inspection"
  done

  if [[ ${3:-} == stale ]]; then
    # A valid higher release appears only after the old snapshot was inspected.
    write_candidate_payload "${fixture}" 0.1.11 payload-0.1.11
    commit_all "${fixture}" 'release 0.1.11 after inspection'
    tag_release "${fixture}" 0.1.11 '2026-09-06T12:00:00'
    bash "${source_dir}/src/install/open-dough-release.sh" validate-checkout "${fixture}" > /dev/null
    # Keep pre-cleanup HEAD and tracked-byte evidence outside the owned child.
    trap 'git -C "${snapshot}" rev-parse HEAD > "${install_dir}.head";
      git -C "${snapshot}" diff --exit-code HEAD > "${install_dir}.diff";
      rm -rf -- "${install_dir}"' EXIT
  fi

  # Exact post-inspection resolve/compare/validate/direct-install sequence.
  resolved=$(bash "${snapshot}/src/install/open-dough-release.sh" resolve-url "${source_url}")
  IFS=$'\t' read -r tag commit version <<< "${resolved}"
  head=$(git -C "${snapshot}" rev-parse HEAD)
  if [[ "${tag}" != "${selected_tag}" || "${commit}" != "${selected_commit}" ||
    "${version}" != "${selected_version}" || "${head}" != "${selected_commit}" ]]; then
    echo 'Release selection changed after inspection; not replacing inspected files or installing.' >&2
    exit 1
  fi
  source_version=$(bash "${snapshot}/src/install/open-dough-release.sh" validate-checkout "${snapshot}")
  if [[ "${source_version}" != "${selected_version}" ]]; then
    echo 'Pinned source version does not match the selected release; refusing installation.' >&2
    exit 1
  fi
  bash "${snapshot}/install.sh" --target "${target_project}" --platform "${platform}"

  for managed_file in dough-update/SKILL.md dough-adr-awareness/SKILL.md \
    dough-adr-awareness/RECOGNITION.md; do
    cmp "${snapshot}/src/skills/${managed_file}" "${target_project}/.cursor/skills/${managed_file}"
  done
  cmp "${snapshot}/VERSION" "${target_project}/.cursor/skills/dough-update/VERSION"
)

direct_target="${temporary_dir}/direct project"
prepare_target "${direct_target}"
direct_checkout="${temporary_dir}/direct checkout"
output=$(install_inspected_release "${direct_target}" "${direct_checkout}")
[[ "${output}" == *'Recorded version 0.1.10.'* ]]
[[ ! -e "${direct_checkout}" && -d "${temporary_dir}" ]]
inspection_count=$(wc -l < "${direct_checkout}.inspection")
[[ "${inspection_count}" -eq 8 ]]
assert_payload "${direct_target}/.cursor/skills/dough-update" 0.1.10 payload-0.1.10
assert_sentinels "${direct_target}"
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

stale_target="${temporary_dir}/stale project"
prepare_target "${stale_target}"
cp -R -- "${stale_target}" "${temporary_dir}/stale before"
stale_checkout="${temporary_dir}/stale checkout"
trace="${temporary_dir}/stale.trace"
: > "${trace}"
: > "${leak}"
export OPEN_DOUGH_TRACE="${trace}"
# Capture failure without disabling errexit inside the workflow via an if-call.
set +e
output=$(install_inspected_release "${stale_target}" "${stale_checkout}" stale 2>&1)
stale_status=$?
set -e
[[ "${stale_status}" -ne 0 ]]
[[ "${output}" == *'Release selection changed after inspection; not replacing inspected files or installing.'* ]]
[[ "${output}" != *'Installed Open Dough'* && "${output}" != *'Recorded version'* ]]
[[ ! -s "${trace}" && ! -s "${leak}" ]]
diff -r "${temporary_dir}/stale before" "${stale_target}"
assert_sentinels "${stale_target}"
head_before_cleanup=$(cat "${stale_checkout}.head")
[[ "${head_before_cleanup}" == "${pinned_commit}" ]]
[[ ! -s "${stale_checkout}.diff" ]]
[[ ! -e "${stale_checkout}" && -d "${temporary_dir}" ]]

echo "PASS: git bootstrap executes only the inspected pinned release; default-branch helper never runs on that path; apply --checkout does not replace inspected files; direct install cleans its checkout and refuses a valid newer selection without writes or repinning."
