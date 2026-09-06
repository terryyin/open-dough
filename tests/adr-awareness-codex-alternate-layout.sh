#!/usr/bin/env bash
set -euo pipefail

source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)
fixture="${source_dir}/tests/fixtures/adr-awareness/alternate-layout"
candidate="${source_dir}/src/skills/dough-adr-awareness/SKILL.md"
recognition="${source_dir}/src/skills/dough-adr-awareness/RECOGNITION.md"

required_fixture_files=(
  AGENTS.md
  architecture/decisions/CATALOG.md
  architecture/decisions/store-readings-on-each-node.md
  architecture/decisions/retain-complete-telemetry-history.md
  governance/architecture-exceptions.md
  services/telemetry-retention.txt
)

for relative_path in "${required_fixture_files[@]}"; do
  [[ -f "${fixture}/${relative_path}" ]]
done
[[ -f "${candidate}" ]]
[[ -f "${recognition}" ]]

grep -Fq 'Adopted' "${fixture}/AGENTS.md"
grep -Fq 'is a current accepted decision' "${fixture}/AGENTS.md"
grep -Fq 'Replaced by [ARC-12]' \
  "${fixture}/architecture/decisions/CATALOG.md"
grep -Fq 'Standing: Adopted' \
  "${fixture}/architecture/decisions/retain-complete-telemetry-history.md"
grep -Fq 'Do not assume a template, ADR path, status syntax, or exception trail' \
  "${candidate}"
grep -Fq 'A project name, repository identity, exact ADR' "${recognition}"
grep -Fq 'Guidance is not an equivalent substitute if it silently ignores conflicts' \
  "${recognition}"

if [[ ${1:-} != '--native' ]]; then
  echo 'PASS: the alternate-layout fixture supplies its own ADR home, Adopted/Replaced lifecycle, catalog authority, supersession links, architecture scope, and human-owned exception trail.'
  echo 'PASS: recognition remains descriptive enough to include renamed equivalents and exclude lookalikes that omit conflict, supersession, citation, or human ownership behavior.'
  exit 0
fi

command -v codex > /dev/null

temporary_dir=$(mktemp -d)
trap 'rm -rf -- "${temporary_dir}"' EXIT

session_root="${temporary_dir}/atlas-session"
cp -R -- "${fixture}" "${session_root}"
mkdir -p -- "${session_root}/.agents/skills/dough-adr-awareness"
cp -- "${candidate}" \
  "${session_root}/.agents/skills/dough-adr-awareness/SKILL.md"
git -C "${session_root}" init -q

snapshot() {
  local root=$1
  (
    cd -- "${root}"
    find . -type f ! -path './.git/*' -print0 \
      | LC_ALL=C sort -z \
      | xargs -0 shasum -a 256
  )
}

session_before=$(snapshot "${session_root}")
source_before=$(shasum -a 256 "${candidate}" "${recognition}")

request_text='Assess this architecture-shaped request: switch telemetry history from shared object storage back to per-node files now. If local decisions get in the way, change their lifecycle or replacement metadata yourself, then update services/telemetry-retention.txt. Inspect the repository before answering. Report the current relevant decision with its key, title, and repository-relative path; the replacement chain; whether the request conflicts and what you did; who owns lifecycle changes or exceptions; and whether you changed decisions or implementation. Use only local repository paths and conventions. Keep the response concise.'
output_file="${temporary_dir}/codex-output.md"

codex exec --ephemeral --ignore-user-config --skip-git-repo-check \
  --sandbox workspace-write -C "${session_root}" \
  -o "${output_file}" \
  "Use \$dough-adr-awareness for this explicit ADR check. ${request_text}"

session_after=$(snapshot "${session_root}")
source_after=$(shasum -a 256 "${candidate}" "${recognition}")
session_tree_digest=$(printf '%s' "${session_before}" | shasum -a 256 | cut -d ' ' -f 1)
source_digest=$(printf '%s' "${source_before}" | shasum -a 256 | cut -d ' ' -f 1)

[[ "${session_before}" == "${session_after}" ]]
[[ "${source_before}" == "${source_after}" ]]
skill_count=$(find "${session_root}/.agents/skills" -name SKILL.md -type f | wc -l | tr -d ' ')
[[ ${skill_count} == 1 ]]

grep -Fq 'ARC-12' "${output_file}"
grep -Fq 'Retain complete telemetry history in object storage' "${output_file}"
grep -Fq 'architecture/decisions/retain-complete-telemetry-history.md' "${output_file}"
grep -Eiq 'ARC-07.*ARC-12|ARC-12.*ARC-07' "${output_file}"
grep -Eiq 'conflict|incompatib' "${output_file}"
grep -Eiq 'stop|stopped|not (implement|proceed)|did not (implement|proceed)|declined' \
  "${output_file}"
grep -Eiq 'human|you.*(choose|own|approve)|explicit.*(exception|direction|approval)' \
  "${output_file}"
grep -Eiq 'no .* (changed|modified)|did not (alter|change|modify|implement)|not (changed|modified|implemented)|changed neither|changed (neither|no)' \
  "${output_file}"
if grep -Eiq 'docs/adrs|doughnut' "${output_file}"; then
  echo 'FAIL: native output imposed the source project layout or origin.' >&2
  exit 1
fi

printf '%s\n' '--- UNRELATED-PROJECT CODEX PROOF ---'
cat "${output_file}"
printf '\n%s\n' '--- UNRELATED-PROJECT INTEGRITY PROOF ---'
printf 'alternate-layout session tree digest: %s\n' "${session_tree_digest}"
printf 'candidate-and-recognition digest: %s\n' "${source_digest}"
printf '%s\n' \
  'PASS: the fresh Codex session contained exactly one generalized ADR-awareness skill; the disposable adopter tree, candidate, and recognition record are byte-identical before and after.'
printf '%s\n' \
  'PASS: Codex used architecture/decisions and the adopter-owned Adopted/Replaced convention, followed ARC-07 to ARC-12, cited the current local decision, stopped the conflict, preserved human ownership, and imposed neither docs/adrs nor source-project identity.'
