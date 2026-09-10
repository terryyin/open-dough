#!/usr/bin/env bash
# Build the disposable wrap-up fixture with a seedless follow-up, install
# current Open Dough source for Cursor, snapshot before-state, and record
# candidate identity. Does not launch Cursor.
# shellcheck disable=SC2312
set -euo pipefail

WORKTREE=/private/tmp/open-dough-quick-039-native-wrap-up-acceptance
EVIDENCE="${WORKTREE}/.planning/quick/039-native-wrap-up-acceptance/evidence/slice-2"
FIXTURE_SRC="${EVIDENCE}/fixture-src"

if [[ $# -ne 1 ]]; then
  echo "usage: $0 <proof-root>" >&2
  exit 2
fi

PROOF_ROOT=$(cd -- "$1" && pwd -P)
FIXTURE="${PROOF_ROOT}/fixture"
ORIGIN="${PROOF_ROOT}/origin.git"

rm -rf -- "${FIXTURE}" "${ORIGIN}"
mkdir -p -- "${FIXTURE}"
git init --bare --quiet "${ORIGIN}"
git init --quiet "${FIXTURE}"
git -C "${FIXTURE}" config user.email 'fixture@example.com'
git -C "${FIXTURE}" config user.name 'Wrap-up Fixture'
git -C "${FIXTURE}" remote add origin "${ORIGIN}"

mkdir -p -- "${FIXTURE}/src" "${FIXTURE}/test"
cp -- "${FIXTURE_SRC}/AGENTS.md" "${FIXTURE}/AGENTS.md"
cp -- "${FIXTURE_SRC}/HUMAN.md" "${FIXTURE}/HUMAN.md"
cp -- "${FIXTURE_SRC}/README.md" "${FIXTURE}/README.md"
cp -- "${FIXTURE_SRC}/src/greet.mjs" "${FIXTURE}/src/greet.mjs"
cp -- "${FIXTURE_SRC}/test/greet.test.mjs" "${FIXTURE}/test/greet.test.mjs"

mkdir -p -- "${FIXTURE}/.git/hooks"
cat > "${FIXTURE}/.git/hooks/pre-commit" << 'HOOK'
#!/bin/sh
git diff --check --cached
HOOK
chmod +x "${FIXTURE}/.git/hooks/pre-commit"

git -C "${FIXTURE}" add AGENTS.md HUMAN.md README.md src/greet.mjs test/greet.test.mjs
git -C "${FIXTURE}" commit --quiet -m "Add greeting CLI with extra prefix"

mkdir -p -- \
  "${FIXTURE}/planning/seeds" \
  "${FIXTURE}/planning/plans/trim-names/evidence"
cp -- "${FIXTURE_SRC}/planning/seeds/SEED-001-greeting.md" \
  "${FIXTURE}/planning/seeds/SEED-001-greeting.md"
cp -- "${FIXTURE_SRC}/planning/plans/trim-names.md" \
  "${FIXTURE}/planning/plans/trim-names.md"
cp -- "${FIXTURE_SRC}/planning/plans/trim-names/evidence/cli-run.txt" \
  "${FIXTURE}/planning/plans/trim-names/evidence/cli-run.txt"
cp -- "${FIXTURE_SRC}/planning/plans/remove-extra-greeting-prefix.md" \
  "${FIXTURE}/planning/plans/remove-extra-greeting-prefix.md"
cp -- "${FIXTURE_SRC}/planning/PRODUCT-BACKLOG.md" \
  "${FIXTURE}/planning/PRODUCT-BACKLOG.md"
cp -- "${FIXTURE_SRC}/DearDough.md" "${FIXTURE}/DearDough.md"

bash "${WORKTREE}/install.sh" \
  --target "${FIXTURE}" \
  --source "${WORKTREE}" \
  --platform cursor \
  --force

cmp -s -- \
  "${WORKTREE}/src/skills/dough-story-wrap-up/SKILL.md" \
  "${FIXTURE}/.agents/skills/dough-story-wrap-up/SKILL.md"
cmp -s -- \
  "${WORKTREE}/src/skills/dough-product-backlog/SKILL.md" \
  "${FIXTURE}/.agents/skills/dough-product-backlog/SKILL.md"
if [[ -f ${FIXTURE}/.claude/skills/dough-story-wrap-up/SKILL.md ]]; then
  cmp -s -- \
    "${WORKTREE}/src/skills/dough-story-wrap-up/SKILL.md" \
    "${FIXTURE}/.claude/skills/dough-story-wrap-up/SKILL.md"
fi

git -C "${FIXTURE}" add -A
git -C "${FIXTURE}" commit --quiet -m "Record completed Trim names work and seedless correction"

git -C "${FIXTURE}" rev-parse HEAD > "${PROOF_ROOT}/wrap-up-ready-head.txt"
git -C "${FIXTURE}" status --porcelain > "${PROOF_ROOT}/wrap-up-ready-status.txt"
[[ ! -s "${PROOF_ROOT}/wrap-up-ready-status.txt" ]]

{
  printf 'candidate_sha=%s\n' "$(git -C "${WORKTREE}" rev-parse HEAD)"
  printf 'version=%s\n' "$(cat "${WORKTREE}/VERSION")"
  printf 'wrap_up_skill_sha256=%s\n' "$(shasum -a 256 "${WORKTREE}/src/skills/dough-story-wrap-up/SKILL.md" | awk '{print $1}')"
  printf 'installed_wrap_up_sha256=%s\n' "$(shasum -a 256 "${FIXTURE}/.agents/skills/dough-story-wrap-up/SKILL.md" | awk '{print $1}')"
  printf 'product_backlog_skill_sha256=%s\n' "$(shasum -a 256 "${WORKTREE}/src/skills/dough-product-backlog/SKILL.md" | awk '{print $1}')"
  printf 'wrap_up_ready_head=%s\n' "$(cat "${PROOF_ROOT}/wrap-up-ready-head.txt")"
  printf 'proof_root=%s\n' "${PROOF_ROOT}"
} > "${PROOF_ROOT}/candidate-identity.txt"

printf '%s\n' "${PROOF_ROOT}"
printf 'fixture=%s\n' "${FIXTURE}"
printf 'origin=%s\n' "${ORIGIN}"
ready_head=$(cat "${PROOF_ROOT}/wrap-up-ready-head.txt")
printf 'wrap-up-ready=%s\n' "${ready_head}"
