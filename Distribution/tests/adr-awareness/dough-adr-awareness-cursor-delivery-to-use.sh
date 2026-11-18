#!/usr/bin/env bash
# shellcheck disable=SC1091,SC2034,SC2154,SC2312 # Shared fixture helpers supply and consume globals.
set -euo pipefail

source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/../../.." && pwd)
source "${source_dir}/Distribution/evaluation/cases/adr-awareness/dough-adr-awareness-delivery-to-use.sh"
source "${source_dir}/Distribution/tests/support/adr-awareness-delivery-checks.sh"

delivery_source_dir=${source_dir}
delivery_fixture="${source_dir}/Distribution/evaluation/cases/adr-awareness/fixtures/alternate-layout"
delivery_host_name='Cursor'
delivery_host_upper='CURSOR'
delivery_platform='cursor'
delivery_skill_root='.agents/skills'

delivery_check_fixture
delivery_run_deterministic_transition
