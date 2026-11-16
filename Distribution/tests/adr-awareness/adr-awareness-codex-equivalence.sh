#!/usr/bin/env bash
# shellcheck disable=SC1091,SC2034,SC2154,SC2312 # Shared fixture helpers supply and consume globals.
set -euo pipefail

source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/../../.." && pwd)
source "${source_dir}/Distribution/evaluation/cases/adr-awareness/adr-awareness-fixtures.sh"
adr_awareness_source_context_fixture

grep -Fq 'Superseded by [ADR-0002]' \
  "${fixture}/docs/adrs/0001-redis-session-state-accepted.md"
grep -Fq '**Status:** Accepted' \
  "${fixture}/docs/adrs/0002-postgresql-session-state-accepted.md"
grep -Fq 'Persist server-side session state in PostgreSQL.' \
  "${fixture}/docs/adrs/0002-postgresql-session-state-accepted.md"
grep -Fq 'Only humans change lifecycle' \
  "${fixture}/docs/adrs/README.md"

grep -Fq 'follow the chain to the newest valid current record' "${candidate}"
grep -Fq 'stop the conflicting implementation' "${candidate}"
grep -Fq 'Do not change an ADR to Accepted, Rejected, or Superseded' "${candidate}"
