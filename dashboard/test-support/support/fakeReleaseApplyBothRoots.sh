#!/usr/bin/env bash
# Stand-in apply that writes both native skill roots (no claim-cleanliness need).
set -euo pipefail
[[ ${1:-} == apply ]] || {
  echo "expected apply" >&2
  exit 2
}
shift
target='' platform='' force=0
while [[ $# -gt 0 ]]; do
  case $1 in
    --target)
      target=$2
      shift 2
      ;;
    --platform)
      platform=$2
      shift 2
      ;;
    --force)
      force=1
      shift
      ;;
    *)
      echo "unexpected $1" >&2
      exit 2
      ;;
  esac
done
[[ -n ${target} && -n ${platform} && ${force} -eq 0 ]] || exit 2
if [[ -n ${OPEN_DOUGH_FAKE_APPLY_LOG:-} ]]; then
  printf 'apply --target %s --platform %s\n' "${target}" "${platform}" >> \
    "${OPEN_DOUGH_FAKE_APPLY_LOG}"
fi
for root in \
  "${target}/.agents/skills/dough-execute-plan/scripts" \
  "${target}/.claude/skills/dough-execute-plan/scripts"; do
  mkdir -p -- "${root}"
  printf '// both-roots for %s\n' "${platform}" > \
    "${root}/first-landing-expectation.mjs"
done
printf 'Outcome: installed or updated the shared Codex/Cursor root and Claude Code to test.\n'
