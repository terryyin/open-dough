#!/usr/bin/env bash
# Shared helpers for slice-3 independent checks. Sourced, not a product runner.
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

claude_skill_used() {
  local transcript=$1
  [[ -s ${transcript} ]] || return 1
  jq -e -s '
    any(.[] | (.message.content // [])[]?;
      (.type == "tool_use" and .name == "Skill" and
        ((.input.skill // "") | test("dough-story-wrap-up")))
      or (.type == "tool_use" and .name == "Read" and
        ((.input.file_path // "") | test("dough-story-wrap-up/SKILL\\.md")))
    )
    or any(.[];
      ((tostring) | test("dough-story-wrap-up/SKILL\\.md"))
      or ((.skill // "") | test("dough-story-wrap-up"))
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

no_wrap_up_complete_marker() {
  # Judge the session result only. The skill body in tool results contains the
  # marker as an instruction and is not an emitted wrap-up.
  if [[ -f ${RESPONSE} ]] && grep -Fq '## STORY WRAP-UP COMPLETE' "${RESPONSE}"; then
    bad "wrap-up-complete marker emitted on a refusal"
    return 0
  fi
  if [[ -f ${TRANSCRIPT} ]]; then
    if jq -e -s '
      any(.[];
        .type == "result" and
        ((.result // "") | tostring | test("## STORY WRAP-UP COMPLETE"))
      )
    ' "${TRANSCRIPT}" > /dev/null; then
      bad "wrap-up-complete marker emitted in the result event"
      return 0
    fi
  fi
  ok "no wrap-up-complete marker"
}

protected_bytes_identical() {
  local rel hash_now hash_before
  local files=(
    planning/seeds/SEED-001-greeting.md
    DearDough.md
    planning/PRODUCT-BACKLOG.md
    README.md
    planning/plans/trim-names.md
    planning/plans/trim-names/evidence/cli-run.txt
    planning/plans/formal-titles.md
    src/greet.mjs
    test/greet.test.mjs
    AGENTS.md
  )
  if [[ ! -f ${BEFORE}/hashes.txt ]]; then
    bad "before hashes missing"
    return 1
  fi
  for rel in "${files[@]}"; do
    if [[ -f ${FIXTURE}/${rel} ]]; then
      hash_now=$(shasum -a 256 "${FIXTURE}/${rel}" | awk '{print $1}')
    else
      hash_now=ABSENT
    fi
    hash_before=$(awk -v p="${rel}" '$2 == p {print $1}' "${BEFORE}/hashes.txt")
    if [[ ${hash_now} == "${hash_before}" ]]; then
      ok "protected bytes identical: ${rel}"
    else
      bad "protected bytes changed: ${rel} before=${hash_before} after=${hash_now}"
    fi
  done
  if [[ -f ${BEFORE}/full-file-hashes.txt ]]; then
    local now_full
    now_full=$(mktemp)
    (cd -- "${FIXTURE}" && find . \
      -path './.git' -prune -o \
      -path './.agents' -prune -o \
      -path './.claude' -prune -o \
      -path './.cursor' -prune -o \
      -type f -print0 | sort -z | xargs -0 shasum -a 256) > "${now_full}"
    if cmp -s -- "${BEFORE}/full-file-hashes.txt" "${now_full}"; then
      ok "product tree file hashes identical"
    else
      bad "product tree file hashes changed"
      diff -u "${BEFORE}/full-file-hashes.txt" "${now_full}" | tee -a "${LOG}" || true
    fi
    rm -f -- "${now_full}"
  fi
  if [[ -f ${BEFORE}/file-list.txt ]]; then
    local now_list
    now_list=$(mktemp)
    (cd -- "${FIXTURE}" && find . \
      -path './.git' -prune -o \
      -path './.agents' -prune -o \
      -path './.claude' -prune -o \
      -path './.cursor' -prune -o \
      -print | LC_ALL=C sort) > "${now_list}"
    if cmp -s -- "${BEFORE}/file-list.txt" "${now_list}"; then
      ok "no deletion: product file list identical"
    else
      bad "product file list changed (deletion or addition)"
      diff -u "${BEFORE}/file-list.txt" "${now_list}" | tee -a "${LOG}" || true
    fi
    rm -f -- "${now_list}"
  fi
  local before_head now_head
  before_head=$(awk -F= '/^HEAD=/{print $2}' "${BEFORE}/git.txt")
  now_head=$(git -C "${FIXTURE}" rev-parse HEAD)
  if [[ ${before_head} == "${now_head}" ]]; then
    ok "Git HEAD unchanged: ${now_head}"
  else
    bad "Git HEAD changed on refusal: ${before_head} -> ${now_head}"
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

report_mentions() {
  local pattern=$1
  local label=$2
  if [[ -f ${RESPONSE} ]] && grep -Ei "${pattern}" "${RESPONSE}" > /dev/null; then
    ok "report mentions ${label}"
    return 0
  fi
  if [[ -f ${TRANSCRIPT} ]]; then
    if jq -e -s --arg pat "${pattern}" '
      any(.[];
        .type == "result" and
        ((.result // "") | tostring | test($pat; "i"))
      )
    ' "${TRANSCRIPT}" > /dev/null; then
      ok "report mentions ${label} (result event)"
      return 0
    fi
  fi
  bad "report does not mention ${label}"
  return 0
}
