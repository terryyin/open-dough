#!/usr/bin/env bash
# Recreate the disposable A/B/C recovery-guidance Git fixture in a temp
# directory. Does not write a .git directory into the Open Dough worktree.
# Expected SHAs (fixed author/committer dates):
#   A  v0.3.4  3cd28847958c83e3388b2c0c37c4302598e0653b
#   B  v0.3.5  36bb259583397374a4b0781e426097387af2bf13
#   C  v0.3.6  9060700d5c041308c34f16103542ebf7c01f5b3e
set -euo pipefail

repo="${1:-}"
if [[ -z "${repo}" ]]; then
  repo="$(mktemp -d "${TMPDIR:-/tmp}/od-q040-slice4.XXXXXX")"
fi
mkdir -p "${repo}"

export GIT_CONFIG_GLOBAL=/dev/null
export GIT_CONFIG_SYSTEM=/dev/null
export GIT_AUTHOR_NAME='Slice 4 Fixture'
export GIT_AUTHOR_EMAIL='slice4@example.test'
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

# A and C omit a compact reviewed manifest. B retains one.
write_recovery_skill() {
  local recovery="$1"
  local near_future="$2"
  cat > "${repo}/skills/recover-execution/SKILL.md" << EOF
# Recover one execution

Search the current conversation, current planning material, and Git history
in that order. Recover the earliest execution-ready plan, its intended
outcome, and the related commit boundary.

${recovery}

## Near-future direction

${near_future}
EOF
}

missing_manifest_recovery='When later review needs that same boundary, reopen the plan and Git log and
reconstruct it. Do not retain a compact reviewed manifest after the first
recovery.'

corrected_recovery='When later review needs that same boundary, retain a compact reviewed
manifest after the first recovery. Do not reopen the plan and Git log to
reconstruct it.'

near_future_a='Treat the established near-future direction as a high-priority criterion.
Read it once from the resolved project location.'

near_future_c='Read the established near-future direction once from the resolved project
location and treat it as a high-priority criterion. A missing direction does
not stop other reviews.'

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

write_recovery_skill "${missing_manifest_recovery}" "${near_future_a}"

commit_and_tag \
  '2026-09-01T00:00:00 +0000' \
  'Add 0.3.4 recovery guidance without a compact reviewed manifest' \
  v0.3.4 \
  VERSION CHANGELOG.md skills/recover-execution/SKILL.md

printf '0.3.5\n' > "${repo}/VERSION"
cat > "${repo}/CHANGELOG.md" << 'EOF'
# Changelog

## 0.3.5

Retain a compact reviewed manifest after the first recovery.

## 0.3.4

Initial recovery guidance.
EOF

write_recovery_skill "${corrected_recovery}" "${near_future_a}"

commit_and_tag \
  '2026-09-08T00:00:00 +0000' \
  'Retain a compact reviewed manifest after the first recovery' \
  v0.3.5 \
  VERSION CHANGELOG.md skills/recover-execution/SKILL.md

printf '0.3.6\n' > "${repo}/VERSION"
cat > "${repo}/CHANGELOG.md" << 'EOF'
# Changelog

## 0.3.6

Reword near-future direction notes.

## 0.3.5

Retain a compact reviewed manifest after the first recovery.

## 0.3.4

Initial recovery guidance.
EOF

write_recovery_skill "${missing_manifest_recovery}" "${near_future_c}"

commit_and_tag \
  '2026-09-12T00:00:00 +0000' \
  'Reword near-future direction; recovery again omits a compact manifest' \
  v0.3.6 \
  VERSION CHANGELOG.md skills/recover-execution/SKILL.md

echo "${repo}"
