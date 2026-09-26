#!/usr/bin/env bash
# shellcheck disable=SC1091,SC2154,SC2312 # Sourced fixtures supply helpers and managed_files.
set -euo pipefail
source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)
source "${source_dir}/tests/helpers/public-payload-fixture.bash"
source "${source_dir}/tests/helpers/release-fixture.bash"
source "${source_dir}/tests/helpers/host-hooks-fixture.bash"
source "${source_dir}/tests/helpers/publication-update-proof.bash"
temporary_dir=$(mktemp -d)
trap 'rm -rf -- "${temporary_dir}"' EXIT
source "${source_dir}/tests/helpers/installed-wait-entrypoint-fixture.bash"
fixture="${temporary_dir}/source"
older="${temporary_dir}/older"
build_upgrade_releases "${fixture}" "${older}" before-execution with-execution \
  --withhold dough-execute-plan/ --withhold dough-post-change-refactor/ \
  --remove dough-execute-plan --remove dough-post-change-refactor
newer="${temporary_dir}/newer"
checkout_tagged_release "${fixture}" "${newer}" 0.1.2
helper="${source_dir}/src/install/open-dough-release.sh"
fixture_source=$(cd -- "${fixture}" && pwd -P)

install_older_verified() {
  local target=$1
  prepare_target "${target}"
  write_project_configuration "${target}"
  bash "${older}/install.sh" --target "${target}" --source "${fixture}" > /dev/null
  for root in .agents/skills .claude/skills; do
    contents=$(cat "${target}/${root}/dough-update/VERSION")
    [[ "${contents}" == '0.1.1' ]]
    contents=$(cat "${target}/${root}/dough-update/SOURCE")
    [[ "${contents}" == "${fixture_source}" ]]
    [[ ! -e "${target}/${root}/dough-execute-plan" ]]
  done
}

assert_upgraded_execution_payload() {
  local target=$1
  local root canonical_root
  for root in .agents/skills .claude/skills; do
    assert_payload "${target}/${root}/dough-update" 0.1.2 with-execution
    # Exercise the installed runtime entrypoint in the platform layout.
    canonical_root=$(cd "${target}/${root}/dough-execute-plan" && pwd -P)
    receipt=$(DOUGH_CI_MAILBOX_ROOT="${temporary_dir}/mailboxes" node "${canonical_root}/scripts/ci-mailbox.mjs" probe)
    [[ "${receipt}" == 'CI_OBSERVER '* ]]
    manual="${canonical_root}/manuals/custom-ci.md"
    [[ -f "${manual}" ]]
    grep -Fq 'runnable-custom-ci-adapter:start' "${manual}"
    assert_installed_publication_modules "${target}/${root}"
  done
  assert_managed_host_hooks "${target}" "${newer}"
  assert_sentinels "${target}"
  assert_project_configuration "${target}"
}

# Ordinary no-URL update from remembered SOURCE: no registered hooks → register.
target="${temporary_dir}/client project"
install_older_verified "${target}"
seed_mergeable_host_settings "${target}"
bash "${helper}" apply --target "${target}" > /dev/null
assert_upgraded_execution_payload "${target}"
assert_unrelated_preserved "${target}"

# The standalone manual is human-discoverable without becoming runtime guidance,
# and its extracted example speaks the installed adapter contract.
manual="${target}/.agents/skills/dough-execute-plan/manuals/custom-ci.md"
example="${temporary_dir}/dough-ci-example.mjs"
fixture_response="${temporary_dir}/ci-fixture.json"
awk '
  /runnable-custom-ci-adapter:start/ { selected = 1; next }
  /runnable-custom-ci-adapter:end/ { selected = 0 }
  selected && /^```/ { next }
  selected { print }
' "${manual}" > "${example}"
cat > "${fixture_response}" << 'EOF'
{
  "attempts": [{
    "runId": "run/47",
    "attemptId": "attempt:alpha",
    "sha": "0123456789012345678901234567890123456789",
    "outcome": "failure"
  }],
  "diagnostics": [{
    "runId": "run/47",
    "attemptId": "attempt:alpha",
    "log": "setup complete\nERROR expected 2, received 3\ncleanup complete"
  }]
}
EOF
discover=$(printf '%s\n' '{"operation":"discover","check":{"repo":"owner/repo","branch":"feature"}}' \
  | node "${example}" "${fixture_response}")
diagnose=$(printf '%s\n' '{"operation":"diagnose","check":{"repo":"owner/repo","branch":"feature"},"attempt":{"runId":"run/47","attemptId":"attempt:alpha","sha":"0123456789012345678901234567890123456789"}}' \
  | node "${example}" "${fixture_response}")
[[ "${discover}" == *'"runId":"run/47"'* ]]
[[ "${discover}" == *'"attemptId":"attempt:alpha"'* ]]
[[ "${diagnose}" == *'ERROR expected 2, received 3'* ]]
[[ "${diagnose}" != *'setup complete'* ]]
[[ "${diagnose}" != *'cleanup complete'* ]]
node -e 'const fs=require("node:fs"); const path=process.argv[1]; const value=JSON.parse(fs.readFileSync(path)); value.diagnostics[0].log="ERROR "+"é".repeat(10000); fs.writeFileSync(path, JSON.stringify(value))' "${fixture_response}"
diagnose=$(printf '%s\n' '{"operation":"diagnose","check":{"repo":"owner/repo","branch":"feature"},"attempt":{"runId":"run/47","attemptId":"attempt:alpha","sha":"0123456789012345678901234567890123456789"}}' \
  | node "${example}" "${fixture_response}")
node -e 'const value=JSON.parse(process.argv[1]); if (!value.truncated || Buffer.byteLength(value.excerpt) > 16 * 1024) process.exit(1)' "${diagnose}"
grep -Fq '.agents/skills/dough-execute-plan/manuals/custom-ci.md' \
  "${source_dir}/docs/installation-and-updates.md"
if grep -R -Fq 'manuals/custom-ci.md' \
  "${source_dir}/src/skills/dough-execute-plan/SKILL.md" \
  "${source_dir}/src/skills/dough-execute-plan/references"; then
  echo 'FAIL: standalone custom CI manual is linked from runtime guidance.' >&2
  exit 1
fi

# Exact prior manual registration of the new release's tagged fragments is adopted.
manual_target="${temporary_dir}/manual project"
install_older_verified "${manual_target}"
# Use the newer tagged fragments as data (not invented local variants).
seed_exact_manual_registration "${manual_target}" "${newer}"
bash "${helper}" apply --target "${manual_target}" > /dev/null
assert_upgraded_execution_payload "${manual_target}"
assert_unrelated_preserved "${manual_target}"

# Host settings conflict refuses before payload replacement; --force cannot clobber.
assert_update_refuses_host_hook_conflict() {
  local target=$1
  shift
  local before output contents root
  before=$(snapshot_path_state "${target}")
  if output=$(bash "${helper}" apply --target "${target}" "$@" 2>&1); then
    echo 'FAIL: update must refuse a conflicting managed host hook.' >&2
    exit 1
  fi
  [[ "${output}" == *'conflicting-managed-hooks'* ]]
  [[ $(snapshot_path_state "${target}") == "${before}" ]]
  for root in .agents/skills .claude/skills; do
    contents=$(cat "${target}/${root}/dough-update/VERSION")
    [[ "${contents}" == '0.1.1' ]]
    [[ ! -e "${target}/${root}/dough-execute-plan" ]]
  done
  assert_project_configuration "${target}"
}

conflict_target="${temporary_dir}/conflict project"
install_older_verified "${conflict_target}"
seed_edited_managed_timeout "${conflict_target}" "${newer}"
assert_update_refuses_host_hook_conflict "${conflict_target}"
assert_update_refuses_host_hook_conflict "${conflict_target}" --force

# Installed runtime remains complete and can obtain a worker-generated verdict
# after the remembered release source is no longer available.
mv -- "${fixture}" "${temporary_dir}/source-unavailable"
assert_installed_wait_entrypoints "${target}"
