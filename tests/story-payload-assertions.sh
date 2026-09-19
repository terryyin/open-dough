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

if bash "${fixture}/tests/story-payload-update.sh" > "${temporary_dir}/direct.log" 2>&1; then
  cat "${temporary_dir}/direct.log" >&2
  echo 'FAIL: the story payload test accepted a missing installed dependency.' >&2
  exit 1
fi
if ! grep -F -- "${story} -> ${missing}" "${temporary_dir}/direct.log"; then
  cat "${temporary_dir}/direct.log" >&2
  echo 'FAIL: the diagnostic must identify the referring file and missing target.' >&2
  exit 1
fi

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

# Restore valid source bytes and prove that the same test and runner can pass.
cp -- "${source_dir}/src/skills/${story}" "${fixture}/src/skills/${story}"
if ! bash "${fixture}/scripts/test.sh" > "${temporary_dir}/valid.log" 2>&1; then
  cat "${temporary_dir}/valid.log" >&2
  echo 'FAIL: the suite rejected valid installed story dependencies.' >&2
  exit 1
fi

echo 'PASS: missing installed story dependencies fail the test and suite with an actionable diagnostic; valid dependencies pass.'
