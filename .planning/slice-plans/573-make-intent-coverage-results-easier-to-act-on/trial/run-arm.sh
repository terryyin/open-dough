#!/usr/bin/env bash
# Run one Intent Coverage trial arm under Claude Code with stream capture.
# Usage: run-arm.sh <arm-id> <revision> <skill-set:frozen|candidate> <prompt-file>
set -euo pipefail

arm_id=${1:?arm-id}
revision=${2:?revision}
skill_set=${3:?frozen-or-candidate}
prompt_file=${4:?prompt-file}

checkout=/Users/terryyin/git/open-dough/.worktrees/make-intent-coverage-results-easier-to-act-on
trial=${checkout}/.planning/slice-plans/573-make-intent-coverage-results-easier-to-act-on/trial
arm_dir=${trial}/arms/${arm_id}
mkdir -p "${arm_dir}"
scratch=${arm_dir}/scratch
skills_src=${trial}/skills-${skill_set}

if [[ -e ${scratch} ]]; then
  git -C "${checkout}" worktree remove --force "${scratch}" 2> /dev/null || rm -rf "${scratch}"
fi

git -C "${checkout}" worktree add --detach "${scratch}" "${revision}"
(
  cd "${scratch}"
  PATH="/opt/homebrew/bin:${PATH}" caffeinate -s -i node scripts/setup-native.mjs npm
  PATH="/opt/homebrew/bin:${PATH}" caffeinate -s -i node scripts/setup-native.mjs browser
  PATH="/opt/homebrew/bin:${PATH}" caffeinate -s -i node scripts/setup-native.mjs check
) > "${arm_dir}/setup.log" 2>&1

# Overlay trial skills so the arm uses the intended guidance at this revision.
mkdir -p "${scratch}/src/skills/dough-intent-coverage" \
  "${scratch}/src/skills/dough-story-wrap-up" \
  "${scratch}/.claude/skills/dough-intent-coverage" \
  "${scratch}/.claude/skills/dough-story-wrap-up" \
  "${scratch}/.agents/skills/dough-intent-coverage" \
  "${scratch}/.agents/skills/dough-story-wrap-up"
cp "${skills_src}/dough-intent-coverage.SKILL.md" "${scratch}/src/skills/dough-intent-coverage/SKILL.md"
cp "${skills_src}/dough-story-wrap-up.SKILL.md" "${scratch}/src/skills/dough-story-wrap-up/SKILL.md"
cp "${checkout}/src/skills/dough-intent-coverage/finish-report.mjs" \
  "${scratch}/src/skills/dough-intent-coverage/finish-report.mjs"
for root in .claude .agents; do
  cp "${skills_src}/dough-intent-coverage.SKILL.md" "${scratch}/${root}/skills/dough-intent-coverage/SKILL.md"
  cp "${skills_src}/dough-story-wrap-up.SKILL.md" "${scratch}/${root}/skills/dough-story-wrap-up/SKILL.md"
  cp "${checkout}/src/skills/dough-intent-coverage/finish-report.mjs" \
    "${scratch}/${root}/skills/dough-intent-coverage/finish-report.mjs"
done

cp "${prompt_file}" "${arm_dir}/prompt.txt"
host_version=$(claude --version 2> /dev/null | head -1) || host_version=
start_utc=$(date -u +%Y-%m-%dT%H:%M:%SZ)
start_ms=$(python3 -c 'import time; print(int(time.time()*1000))')
load_start=$(uptime)
power=$(pmset -g batt | head -1) || power=
{
  echo "arm_id=${arm_id}"
  echo "revision=${revision}"
  echo "skill_set=${skill_set}"
  echo "host=claude"
  echo "host_version=${host_version}"
  echo "model=opus"
  echo "permission_defaultMode=auto"
  echo "start_utc=${start_utc}"
  echo "start_ms=${start_ms}"
  echo "load=${load_start}"
  echo "power=${power}"
} > "${arm_dir}/meta-start.txt"

prompt=$(cat "${prompt_file}")
export PATH="/opt/homebrew/bin:${PATH}"
# Fresh session: no resume. Full tools needed for scratch fault/restore.
# shellcheck disable=SC2086
caffeinate -s -i claude --print --dangerously-skip-permissions --no-session-persistence \
  --output-format stream-json --verbose \
  "${prompt}" > "${arm_dir}/stream.jsonl" 2> "${arm_dir}/stderr.log"
status=$?

end_utc=$(date -u +%Y-%m-%dT%H:%M:%SZ)
end_ms=$(python3 -c 'import time; print(int(time.time()*1000))')
load_end=$(uptime)
{
  echo "end_utc=${end_utc}"
  echo "end_ms=${end_ms}"
  echo "claude_exit=${status}"
  echo "load=${load_end}"
} > "${arm_dir}/meta-end.txt"

# Prefer the longest Intent Coverage report text from the stream.
python3 - "${arm_dir}" << 'PY' || true
import json
import sys
from pathlib import Path

arm = Path(sys.argv[1])
texts = []
result = ""
for line in (arm / "stream.jsonl").read_text(errors="replace").splitlines():
    line = line.strip()
    if not line:
        continue
    try:
        ev = json.loads(line)
    except Exception:
        continue
    if ev.get("type") == "result":
        result = ev.get("result") or result
    if ev.get("type") == "assistant":
        for part in (ev.get("message") or {}).get("content") or []:
            if isinstance(part, dict) and part.get("type") == "text" and part.get("text"):
                texts.append(part["text"])
cands = [
    t
    for t in texts
    if "Dough Intent Coverage" in t
    or "Confirmed missing" in t
    or "Assertion gap" in t
    or "**Outcome" in t
    or "Verdict:" in t
]
best = max(cands, key=len) if cands else (result or (texts[-1] if texts else ""))
(arm / "report.md").write_text(best.rstrip() + "\n")
(arm / "result-extract.txt").write_text(best.rstrip() + "\n")
print("extracted_chars", len(best))
PY

# Preserve restoration evidence from scratch if any remnant.
git -C "${scratch}" status --porcelain --untracked-files=all > "${arm_dir}/scratch-status-after.txt" || true
git -C "${scratch}" rev-parse HEAD > "${arm_dir}/scratch-head.txt" || true

# Retire scratch worktree after capture.
git -C "${checkout}" worktree remove --force "${scratch}" 2> /dev/null || rm -rf "${scratch}"
exit "${status}"
