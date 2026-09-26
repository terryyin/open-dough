#!/usr/bin/env bash
set -euo pipefail

source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)
temporary_dir=$(mktemp -d)
trap 'rm -rf -- "${temporary_dir}"' EXIT
fixture="${temporary_dir}/source"
mkdir -p -- "${fixture}/tests" "${fixture}/scripts" "${fixture}/src/install"
cp -- "${source_dir}/install.sh" "${fixture}/"
cp -- "${source_dir}/src/install/open-dough-release-version.sh" "${fixture}/src/install/"
cp -R -- "${source_dir}/src/skills" "${fixture}/src/"
cp -- "${source_dir}/tests/payload-declaration-links.sh" "${fixture}/tests/"
cp -- "${source_dir}/scripts/test.sh" "${fixture}/scripts/"
# This disposable suite owns only payload-declaration-links.sh. Self-installation
# of the maintainer checkout is independent of the story-link declaration check.
printf '#!/usr/bin/env bash\nexit 0\n' > "${fixture}/scripts/check-self-installation.sh"

story=dough-story-refinement/SKILL.md
missing=references/missing-story-dependency.md
printf '\n[Missing story dependency](%s)\n' "${missing}" >> "${fixture}/src/skills/${story}"

# One suite run is enough: it executes the real declaration check and reports
# that file as failed. A valid payload already passes in
# payload-declaration-links.sh, and the runner's success path is covered by
# test-runner-bash.sh.
if bash "${fixture}/scripts/test.sh" > "${temporary_dir}/suite.log" 2>&1; then
  cat "${temporary_dir}/suite.log" >&2
  echo 'FAIL: the suite accepted a failed declaration test.' >&2
  exit 1
fi
if ! grep -q -F -- "FAIL: declared ${story} links to undeclared ${missing}" "${temporary_dir}/suite.log" \
  || ! grep -q -F -- 'FAIL: tests/payload-declaration-links.sh' "${temporary_dir}/suite.log"; then
  cat "${temporary_dir}/suite.log" >&2
  echo 'FAIL: the suite must report the failed declaration test and missing dependency.' >&2
  exit 1
fi
