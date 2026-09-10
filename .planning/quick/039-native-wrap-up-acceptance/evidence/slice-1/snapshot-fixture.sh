#!/usr/bin/env bash
# Snapshot decisive fixture paths and hashes. Usage: snapshot.sh <fixture> <dest>
# shellcheck disable=SC2312
set -euo pipefail

if [[ $# -ne 2 ]]; then
  echo "usage: $0 <fixture> <dest-dir>" >&2
  exit 2
fi

FIXTURE=$(cd -- "$1" && pwd -P)
DEST=$2
mkdir -p -- "${DEST}"

{
  fixture_head=$(git -C "${FIXTURE}" rev-parse HEAD)
  printf 'HEAD=%s\n' "${fixture_head}"
  printf 'status:\n'
  git -C "${FIXTURE}" status --porcelain=v1
  printf 'log:\n'
  git -C "${FIXTURE}" log --oneline
} > "${DEST}/git.txt"

(cd -- "${FIXTURE}" && find . \
  -path './.git' -prune -o \
  -path './.agents' -prune -o \
  -path './.claude' -prune -o \
  -path './.cursor' -prune -o \
  -print | LC_ALL=C sort) > "${DEST}/file-list.txt"

hash_one() {
  local rel=$1
  if [[ -f "${FIXTURE}/${rel}" ]]; then
    shasum -a 256 "${FIXTURE}/${rel}" | awk -v p="${rel}" '{print $1 "  " p}'
  else
    printf 'ABSENT  %s\n' "${rel}"
  fi
}

{
  hash_one planning/seeds/SEED-001-greeting.md
  hash_one DearDough.md
  hash_one planning/PRODUCT-BACKLOG.md
  hash_one README.md
  hash_one planning/plans/trim-names.md
  hash_one planning/plans/trim-names/evidence/cli-run.txt
  hash_one src/greet.mjs
  hash_one test/greet.test.mjs
  hash_one AGENTS.md
} > "${DEST}/hashes.txt"

if [[ -f "${FIXTURE}/planning/PRODUCT-BACKLOG.md" ]]; then
  python3 - "${FIXTURE}/planning/PRODUCT-BACKLOG.md" "${DEST}/direction.txt" << 'PY'
import pathlib, sys
text = pathlib.Path(sys.argv[1]).read_text()
start = text.index("## Near-future direction")
end = text.index("## Backlog list")
pathlib.Path(sys.argv[2]).write_text(text[start:end])
PY
fi

mkdir -p -- "${DEST}/tree"
rsync -a --delete \
  --exclude '.git' --exclude '.agents' --exclude '.claude' --exclude '.cursor' \
  "${FIXTURE}/" "${DEST}/tree/"
