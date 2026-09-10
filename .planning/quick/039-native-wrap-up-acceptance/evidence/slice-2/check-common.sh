#!/usr/bin/env bash
# Shared helpers for slice-2 independent checks. Sourced, not a product runner.
# Callers assign FIXTURE, BEFORE, LOG, TRANSCRIPT, and RESPONSE.
# shellcheck disable=SC2153,SC2154,SC2312
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

cursor_skill_used() {
  local transcript=$1
  [[ -s ${transcript} ]] || return 1
  jq -e -s '
    any(.[];
      ((.tool_call.readToolCall.args.path // "") | test("dough-story-wrap-up/SKILL\\.md"))
      or ((.tool_call.skillToolCall.args.skill // "") | test("dough-story-wrap-up"))
      or ((.message.content // "") | tostring | test("dough-story-wrap-up/SKILL\\.md"))
      or ((tostring) | test("dough-story-wrap-up/SKILL\\.md"))
    )
  ' "${transcript}" > /dev/null
}

stream_complete() {
  local transcript=$1
  [[ -s ${transcript} ]] || return 1
  jq -e -s 'any(.[]; .type == "result")' "${transcript}" > /dev/null
}

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

links_resolve() {
  python3 - "${FIXTURE}" << 'PY'
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
}

direction_unchanged() {
  python3 - "${FIXTURE}/planning/PRODUCT-BACKLOG.md" "${BEFORE}/direction.txt" << 'PY'
import pathlib, sys
text = pathlib.Path(sys.argv[1]).read_text()
start = text.index("## Near-future direction")
end = text.index("## Backlog list")
now = text[start:end]
before = pathlib.Path(sys.argv[2]).read_text()
sys.exit(0 if now == before else 1)
PY
}

backlog_items() {
  python3 - "${FIXTURE}/planning/PRODUCT-BACKLOG.md" << 'PY'
import pathlib, sys
text = pathlib.Path(sys.argv[1]).read_text()
section = text.split("## Backlog list", 1)[1]
for line in section.splitlines():
    if line.startswith("- "):
        print(line[2:])
PY
}

no_invented_seed() {
  local extra
  extra=$(find "${FIXTURE}/planning/seeds" -type f -name '*.md' ! -name 'SEED-001-greeting.md' 2> /dev/null || true)
  if [[ -n ${extra} ]]; then
    bad "invented seed file(s): ${extra}"
    return 1
  fi
  ok "no invented seed file besides SEED-001-greeting.md"
  if [[ -f ${FIXTURE}/planning/seeds/SEED-001-greeting.md ]]; then
    if grep -Eqi 'Remove extra greeting prefix' \
      "${FIXTURE}/planning/seeds/SEED-001-greeting.md"; then
      bad "seed invented a Remove extra greeting prefix story section"
    else
      ok "seed has no invented correction story section"
    fi
  fi
}

no_tombstone() {
  local tombstone=0 path
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
  if [[ -f ${FIXTURE}/planning/PRODUCT-BACKLOG.md ]]; then
    if grep -Ei 'recently done|finished list|tombstone|archived trim names' \
      "${FIXTURE}/planning/PRODUCT-BACKLOG.md"; then
      tombstone=1
      bad "backlog contains finished-list or tombstone history"
    fi
  fi
  if [[ ${tombstone} -eq 0 ]]; then
    ok "no archive, tombstone, finished-list, or replacement history file"
  fi
}

extract_before_cleanup() {
  local reported=''
  if [[ -f ${RESPONSE} ]]; then
    reported=$(grep -Ei 'pre-cleanup|before-cleanup|before cleanup|recovery commit' \
      "${RESPONSE}" | grep -Eo '[0-9a-f]{7,40}' | head -n 1 || true)
  fi
  if [[ -z ${reported} && -f ${TRANSCRIPT} ]]; then
    reported=$(grep -Eo 'before-cleanup commit [`(]*[0-9a-f]{7,40}' "${TRANSCRIPT}" \
      | grep -Eo '[0-9a-f]{7,40}' | head -n 1 || true)
  fi
  if [[ -z ${reported} ]]; then
    reported=$(awk -F= '/^HEAD=/{print $2}' "${BEFORE}/git.txt")
    note "NOTE: using snapshot HEAD as before-cleanup candidate: ${reported}"
  fi
  printf '%s\n' "${reported}"
}
