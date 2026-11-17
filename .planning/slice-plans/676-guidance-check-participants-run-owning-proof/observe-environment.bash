#!/usr/bin/env bash
# Planning-only observation of a provisional environment; starts no native session.
# Run from the owned preparation checkout. The frozen protective reference is
# applied only inside the disposable fixture, never to the maintained overlay.
# shellcheck disable=SC1091,SC2154 # Runner and case supply the sourced globals.
set -euo pipefail
source_dir=${PWD}
source Distribution/evaluation/src/native-guidance-check-run.sh
prep_probe_root=$(mktemp -d "${PWD}/.prep-fixture.XXXXXX")
prep_short_parent=$(mktemp -d /tmp/od-prep.XXXXXX)
trap 'rm -rf -- "${prep_probe_root}" "${prep_short_parent}"' EXIT
mkdir -p "${prep_probe_root}/run" "${prep_probe_root}/tmp" "${prep_probe_root}/bin"
ln -s "${prep_probe_root}/tmp" "${prep_short_parent}/t"
export NATIVE_GUIDANCE_CHECK_OPEN_DOUGH_SOURCE=${source_dir}
source Distribution/evaluation/cases/guidance-checks/launch-command-tests/case.bash
case_materialize "${prep_probe_root}/run" "${source_dir}" codex
workspace="${prep_probe_root}/run/workspace"
node "${source_dir}/.agents/skills/dough-execute-plan/scripts/test-entry-rules.mjs" --project "${workspace}" --source e2e/launches/agent-launch-ad-hoc.spec.ts --source dashboard/backend-tests/launches/agent-launch-ad-hoc-boundary.spec.ts --source dashboard/backend-tests/launches/agent-launch-model-boundary.spec.ts
git -C "${workspace}" apply "${source_dir}/Distribution/evaluation/tests/native-guidance-checks/support/launch-command-tests/protective.diff"
cp /bin/ps "${prep_probe_root}/bin/ps"
chmod 755 "${prep_probe_root}/bin/ps"
codesign --force --sign - "${prep_probe_root}/bin/ps"
# The fixture is nested under the source for preparation isolation. Omitting
# PROTECTED_SOURCE avoids denying the fixture itself; default-deny still
# protects paths outside the allowed scratch roots. This is a proxy for the
# real runner, whose arm and protected source are siblings, not ancestors.
native_codex_prepare "${prep_probe_root}/run"
cd "${workspace}"
status=0
for group in backend e2e; do
  if [[ ${group} == backend ]]; then
    config=dashboard/backend.playwright.config.ts
    specs=("${case_backend_specs[@]}")
  else
    config=e2e/playwright.config.ts
    specs=("${case_e2e_specs[@]}")
  fi
  native_codex_wrap env -u GIT_ALTERNATE_OBJECT_DIRECTORIES -u NO_COLOR -u FORCE_COLOR "PATH=${prep_probe_root}/bin:/opt/homebrew/bin:${PATH}" "TMPDIR=${prep_short_parent}/t" "PLAYWRIGHT_JSON_OUTPUT_NAME=${prep_probe_root}/${group}.json" npx playwright test --config "${config}" --reporter=json "${specs[@]}"
  if "${native_codex_command[@]}" > "${prep_probe_root}/${group}.log" 2>&1; then result=passed; else
    result=failed
    status=1
  fi
  echo "${group}: ${result}"
  if [[ -f ${prep_probe_root}/${group}.json ]]; then jq '{stats, errors, failed: [.suites[] | .. | objects | select(has("results")) | .results[] | select(.status != "passed" and .status != "skipped") | {status, error}]}' "${prep_probe_root}/${group}.json"; else tail -35 "${prep_probe_root}/${group}.log"; fi
done
exit "${status}"
