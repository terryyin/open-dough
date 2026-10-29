#!/usr/bin/env bash
# Test stand-in for open-dough-release.sh: ordinary apply, exact --target, no --force.
# Keeps the launch worktree's git status clean so Continue can resume the claim.
set -euo pipefail

if [[ ${1:-} != apply ]]; then
  echo "fakeReleaseApply: expected apply" >&2
  exit 2
fi
shift

target=''
platform=''
force=0
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
      echo "fakeReleaseApply: unexpected arg $1" >&2
      exit 2
      ;;
  esac
done

if [[ -z ${target} || -z ${platform} ]]; then
  echo "fakeReleaseApply: --target and --platform required" >&2
  exit 2
fi
if [[ ${force} -eq 1 ]]; then
  echo "fakeReleaseApply: --force must not be passed" >&2
  exit 2
fi

rel='.claude/skills/dough-execute-plan/scripts/first-landing-expectation.mjs'
if [[ ! -f ${target}/.claude/skills/dough-execute-plan/scripts/dashboard-landing.mjs ]]; then
  echo "Outcome: refused; preserved the selected installation."
  echo "fakeReleaseApply: no landing helper to restore from" >&2
  exit 1
fi

# Restore the tracked helper exactly so porcelain stays empty for resume.
if ! git -C "${target}" checkout HEAD -- "${rel}" 2> /dev/null; then
  echo "Outcome: refused; preserved the selected installation."
  echo "fakeReleaseApply: could not restore ${rel} from HEAD" >&2
  exit 1
fi

# Record apply args for proof of exact worktree + platform, no --force.
if [[ -n ${OPEN_DOUGH_FAKE_APPLY_LOG:-} ]]; then
  printf 'apply --target %s --platform %s\n' "${target}" "${platform}" >> \
    "${OPEN_DOUGH_FAKE_APPLY_LOG}"
fi

printf 'Source: test-fixture\n'
printf 'Outcome: installed or updated the shared Codex/Cursor root and Claude Code to test.\n'
