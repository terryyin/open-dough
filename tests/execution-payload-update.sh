#!/usr/bin/env bash
# shellcheck disable=SC1091,SC2154 # Sourced fixtures supply helpers and managed_files.
set -euo pipefail
source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)
source "${source_dir}/tests/helpers/public-payload-fixture.bash"
source "${source_dir}/tests/helpers/release-fixture.bash"
source "${source_dir}/tests/helpers/host-hooks-fixture.bash"
temporary_dir=$(mktemp -d)
trap 'rm -rf -- "${temporary_dir}"' EXIT
fixture="${temporary_dir}/source"
mkdir -p -- "${fixture}"
git -C "${fixture}" init --quiet -b main
git_identity "${fixture}"
write_candidate_payload "${fixture}" 0.1.1 before-execution
for script in install.sh src/install/open-dough-release-version.sh; do
  sed '/dough-execute-plan\//d; /dough-post-change-refactor\//d' "${fixture}/${script}" > "${fixture}/filtered"
  mv -- "${fixture}/filtered" "${fixture}/${script}"
done
rm -rf -- "${fixture}/src/skills/dough-execute-plan" "${fixture}/src/skills/dough-post-change-refactor"
commit_all "${fixture}" 'release before execution skills'
tag_release "${fixture}" 0.1.1 '2026-09-01T00:00:00'
older="${temporary_dir}/older"
checkout_tagged_release "${fixture}" "${older}" 0.1.1
write_candidate_payload "${fixture}" 0.1.2 with-execution
commit_all "${fixture}" 'release execution skills and runtime dependencies'
tag_release "${fixture}" 0.1.2 '2026-09-02T00:00:00'
target="${temporary_dir}/client project"
prepare_target "${target}"
seed_empty_host_settings "${target}"
bash "${older}/install.sh" --target "${target}" --source "${fixture}" > /dev/null
helper="${source_dir}/src/install/open-dough-release.sh"
collision="${target}/.claude/skills/dough-execute-plan/scripts/ci-mailbox.mjs"
mkdir -p -- "${collision%/*}"
printf '%s\n' 'local script' > "${collision}"
before=$(snapshot_path_state "${target}")
if bash "${helper}" apply --target "${target}" > /dev/null 2>&1; then
  echo 'FAIL: execution dependency collision was overwritten.' >&2
  exit 1
fi
after=$(snapshot_path_state "${target}")
[[ "${before}" == "${after}" ]]
rm -- "${collision}"
bash "${helper}" apply --target "${target}" > /dev/null
for root in .agents/skills .claude/skills; do
  assert_payload "${target}/${root}/dough-update" 0.1.2 with-execution
  for skill in dough-execute-plan dough-post-change-refactor; do
    for maintenance in RECOGNITION.md EXTRACTION.md SOURCE-CHECKSUMS.json; do
      [[ ! -e "${target}/${root}/${skill}/${maintenance}" ]]
    done
  done
  # Exercise the installed runtime entrypoint in the platform layout.
  canonical_root=$(cd "${target}/${root}/dough-execute-plan" && pwd -P)
  receipt=$(DOUGH_CI_MAILBOX_ROOT="${temporary_dir}/mailboxes" node "${canonical_root}/scripts/ci-mailbox.mjs" probe)
  [[ "${receipt}" == 'CI_OBSERVER '* ]]
done
for dependency in dough-execute-plan/scripts/ci-mailbox.mjs \
  dough-execute-plan/assets/claude-hooks.json \
  dough-post-change-refactor/references/refactor-checks.md; do
  path="${target}/.claude/skills/${dependency}"
  printf '\nlocal edit\n' >> "${path}"
  before=$(snapshot_path_state "${target}")
  if bash "${helper}" apply --target "${target}" > /dev/null 2>&1; then
    echo 'FAIL: ordinary update accepted an edited execution dependency.' >&2
    exit 1
  fi
  after=$(snapshot_path_state "${target}")
  [[ "${before}" == "${after}" ]]
  bash "${helper}" apply --target "${target}" --force > /dev/null
done
assert_managed_host_hooks "${target}"
assert_sentinels "${target}"
echo 'PASS: execution payload upgrades both roots, runs relocated entrypoints, protects runtime collisions/edits, restores by force, preserves unrelated host settings, and registers managed hook entries.'
