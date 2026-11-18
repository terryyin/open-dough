#!/usr/bin/env bash
# shellcheck disable=SC1091,SC2034,SC2154,SC2312 # Shared fixture helpers supply and consume globals.
set -euo pipefail

source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/../../.." && pwd)
# shellcheck source=Distribution/tests/helpers/public-payload-fixture.bash
source "${source_dir}/Distribution/tests/helpers/public-payload-fixture.bash"
# shellcheck source=Distribution/tests/helpers/release-fixture.bash
source "${source_dir}/Distribution/tests/helpers/release-fixture.bash"
# shellcheck source=Distribution/evaluation/cases/adr-awareness/dough-adr-awareness-proof.sh
source "${source_dir}/Distribution/evaluation/cases/adr-awareness/dough-adr-awareness-proof.sh"
# shellcheck source=Distribution/evaluation/cases/adr-awareness/dough-adr-awareness-use.sh
source "${source_dir}/Distribution/evaluation/cases/adr-awareness/dough-adr-awareness-use.sh"

source "${source_dir}/Distribution/evaluation/cases/adr-awareness/dough-adr-awareness-codex-use-fixture.sh"

[[ ! -e "${target}/.agents/skills/adr-awareness" ]]
[[ ! -L "${target}/.claude/skills/adr-awareness" ]]
for protected_file in \
  .agents/skills/unrelated-guidance/SKILL.md \
  .cursor/skills/other-host-guidance/SKILL.md \
  .claude/skills/other-host-guidance/SKILL.md \
  AGENTS.md \
  docs/adrs/0001-session-state.md \
  docs/adrs/0002-package-sessions.md; do
  cmp \
    "${source_dir}/Distribution/evaluation/cases/adr-awareness/fixtures/installed-use/${protected_file}" \
    "${target}/${protected_file}"
done
before=$(snapshot_path_state "${target}")
source_before=$(snapshot_path_state "${candidate}")

[[ ${before} == "$(snapshot_path_state "${target}")" ]]
[[ ${source_before} == "$(snapshot_path_state "${candidate}")" ]]
