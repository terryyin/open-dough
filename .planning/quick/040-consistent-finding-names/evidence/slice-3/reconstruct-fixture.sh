#!/usr/bin/env bash
# Recreate the disposable A/B recovery-guidance Git fixture in a temp directory.
# Does not write a .git directory into the Open Dough worktree.
# Expected SHAs (fixed author/committer dates):
#   A  v0.3.4  e0af631d6f47de17303a68eb590d3e1afbcec834
#   I  v0.3.5  4edda03a33066dbf9f8a6b8d3d39dc2b05e6725e
#   B  v0.3.6  f8c20339c2603756cbf571dfe154280770b3bfdc
set -euo pipefail

repo="${1:-}"
if [[ -z "${repo}" ]]; then
  repo="$(mktemp -d "${TMPDIR:-/tmp}/od-q040-slice3.XXXXXX")"
fi
mkdir -p "${repo}"

export GIT_CONFIG_GLOBAL=/dev/null
export GIT_CONFIG_SYSTEM=/dev/null
export GIT_AUTHOR_NAME='Slice 3 Fixture'
export GIT_AUTHOR_EMAIL='slice3@example.test'
export GIT_COMMITTER_NAME="${GIT_AUTHOR_NAME}"
export GIT_COMMITTER_EMAIL="${GIT_AUTHOR_EMAIL}"
git_cmd=(git -C "${repo}" -c user.name="${GIT_AUTHOR_NAME}" -c user.email="${GIT_AUTHOR_EMAIL}" -c commit.gpgsign=false)

commit_and_tag() {
  local date="$1"
  local message="$2"
  local tag="$3"
  shift 3
  export GIT_AUTHOR_DATE="${date}" GIT_COMMITTER_DATE="${date}"
  "${git_cmd[@]}" add "$@"
  "${git_cmd[@]}" commit --quiet -m "${message}"
  "${git_cmd[@]}" tag "${tag}"
  unset GIT_AUTHOR_DATE GIT_COMMITTER_DATE
}

# One copy of the missing-manifest recovery issue that persists from A through B.
write_recovery_skill() {
  local near_future="$1"
  cat > "${repo}/skills/recover-execution/SKILL.md" << EOF
# Recover one execution

Search the current conversation, current planning material, and Git history
in that order. Recover the earliest execution-ready plan, its intended
outcome, and the related commit boundary.

When later review needs that same boundary, reopen the plan and Git log and
reconstruct it. Do not retain a compact reviewed manifest after the first
recovery.

## Near-future direction

${near_future}
EOF
}

git -c init.defaultBranch=main init --quiet "${repo}"

mkdir -p "${repo}/skills/recover-execution"

cat > "${repo}/VERSION" << 'EOF'
0.3.4
EOF

cat > "${repo}/CHANGELOG.md" << 'EOF'
# Changelog

## 0.3.4

Initial recovery guidance.
EOF

write_recovery_skill 'Treat the established near-future direction as a high-priority criterion.
Read it once from the resolved project location.'

commit_and_tag \
  '2026-09-01T00:00:00 +0000' \
  'Add 0.3.4 recovery guidance without a compact reviewed manifest' \
  v0.3.4 \
  VERSION CHANGELOG.md skills/recover-execution/SKILL.md

printf '0.3.5\n' > "${repo}/VERSION"
cat > "${repo}/CHANGELOG.md" << 'EOF'
# Changelog

## 0.3.5

Improve execution recovery guidance wording.

## 0.3.4

Initial recovery guidance.
EOF

cat > "${repo}/README.md" << 'EOF'
Disposable recovery-guidance fixture for continuity matching. Unrelated
product notes live here so intervening history is not empty.
EOF

commit_and_tag \
  '2026-09-05T00:00:00 +0000' \
  'Record 0.3.5 changelog wording and unrelated notes' \
  v0.3.5 \
  VERSION CHANGELOG.md README.md

printf '0.3.6\n' > "${repo}/VERSION"
cat > "${repo}/CHANGELOG.md" << 'EOF'
# Changelog

## 0.3.6

Reword near-future direction notes.

## 0.3.5

Improve execution recovery guidance wording.

## 0.3.4

Initial recovery guidance.
EOF

write_recovery_skill 'Read the established near-future direction once from the resolved project
location and treat it as a high-priority criterion. A missing direction does
not stop other reviews.'

commit_and_tag \
  '2026-09-10T00:00:00 +0000' \
  'Reword near-future direction; recovery still omits a compact manifest' \
  v0.3.6 \
  VERSION CHANGELOG.md skills/recover-execution/SKILL.md

echo "${repo}"
