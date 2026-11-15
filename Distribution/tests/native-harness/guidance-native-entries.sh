#!/usr/bin/env bash
# Actual guidance-case CLI dispatch and installed rejection continuation.
# shellcheck disable=SC2016,SC2312 # Substitute script and invocation text are literal.
set -euo pipefail

source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/../../.." && pwd)
work_dir=$(mktemp -d)
trap 'rm -rf -- "${work_dir}"' EXIT
mkdir -p -- "${work_dir}/bin" "${work_dir}/scratch"
export GUIDANCE_NATIVE_LOG="${work_dir}/native.log"
export TMPDIR="${work_dir}/scratch"
export PATH="${work_dir}/bin:${PATH}"
: > "${GUIDANCE_NATIVE_LOG}"
cat > "${work_dir}/bin/codex" << 'HOST'
#!/usr/bin/env bash
set -euo pipefail
printf '%s\n' "$*" >> "${GUIDANCE_NATIVE_LOG}"
if [[ ${1:-} == --version ]]; then
  printf 'codex guidance-fixture\n'
  exit 0
fi
output=
workspace=
while (($#)); do
  case $1 in
    -o) output=$2; shift 2 ;;
    -C) workspace=$2; shift 2 ;;
    *) shift ;;
  esac
done
# The backlog guard reaches the actual host only after installed-hook preflight.
if [[ -f ${workspace}/.planning/PRODUCT-BACKLOG.md ]]; then
  [[ -f ${workspace}/.codex/hooks.json ]]
  exit 37
fi
local_skill="${workspace}/.agents/skills/team-architecture-practice/SKILL.md"
[[ -f ${local_skill} ]]
grep -Fq 'Follow the team-owned review' "${local_skill}"
[[ -f ${workspace}/.agents/skills/dough-update/SKILL.md ]]
printf '%s\n' 'Using dough-update skill guidance. I cannot assess or replace local guidance: unsupported. Ordinary Open Dough release updating is still available from the repository URL.' > "${output}"
if [[ ${GUIDANCE_MUTATE:-0} == 1 ]]; then
  printf 'changed\n' >> "${local_skill}"
fi
printf '%s\n' '{"type":"item.completed","item":{"type":"agent_message","text":"Using dough-update skill guidance."}}' '{"type":"turn.completed"}'
HOST
chmod a+x "${work_dir}/bin/codex"
backlog="${source_dir}/Distribution/evaluation/cases/product-backlog/product-backlog-native.sh"
rejection="${source_dir}/Distribution/evaluation/cases/installation/dough-update-local-guidance-rejection.sh"

# Actual no-argument dispatch owns the complete default body and invokes no host.
bash "${backlog}" > "${work_dir}/default-output"
[[ ! -s ${work_dir}/default-output && ! -s ${GUIDANCE_NATIVE_LOG} ]]
set +e
bash "${backlog}" --native zed --case guard > "${work_dir}/invalid" 2>&1
status=$?
set -e
[[ ${status} == 2 && ! -s ${GUIDANCE_NATIVE_LOG} ]]
grep -Fq 'unsupported or missing host' "${work_dir}/invalid"
set +e
bash "${backlog}" --native codex --case guard > "${work_dir}/guard" 2>&1
status=$?
set -e
[[ ${status} == 37 ]]
grep -Fq -- '--dangerously-bypass-hook-trust' "${GUIDANCE_NATIVE_LOG}"

# Only Codex is substituted; actual fixture install, reader, rejection assertions,
# target/source snapshots and EXIT cleanup remain production case behavior.
: > "${GUIDANCE_NATIVE_LOG}"
bash "${rejection}" --native codex > "${work_dir}/rejection"
grep -Fq 'PASS: native codex discovered and invoked candidate dough-update' "${work_dir}/rejection"
grep -Fq 'exec --ignore-user-config' "${GUIDANCE_NATIVE_LOG}"
set +e
GUIDANCE_MUTATE=1 bash "${rejection}" --native codex > "${work_dir}/mutated" 2>&1
status=$?
set -e
[[ ${status} == 1 ]]
