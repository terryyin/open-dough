#!/usr/bin/env bash
set -euo pipefail

source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)
fixture_root="${source_dir}/tests/fixtures/extract-guidance/unresolved-rule-project"
source_rule="${fixture_root}/.cursor/rules/release-evidence-gate.mdc"
extractor="${source_dir}/.agents/skills/extract-guidance/SKILL.md"

[[ -f "${source_rule}" ]]
[[ ! -e "${fixture_root}/policy/release-evidence.yml" ]]

grep -Fq 'alwaysApply: true' "${source_rule}"
grep -Fq 'Apply this rule automatically' "${source_rule}"
grep -Fq 'policy/release-evidence.yml' "${source_rule}"
grep -Fq 'leave suitability unresolved' "${source_rule}"
grep -Fq 'weaken automatic application into' "${source_rule}"

grep -Fq 'write only' "${extractor}"
grep -Fq 'ASSESSMENT.md' "${extractor}"
grep -Fq 'Do not create' "${extractor}"
grep -Fq 'SKILL.md' "${extractor}"
grep -Fq 'distinct delivery gap even when missing required context' "${extractor}"
grep -Fq 'suitability unresolved — no candidate produced' "${extractor}"

[[ ! -e "${source_dir}/src/skills/dough-release-evidence-gate" ]]

echo "PASS: unresolved extraction fixture combines automatic rule application with deliberately missing required policy context and has no installable public candidate."
