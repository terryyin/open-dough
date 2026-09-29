#!/usr/bin/env bash
# Every check the runner starts sees CI's environment, whatever the caller's:
# uncolored output, whatever color the caller forces or forbids, and CI's Git
# state, with no global or system settings, background maintenance off, and no
# identity unless the check sets one, so an identity-less commit fails.
set -euo pipefail

source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)
# shellcheck disable=SC1091
# shellcheck source=tests/helpers/expect-in-log.bash
source "${source_dir}/tests/helpers/expect-in-log.bash"
temporary_dir=$(mktemp -d)
trap 'rm -rf -- "${temporary_dir}"' EXIT
checks="${temporary_dir}/checks"
work="${temporary_dir}/work"
record="${temporary_dir}/record"
mkdir -p -- "${checks}" "${work}" "${temporary_dir}/home" "${temporary_dir}/xdg/git"

# The caller's configuration sets everything the runner must hide, through the
# global file, the XDG file, inherited command-line configuration, and
# inherited identity variables; the run below also forces and forbids color.
cat > "${temporary_dir}/home/.gitconfig" << 'CONFIG'
[user]
	name = Caller Identity
	email = caller@example.com
[maintenance]
	auto = true
[init]
	defaultBranch = trunk
CONFIG
cp -- "${temporary_dir}/home/.gitconfig" "${temporary_dir}/xdg/git/config"

# The substitute check records what Git and the color variables report inside
# the runner, outside any repository, then tries a commit in a fresh repository it gave no identity.
cat > "${checks}/observe.sh" << CHECK
#!/usr/bin/env bash
set -euo pipefail
cd -- '${work}'
{
  printf 'user.name=%s\n' "\$(git config --get user.name || echo unset)"
  printf 'user.email=%s\n' "\$(git config --get user.email || echo unset)"
  printf 'maintenance.auto=%s\n' "\$(git config --get maintenance.auto || echo unset)"
  printf 'force-color=%s\n' "\${FORCE_COLOR-unset}"
  printf 'no-color=%s\n' "\${NO_COLOR-unset}"
  git init --quiet repo 2> init.log
  printf 'branch=%s\n' "\$(git -C repo symbolic-ref --short HEAD)"
  if git -C repo commit --quiet --allow-empty -m identity-less > commit.log 2>&1; then
    echo commit=made
  else
    echo commit=refused
  fi
} > '${record}'
CHECK

run_status=0
env FORCE_COLOR=3 NO_COLOR=1 GIT_AUTHOR_NAME='Inherited Author' GIT_AUTHOR_EMAIL=author@example.com \
  GIT_COMMITTER_NAME='Inherited Committer' GIT_COMMITTER_EMAIL=committer@example.com \
  HOME="${temporary_dir}/home" XDG_CONFIG_HOME="${temporary_dir}/xdg" \
  GIT_CONFIG_PARAMETERS="'user.name'='Inherited Identity'" \
  GIT_CONFIG_COUNT=1 GIT_CONFIG_KEY_0=user.email GIT_CONFIG_VALUE_0=inherited@example.com \
  OPEN_DOUGH_TEST_DIR="${checks}" "${BASH}" "${source_dir}/scripts/test.sh" \
  > "${temporary_dir}/run.log" 2>&1 || run_status=$?
if ((run_status != 0)) || [[ -s ${temporary_dir}/run.log ]]; then
  printf 'FAIL: the runner did not pass the observing check silently (status %s):\n' \
    "${run_status}" >&2
  cat -- "${temporary_dir}/run.log" >&2
  exit 1
fi

expect_in_log "${record}" -x -F -- 'user.name=unset'
expect_in_log "${record}" -x -F -- 'user.email=unset'
expect_in_log "${record}" -x -F -- 'maintenance.auto=false'
expect_in_log "${record}" -x -F -- 'force-color=unset'
expect_in_log "${record}" -x -F -- 'no-color=unset'
expect_in_log "${record}" -x -E -- 'branch=[^[:space:]]+'
if grep -q -x -F -- 'branch=trunk' "${record}"; then
  echo "FAIL: the caller's init.defaultBranch reached the check." >&2
  exit 1
fi
expect_in_log "${record}" -x -F -- 'commit=refused'
if git -C "${work}/repo" rev-parse --quiet --verify HEAD > /dev/null; then
  echo 'FAIL: the identity-less commit was recorded.' >&2
  exit 1
fi
