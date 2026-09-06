#!/usr/bin/env bash
set -euo pipefail

source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)
alternate_fixture="${source_dir}/tests/fixtures/adr-awareness/alternate-layout"
improvement='When authoritative status sources disagree, enumerate each conflicting repository-relative source and the value it reports before asking a human to resolve precedence.'
managed_files=(
  dough-update/SKILL.md
  dough-adr-awareness/SKILL.md
  dough-adr-awareness/RECOGNITION.md
)

grep -Fq 'The catalog and each record' "${alternate_fixture}/AGENTS.md"
grep -Fq '| [ARC-12]' \
  "${alternate_fixture}/architecture/decisions/CATALOG.md"
grep -Fq 'Standing: Adopted' \
  "${alternate_fixture}/architecture/decisions/retain-complete-telemetry-history.md"
grep -Fq 'danger-full-access' "$0"
grep -Fq 'PROTECTED_WORKTREES' "$0"

if [[ ${1:-} != '--native' ]]; then
  echo 'PASS: the Codex delivery-to-use fixture covers a previous public skill, a cloneable default-branch improvement, a fresh native invocation, conflicting alternate-layout authorities, recognition support, and coexistence.'
  exit 0
fi

command -v codex > /dev/null

temporary_dir=$(mktemp -d)
trap 'rm -rf -- "${temporary_dir}"' EXIT
physical_temporary_dir=$(cd -- "${temporary_dir}" && pwd -P)
physical_temporary_root=$(cd -- "${temporary_dir}/.." && pwd -P)
codex_state_dir="${physical_temporary_dir}/codex-state"
mkdir -p -- "${codex_state_dir}"
codex_command=$(command -v codex)
codex_executable=$(readlink "${codex_command}")
codex_runtime_root=$(cd -- "$(dirname -- "${codex_executable}")/../../../.." && pwd -P)
native_profile='(version 1)
(allow default)
(deny file-write*)
(allow file-write* (subpath (param "PROOF_ROOT")))
(allow file-write* (subpath (param "TEMP_ROOT")))
(allow file-write* (subpath (param "CODEX_RUNTIME_ROOT")))
(allow file-write* (literal "/dev/null"))
(allow file-write* (literal "/dev/ptmx"))
(allow file-write* (regex #"^/dev/ttys[0-9A-Za-z]+$"))
(deny file-write* (subpath (param "PROTECTED_SKILLS")))
(deny file-write* (subpath (param "PROTECTED_WORKTREES")))
(deny file-write* (subpath (param "PROTECTED_PACKAGES")))
(deny file-write* (subpath (param "PROTECTED_PLUGINS")))
(deny file-write* (literal (param "PROTECTED_CONFIG")))'

fixture_source="${temporary_dir}/fixture-source"
target="${temporary_dir}/atlas adopter"
mkdir -p -- "${fixture_source}/src/skills/dough-update" \
  "${fixture_source}/src/skills/dough-adr-awareness"
cp -R -- "${alternate_fixture}" "${target}"

cp -- "${source_dir}/install.sh" "${fixture_source}/install.sh"
for managed_file in "${managed_files[@]}"; do
  cp -- "${source_dir}/src/skills/${managed_file}" \
    "${fixture_source}/src/skills/${managed_file}"
done

printf '\n%s\n' '## Improved conflict evidence' "${improvement}" >> \
  "${fixture_source}/src/skills/dough-adr-awareness/SKILL.md"
printf '\n%s\n' \
  '- Improvement evidence: names every conflicting repository-relative status authority and its reported value before requesting human precedence.' >> \
  "${fixture_source}/src/skills/dough-adr-awareness/RECOGNITION.md"

git -C "${fixture_source}" init -q --initial-branch=main
git -C "${fixture_source}" add install.sh src
git -C "${fixture_source}" \
  -c user.name='Open Dough fixture' \
  -c user.email='fixture@example.invalid' \
  commit -qm 'fixture: enumerate conflicting ADR status sources'

source_revision=$(git -C "${fixture_source}" rev-parse HEAD)
source_url="file://${fixture_source}"

bash "${source_dir}/install.sh" --target "${target}" --platform codex
if grep -Fq "${improvement}" \
  "${target}/.agents/skills/dough-adr-awareness/SKILL.md"; then
  echo 'FAIL: the baseline installation already contains the fixture improvement.' >&2
  exit 1
fi

mkdir -p -- "${target}/.agents/skills/companion-integration"
printf '%s\n' \
  '---' \
  'name: companion-integration' \
  'description: Existing adopter integration preserved during Open Dough updates.' \
  '---' \
  '' \
  '# Companion integration' \
  '' \
  'Keep this installed integration unchanged.' > \
  "${target}/.agents/skills/companion-integration/SKILL.md"

# Make the catalog and record disagree so the fixture improvement has an
# observable, adopter-specific behavior to demonstrate.
sed -i '' \
  's/| \[ARC-12\](\.\/retain-complete-telemetry-history\.md) | Adopted |/| [ARC-12](.\/retain-complete-telemetry-history.md) | Replaced |/' \
  "${target}/architecture/decisions/CATALOG.md"

git -C "${target}" init -q --initial-branch=main
git -C "${target}" add .
git -C "${target}" \
  -c user.name='Adopter fixture' \
  -c user.email='fixture@example.invalid' \
  commit -qm 'fixture: install previous public guidance'

snapshot() {
  local root=$1
  (
    cd -- "${root}"
    find . -type f ! -path './.git/*' -print0 \
      | LC_ALL=C sort -z \
      | xargs -0 shasum -a 256
  )
}

require_output() {
  local label=$1
  local pattern=$2
  local output_file=$3
  if ! grep -Eiq "${pattern}" "${output_file}"; then
    printf 'FAIL: native Codex output omitted %s.\n' "${label}" >&2
    return 1
  fi
}

run_native_codex() {
  local output_file=$1
  local prompt=$2

  sandbox-exec -D "PROOF_ROOT=${physical_temporary_dir}" \
    -D "TEMP_ROOT=${physical_temporary_root}" \
    -D "CODEX_RUNTIME_ROOT=${codex_runtime_root}" \
    -D "PROTECTED_SKILLS=${codex_runtime_root}/skills" \
    -D "PROTECTED_WORKTREES=${codex_runtime_root}/worktrees" \
    -D "PROTECTED_PACKAGES=${codex_runtime_root}/packages" \
    -D "PROTECTED_PLUGINS=${codex_runtime_root}/plugins" \
    -D "PROTECTED_CONFIG=${codex_runtime_root}/config.toml" \
    -p "${native_profile}" \
    codex exec --ephemeral --ignore-user-config \
    -c "sqlite_home=\"${codex_state_dir}\"" \
    -c "log_dir=\"${codex_state_dir}\"" --skip-git-repo-check \
    --sandbox danger-full-access -C "${target}" \
    -o "${output_file}" "${prompt}"
}

source_before=$(snapshot "${fixture_source}")
companion_before=$(shasum -a 256 \
  "${target}/.agents/skills/companion-integration/SKILL.md")
update_output="${temporary_dir}/codex-update-output.md"

run_native_codex "${update_output}" \
  "Use \$dough-update ${source_url} to update this adopter from the supplied cloneable fixture source. Follow the installed updater exactly. Report the source, commit, Codex as the running tool, every installed path, and that this selects the fixture's current default branch rather than a release or installed version. Do not invoke ADR awareness yet."

source_after=$(snapshot "${fixture_source}")
fixture_source_status=$(git -C "${fixture_source}" status --porcelain)
[[ "${source_before}" == "${source_after}" ]]
[[ -z "${fixture_source_status}" ]]
for managed_file in "${managed_files[@]}"; do
  cmp "${fixture_source}/src/skills/${managed_file}" \
    "${target}/.agents/skills/${managed_file}"
done
grep -Fq "${improvement}" \
  "${target}/.agents/skills/dough-adr-awareness/SKILL.md"
companion_after=$(shasum -a 256 \
  "${target}/.agents/skills/companion-integration/SKILL.md")
[[ "${companion_before}" == "${companion_after}" ]]
[[ ! -e "${target}/.agents/skills/adr-awareness" ]]

actual_changes=$(git -C "${target}" diff --name-only | LC_ALL=C sort)
expected_changes=$(printf '%s\n' \
  '.agents/skills/dough-adr-awareness/RECOGNITION.md' \
  '.agents/skills/dough-adr-awareness/SKILL.md' | LC_ALL=C sort)
[[ "${actual_changes}" == "${expected_changes}" ]]

grep -Fq "${source_url}" "${update_output}"
grep -Fq "${source_revision}" "${update_output}"
grep -Fqi 'Codex' "${update_output}"
grep -Eiq 'default branch|default-branch' "${update_output}"
grep -Eiq 'not .*release|rather than a release|not .*version' "${update_output}"
for managed_file in "${managed_files[@]}"; do
  grep -Fq ".agents/skills/${managed_file}" "${update_output}"
done

use_before=$(snapshot "${target}")
use_output="${temporary_dir}/codex-use-output.md"
run_native_codex "${use_output}" \
  "Use \$dough-adr-awareness for an explicit ADR check. Begin with Invocation: \$dough-adr-awareness. Assess whether work may switch telemetry history to per-node files. The catalog and ARC-12 record now disagree: demonstrate the installed improvement by naming each conflicting repository-relative authority and the value it reports before asking who owns precedence. Report whether you changed any decision or implementation. Use only this adopter repository and keep the response concise."
use_after=$(snapshot "${target}")
dollar='$'

if [[ "${use_before}" != "${use_after}" ]]; then
  echo 'FAIL: native Codex changed adopter files during ADR use.' >&2
  exit 1
fi
require_output 'the explicit skill invocation' \
  "Invocation: \\${dollar}dough-adr-awareness" "${use_output}"
require_output 'the catalog authority' \
  'architecture/decisions/CATALOG\.md' "${use_output}"
require_output 'the ARC-12 record authority' \
  'architecture/decisions/retain-complete-telemetry-history\.md' "${use_output}"
require_output 'the Replaced catalog value' 'Replaced' "${use_output}"
require_output 'the Adopted record value' 'Adopted' "${use_output}"
require_output 'conflict recognition' 'conflict|disagree|ambigu' "${use_output}"
require_output 'a stop pending resolution' \
  'stop|stopped|blocked|did not proceed|cannot proceed|cannot yet be assessed|remains incomplete|until .*resolved' \
  "${use_output}"
require_output 'human-owned precedence resolution' \
  'human|you.*(choose|resolve)|owns?.*precedence' "${use_output}"
require_output 'the no-change report' \
  'no .*changed|did not (change|modify)|changed (neither|no)' "${use_output}"
if grep -Fq '## ADR CHECK COMPLETE' "${use_output}"; then
  echo 'FAIL: Codex claimed completion despite unresolved status authority.' >&2
  exit 1
fi
if grep -Eiq 'docs/adrs|doughnut' "${use_output}"; then
  echo 'FAIL: native use fell back to the source-project layout or identity.' >&2
  exit 1
fi

recognition_digest=$(shasum -a 256 \
  "${target}/.agents/skills/dough-adr-awareness/RECOGNITION.md" \
  | cut -d ' ' -f 1)
companion_digest=$(printf '%s' "${companion_before}" | cut -d ' ' -f 1)

printf '%s\n' '--- CODEX INSTALLED-IMPROVEMENT UPDATE PROOF ---'
cat "${update_output}"
printf '\n%s\n' '--- CODEX INSTALLED-IMPROVEMENT USE PROOF ---'
cat "${use_output}"
printf '\n%s\n' '--- CODEX DELIVERY-TO-USE INTEGRITY PROOF ---'
printf 'fixture source: %s\n' "${source_url}"
printf 'fixture default-branch commit: %s\n' "${source_revision}"
printf 'installed recognition SHA-256: %s\n' "${recognition_digest}"
printf 'preserved companion SHA-256: %s\n' "${companion_digest}"
printf '%s\n' \
  'PASS: fresh native Codex discovered and invoked only the installed dough-adr-awareness replacement; no original adr-awareness skill was present.'
printf '%s\n' \
  'PASS: Codex enumerated both conflicting alternate-layout status authorities and their Adopted/Replaced values, stopped for human precedence, and changed no adopter files.'
printf '%s\n' \
  'PASS: the recognition record byte-matches the improved default-branch source, and the companion integration remained byte-identical.'
