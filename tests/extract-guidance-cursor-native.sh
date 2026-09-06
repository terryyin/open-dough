#!/usr/bin/env bash
set -euo pipefail

source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)
extractor="${source_dir}/.agents/skills/extract-guidance/SKILL.md"
context_fixture="${source_dir}/tests/fixtures/adr-awareness/source-context"

[[ -f "${extractor}" ]]
[[ -f "${context_fixture}/AGENTS.md" ]]
[[ -f "${context_fixture}/docs/adrs/README.md" ]]
grep -Fq 'one source skill or rule per invocation' "${extractor}"
grep -Fq 'draft — unverified substitute' "${extractor}"
grep -Fq 'do not add it or its support files to the public installer' \
  "${extractor}"

if [[ ${1:-} != '--native' ]]; then
  echo 'PASS: the Cursor extraction proof uses the canonical internal extractor, controlled ADR context, honest draft status, source-integrity checks, and no public installation.'
  exit 0
fi

original=${ADR_AWARENESS_ORIGINAL_SKILL:-}
if [[ -z ${original} ]]; then
  echo 'ADR_AWARENESS_ORIGINAL_SKILL must name the supplied source skill for --native.' >&2
  exit 2
fi

[[ -f "${original}" ]]
command -v cursor > /dev/null

temporary_dir=$(mktemp -d)
trap 'rm -rf -- "${temporary_dir}"' EXIT

session_root="${temporary_dir}/open-dough-cursor"
source_project="${session_root}/inputs/source-project"
output_dir="${session_root}/.planning/extracted-guidance/dough-adr-awareness"
existing_skill="${session_root}/.cursor/skills/existing-cursor/SKILL.md"

mkdir -p -- "${session_root}/.agents/skills/extract-guidance" \
  "${session_root}/.cursor/skills/existing-cursor" \
  "${source_project}/.agents/skills/adr-awareness"
cp -- "${extractor}" \
  "${session_root}/.agents/skills/extract-guidance/SKILL.md"
cp -R -- "${context_fixture}/." "${source_project}/"
cp -- "${original}" \
  "${source_project}/.agents/skills/adr-awareness/SKILL.md"

cat > "${existing_skill}" << 'EOF'
---
name: existing-cursor
description: Preserve this unrelated Cursor guidance during extraction.
---

# Existing Cursor guidance

Keep this file byte-identical.
EOF

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

source_before=$(snapshot "${source_project}")
extractor_before=$(shasum -a 256 "${extractor}")
original_before=$(shasum -a 256 "${original}")
existing_before=$(shasum -a 256 "${existing_skill}")

output_file="${temporary_dir}/cursor-output.md"
prompt="Use \$extract-guidance for exactly one supplied source. The source is inputs/source-project/.agents/skills/adr-awareness/SKILL.md and the output directory is .planning/extracted-guidance/dough-adr-awareness/. Inspect only directly referenced context under inputs/source-project that is needed to understand the behavior. Produce the reusable candidate and recognition record if the source is suitable; otherwise produce the skill-required unresolved assessment. Do not modify inputs/source-project, the internal extractor, the existing-cursor skill, or anything under src/. In your final response, explicitly state the invoked skill name, output paths, suitability status, generalized adopter context, and source-integrity result."

(
  cd -- "${session_root}"
  cursor agent --print --force --trust --sandbox enabled \
    --workspace "${session_root}" "${prompt}"
) > "${output_file}"

source_after=$(snapshot "${source_project}")
extractor_after=$(shasum -a 256 "${extractor}")
original_after=$(shasum -a 256 "${original}")
existing_after=$(shasum -a 256 "${existing_skill}")

[[ "${source_before}" == "${source_after}" ]]
[[ "${extractor_before}" == "${extractor_after}" ]]
[[ "${original_before}" == "${original_after}" ]]
[[ "${existing_before}" == "${existing_after}" ]]

candidate="${output_dir}/SKILL.md"
recognition="${output_dir}/RECOGNITION.md"
[[ -f "${candidate}" ]]
[[ -f "${recognition}" ]]
[[ ! -e "${output_dir}/ASSESSMENT.md" ]]
[[ ! -e "${session_root}/src" ]]
[[ ! -e "${session_root}/.cursor/skills/dough-adr-awareness" ]]
[[ ! -e "${session_root}/.agents/skills/dough-adr-awareness" ]]

grep -Fq 'name: dough-adr-awareness' "${candidate}"
grep -Eiq 'Accepted|current decision' "${candidate}"
grep -Eiq 'supersed' "${candidate}"
grep -Eiq 'conflict|incompatib' "${candidate}"
grep -Eiq 'human' "${candidate}"
grep -Eiq 'adopter|project.*context|context.*project' "${candidate}"
if grep -Eiq '/Users/|terryyin|Doughnut' "${candidate}"; then
  echo 'FAIL: the generated candidate retained source-project identity.' >&2
  exit 1
fi

grep -Fq '# Recognition: dough-adr-awareness' "${recognition}"
grep -Fq 'Status: draft — unverified substitute' "${recognition}"
for heading in \
  '## Original clues' \
  '## Purpose' \
  '## Triggers' \
  '## Distinguishing behavior' \
  '## Adopter-provided context' \
  '## Differences that rule out replacement' \
  '## Validation needed'; do
  grep -Fq "${heading}" "${recognition}"
done

grep -Fq 'extract-guidance' "${output_file}"
grep -Eiq 'draft.*unverified|unverified.*draft' "${output_file}"
grep -Eiq 'unchanged|checksum.*match|integrity.*(pass|preserv)' "${output_file}"
grep -Fq '.planning/extracted-guidance/dough-adr-awareness/SKILL.md' \
  "${output_file}"
grep -Fq '.planning/extracted-guidance/dough-adr-awareness/RECOGNITION.md' \
  "${output_file}"

source_digest=$(printf '%s' "${source_before}" | shasum -a 256 | cut -d ' ' -f 1)
candidate_digest=$(shasum -a 256 "${candidate}" "${recognition}" \
  | shasum -a 256 | cut -d ' ' -f 1)

printf '%s\n' '--- CURSOR EXTRACTION PROOF ---'
cat "${output_file}"
printf '\n%s\n' '--- CURSOR EXTRACTION INTEGRITY PROOF ---'
printf 'source-project tree digest: %s\n' "${source_digest}"
printf 'candidate-and-recognition digest: %s\n' "${candidate_digest}"
printf '%s\n' \
  'PASS: fresh Cursor discovered and invoked the canonical .agents extract-guidance skill, produced the actual draft candidate and recognition record, preserved the supplied source and existing Cursor guidance, and installed no public skill.'
