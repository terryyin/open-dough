#!/usr/bin/env bash
# shellcheck disable=SC1091,SC2034,SC2154,SC2312 # Shared fixture helpers supply and consume globals.
set -euo pipefail

source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/../../.." && pwd)
source "${source_dir}/Distribution/evaluation/cases/adr-awareness/adr-awareness-fixtures.sh"
adr_awareness_alternate_layout_fixture

grep -Fq 'Adopted' "${fixture}/AGENTS.md"
grep -Fq 'is a current accepted decision' "${fixture}/AGENTS.md"
grep -Fq 'Replaced by [ARC-12]' \
  "${fixture}/architecture/decisions/CATALOG.md"
grep -Fq 'Standing: Adopted' \
  "${fixture}/architecture/decisions/retain-complete-telemetry-history.md"
grep -Fq 'Do not assume a template, ADR path, status syntax, or exception trail' \
  "${candidate}"
grep -Fq 'conflicts with a relevant current Accepted' "${candidate}"
grep -Fq 'stop the conflicting implementation' "${candidate}"
grep -Fq 'ask the human to choose' "${candidate}"
