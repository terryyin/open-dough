#!/usr/bin/env bash
# Independent wrap-up evaluator. Does not trust native self-report.
# Usage: check-wrap-up.sh <fixture> <before-snapshot-dir> <transcript> <response> <log>
# shellcheck disable=SC2312
set -euo pipefail

if [[ $# -ne 5 ]]; then
  echo "usage: $0 <fixture> <before-snapshot> <transcript> <response> <log>" >&2
  exit 2
fi

FIXTURE=$(cd -- "$1" && pwd -P)
BEFORE=$(cd -- "$2" && pwd -P)
TRANSCRIPT=$3
RESPONSE=$4
LOG=$5

pass=0
fail=0
note() { printf '%s\n' "$*" | tee -a "${LOG}"; }
ok() {
  pass=$((pass + 1))
  note "PASS: $*"
}
bad() {
  fail=$((fail + 1))
  note "FAIL: $*"
}

: > "${LOG}"
note "Independent checks for ${FIXTURE}"
note "time: $(date -u +%Y-%m-%dT%H:%M:%SZ)"

# 1. Transcript completeness and observed skill use
if [[ ! -s ${TRANSCRIPT} ]]; then
  bad "transcript missing or empty: ${TRANSCRIPT}"
else
  if jq -e -s 'any(.[]; .type == "turn.completed")' "${TRANSCRIPT}" > /dev/null; then
    ok "transcript contains turn.completed"
  else
    bad "transcript missing turn.completed"
  fi
fi

skill_used=0
if [[ -s ${TRANSCRIPT} ]]; then
  if jq -e -s '
    any(.[];
      (.type == "item.completed" and .item.type == "command_execution" and
        ((.item.command // "") | test("dough-story-wrap-up/SKILL\\.md")))
      or ((.item.command // "") | test("dough-story-wrap-up"))
      or ((.item.aggregated_output // "" | tostring) | test("dough-story-wrap-up|# Story wrap-up"))
      or ((.item.path // "") | test("dough-story-wrap-up"))
      or ((tostring) | test("dough-story-wrap-up/SKILL\\.md"))
    )' "${TRANSCRIPT}" > /dev/null; then
    skill_used=1
  fi
fi
if [[ ${skill_used} -eq 1 ]]; then
  ok "installed wrap-up skill was read or used"
else
  bad "no observed read/use of installed dough-story-wrap-up skill"
fi

absent() {
  local path=$1
  if [[ -e "${FIXTURE}/${path}" ]]; then
    bad "spent path still present: ${path}"
  else
    ok "spent path absent: ${path}"
  fi
}

present() {
  local path=$1
  if [[ -e "${FIXTURE}/${path}" ]]; then
    ok "preserved path present: ${path}"
  else
    bad "preserved path missing: ${path}"
  fi
}

# 2. Spent history absent (tracked and untracked)
absent planning/plans/trim-names.md
absent planning/plans/trim-names/evidence/cli-run.txt
if [[ -e "${FIXTURE}/planning/plans/trim-names" ]]; then
  if find "${FIXTURE}/planning/plans/trim-names" -type f | grep -q .; then
    bad "spent evidence directory still has files"
  else
    ok "spent evidence directory empty or absent of files"
  fi
else
  ok "spent evidence directory absent"
fi

if [[ -f "${FIXTURE}/planning/seeds/SEED-001-greeting.md" ]]; then
  if grep -Eq '^## Trim names[[:space:]]*$' "${FIXTURE}/planning/seeds/SEED-001-greeting.md"; then
    bad "completed Trim names section still in seed"
  else
    ok "completed Trim names section absent from seed"
  fi
  if grep -Eq '^## Formal titles[[:space:]]*$' "${FIXTURE}/planning/seeds/SEED-001-greeting.md"; then
    ok "sibling Formal titles remains in seed"
  else
    bad "sibling Formal titles missing from seed"
  fi
else
  bad "seed file missing; sibling story cannot remain"
fi

if [[ -f "${FIXTURE}/planning/PRODUCT-BACKLOG.md" ]]; then
  if grep -Fq 'Trim names' "${FIXTURE}/planning/PRODUCT-BACKLOG.md"; then
    bad "completed queue entry still mentions Trim names"
  else
    ok "completed queue entry absent from backlog"
  fi
  if grep -Fq 'Formal titles' "${FIXTURE}/planning/PRODUCT-BACKLOG.md"; then
    ok "unrelated Formal titles queue entry remains"
  else
    bad "unrelated Formal titles queue entry missing"
  fi
else
  bad "backlog missing"
fi

if [[ -f "${FIXTURE}/DearDough.md" ]]; then
  if grep -Fq 'DD-001' "${FIXTURE}/DearDough.md" || grep -Fq 'Trim names plan' "${FIXTURE}/DearDough.md"; then
    bad "spent DearDough occurrence still present"
  else
    ok "spent DearDough occurrence absent"
  fi
  if grep -Fq 'DD-002' "${FIXTURE}/DearDough.md" && grep -Fq 'native Node' "${FIXTURE}/DearDough.md"; then
    ok "unrelated DearDough text remains"
  else
    bad "unrelated DearDough text missing"
  fi
else
  bad "DearDough.md missing; unrelated log text cannot remain"
fi

present src/greet.mjs
present test/greet.test.mjs

# 3. Direction bytes unchanged
if [[ -f "${FIXTURE}/planning/PRODUCT-BACKLOG.md" && -f "${BEFORE}/direction.txt" ]]; then
  if python3 - "${FIXTURE}/planning/PRODUCT-BACKLOG.md" "${BEFORE}/direction.txt" << 'PY'
import pathlib, sys
text = pathlib.Path(sys.argv[1]).read_text()
start = text.index("## Near-future direction")
end = text.index("## Backlog list")
now = text[start:end]
before = pathlib.Path(sys.argv[2]).read_text()
sys.exit(0 if now == before else 1)
PY
  then
    ok "near-future direction bytes unchanged"
  else
    bad "near-future direction bytes changed"
  fi
else
  bad "cannot compare direction bytes"
fi

# 4. Remaining Markdown links resolve
if python3 - "${FIXTURE}" << 'PY'
import pathlib, re, sys
root = pathlib.Path(sys.argv[1])
link_re = re.compile(r'\[([^\]]*)\]\(([^)]+)\)')
fail = 0
skip_prefixes = ('.agents/', '.claude/', '.cursor/')
for path in sorted(root.rglob('*.md')):
    rel = path.relative_to(root).as_posix()
    if rel.startswith(skip_prefixes):
        continue
    text = path.read_text()
    for match in link_re.finditer(text):
        target = match.group(2).strip().split()[0]
        if target.startswith(('http://', 'https://', 'mailto:')):
            continue
        if '#' in target:
            target = target.split('#', 1)[0]
        if not target:
            continue
        dest = (path.parent / target).resolve()
        try:
            dest.relative_to(root.resolve())
        except ValueError:
            print(f"outside:{rel}->{match.group(2)}", file=sys.stderr)
            fail += 1
            continue
        if not dest.exists():
            print(f"missing:{rel}->{match.group(2)}", file=sys.stderr)
            fail += 1
sys.exit(fail)
PY
then
  ok "remaining Markdown links resolve; no live link to a removed path"
else
  bad "broken remaining Markdown links"
fi

# 5. No archive / tombstone / finished-list / replacement history
tombstone=0
for path in \
  planning/ARCHIVE.md \
  planning/FINISHED.md \
  planning/recently-done.md \
  planning/TOMBSTONE.md \
  planning/HISTORY.md \
  planning/wrap-up-summary.md; do
  if [[ -e "${FIXTURE}/${path}" ]]; then
    tombstone=1
    bad "replacement history file present: ${path}"
  fi
done
if [[ -f "${FIXTURE}/planning/PRODUCT-BACKLOG.md" ]]; then
  if grep -Ei 'recently done|finished list|tombstone|archived trim names' \
    "${FIXTURE}/planning/PRODUCT-BACKLOG.md"; then
    tombstone=1
    bad "backlog contains finished-list or tombstone history"
  fi
fi
if [[ ${tombstone} -eq 0 ]]; then
  ok "no archive, tombstone, finished-list, or replacement history file"
fi

# 6. Lasting knowledge — recorded for manual judgment; script flags identity leaks
if [[ -f "${FIXTURE}/README.md" ]]; then
  if grep -Fq 'first command-line argument is the only name source' "${FIXTURE}/README.md" \
    || grep -Fq 'does not read a name from the environment' "${FIXTURE}/README.md"; then
    ok "lasting knowledge phrase present in README.md"
  else
    bad "lasting knowledge phrase missing from README.md"
  fi
  if grep -Ei 'trim names|SEED-001|trim-names\.md|retrospective|nothing to act on' \
    "${FIXTURE}/README.md"; then
    bad "README still carries spent story/plan identity or retrospective judgment"
  else
    ok "README has no spent story/plan identity or retrospective judgment phrases"
  fi
else
  bad "README.md missing"
fi

# 7. Git recovery from before-cleanup commit
before_cleanup=''
if [[ -f ${RESPONSE} ]]; then
  reported=$(grep -Ei 'pre-cleanup|before-cleanup|before cleanup|recovery commit' \
    "${RESPONSE}" | grep -Eo '[0-9a-f]{7,40}' | head -n 1 || true)
  if [[ -n ${reported} ]]; then
    before_cleanup=${reported}
  fi
fi
ready_head=$(awk -F= '/^HEAD=/{print $2}' "${BEFORE}/git.txt")
if [[ -z ${before_cleanup} ]]; then
  before_cleanup=${ready_head}
  note "NOTE: using wrap-up-ready HEAD as before-cleanup candidate: ${before_cleanup}"
fi
note "before-cleanup commit: ${before_cleanup}"
if git -C "${FIXTURE}" cat-file -t "${before_cleanup}" > /dev/null 2>&1; then
  if git -C "${FIXTURE}" show "${before_cleanup}:planning/plans/trim-names.md" > /dev/null 2>&1; then
    ok "git show recovers planning/plans/trim-names.md from ${before_cleanup}"
  else
    bad "git show cannot recover planning/plans/trim-names.md from ${before_cleanup}"
  fi
  if git -C "${FIXTURE}" show "${before_cleanup}:planning/plans/trim-names/evidence/cli-run.txt" > /dev/null 2>&1; then
    ok "git show recovers spent evidence from ${before_cleanup}"
  else
    bad "git show cannot recover spent evidence from ${before_cleanup}"
  fi
else
  bad "before-cleanup revision is not a Git object: ${before_cleanup}"
fi

note "summary: pass=${pass} fail=${fail}"
if [[ ${fail} -ne 0 ]]; then
  exit 1
fi
exit 0
