#!/usr/bin/env bash
set -euo pipefail

source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)
temporary_dir=$(mktemp -d)
trap 'rm -rf -- "${temporary_dir}"' EXIT
fixture="${temporary_dir}/source"
mkdir -p -- "${fixture}/tests" "${fixture}/scripts" "${fixture}/src"
cp -- "${source_dir}/install.sh" "${source_dir}/VERSION" "${source_dir}/CHANGELOG.md" "${fixture}/"
cp -R -- "${source_dir}/src/install" "${source_dir}/src/skills" "${fixture}/src/"
cp -R -- "${source_dir}/tests/helpers" "${fixture}/tests/"
cp -- "${source_dir}/tests/story-payload-update.sh" "${fixture}/tests/"
cp -- "${source_dir}/scripts/test.sh" "${fixture}/scripts/"
# This disposable suite owns only story-payload-update.sh. Self-installation of
# the maintainer checkout is independent of the installed story-link assertion.
printf '#!/usr/bin/env bash\nexit 0\n' > "${fixture}/scripts/check-self-installation.sh"

story=dough-story-refinement/SKILL.md
missing=references/missing-story-dependency.md
printf '\n[Missing story dependency](%s)\n' "${missing}" >> "${fixture}/src/skills/${story}"

# One suite run is enough: it executes the real dependency check and reports
# that file as failed. A valid payload already passes in story-payload-update.sh,
# and the runner's success path is covered by test-runner-bash.sh.
if bash "${fixture}/scripts/test.sh" > "${temporary_dir}/suite.log" 2>&1; then
  cat "${temporary_dir}/suite.log" >&2
  echo 'FAIL: the suite accepted a failed story payload test.' >&2
  exit 1
fi
if ! grep -F -- "${story} -> ${missing}" "${temporary_dir}/suite.log" \
  || ! grep -F -- 'FAIL: tests/story-payload-update.sh' "${temporary_dir}/suite.log"; then
  cat "${temporary_dir}/suite.log" >&2
  echo 'FAIL: the suite must report the failed story test and missing dependency.' >&2
  exit 1
fi

echo 'PASS: a missing installed story dependency fails the suite with the referring file and missing target.'
