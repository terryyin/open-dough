#!/usr/bin/env bash
# Reusable source fixtures and their native preflight.
# shellcheck disable=SC2034,SC2154 # Callers consume fixture and candidate.

adr_awareness_alternate_layout_fixture() {
  fixture="${source_dir}/Distribution/evaluation/cases/adr-awareness/fixtures/alternate-layout"
  candidate="${source_dir}/Distribution/src/skills/dough-adr-awareness/SKILL.md"

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
}

adr_awareness_source_context_fixture() {
  fixture="${source_dir}/Distribution/evaluation/cases/adr-awareness/fixtures/source-context"
  candidate="${source_dir}/Distribution/src/skills/dough-adr-awareness/SKILL.md"

  required_fixture_files=(
    AGENTS.md
    docs/adrs/README.md
    docs/adrs/0001-redis-session-state-accepted.md
    docs/adrs/0002-postgresql-session-state-accepted.md
    app/session-store.txt
  )

  for relative_path in "${required_fixture_files[@]}"; do
    [[ -f "${fixture}/${relative_path}" ]]
  done
  [[ -f "${candidate}" ]]
}
