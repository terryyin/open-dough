#!/usr/bin/env bash
# shellcheck disable=SC2310,SC2311,SC2312 # Proof helpers; intentional set -e boundaries.
# Bounded Slice 1 verification: backlog sections, links, uniqueness, deps, Recently done.
set -eu

ROOT="$(cd "$(dirname "$0")/../../.." && pwd)"
BACKLOG="${ROOT}/PRODUCT-BACKLOG.md"
SEEDS="${ROOT}/seeds"
fail=0

fail_msg() {
  printf 'FAIL: %s\n' "$*"
  fail=1
}
pass_msg() { printf 'PASS: %s\n' "$*"; }

headings="$(grep -E '^## ' "${BACKLOG}" | sed 's/^## //')"
expected=$'Near-future direction\nBacklog list\nLonger-term direction\nRecently done'
if [[ "${headings}" = "${expected}" ]]; then
  pass_msg "section order: Near-future → Backlog list → Longer-term → Recently done"
else
  fail_msg "section order mismatch"
  printf '%s\n' "${headings}"
fi

section_file() {
  awk -v s="$1" '
    $0 == "## " s {insec=1; next}
    /^## / {insec=0}
    insec && /^- / {print}
  ' "${BACKLOG}" > "$2"
}

tmp_backlog="$(mktemp)"
tmp_recent="$(mktemp)"
trap 'rm -f "${tmp_backlog}" "${tmp_recent}"' EXIT
section_file "Backlog list" "${tmp_backlog}"
section_file "Recently done" "${tmp_recent}"

parse_ok=0
title=""
rel=""
anchor=""
seed_id=""
parse_entry() {
  parse_ok=0
  title=$(printf '%s\n' "$1" | sed -n 's/^- \[\([^]]*\)\].*/\1/p')
  rel=$(printf '%s\n' "$1" | sed -n 's/^- \[[^]]*\](\([^)#]*\)#[^)]*).*/\1/p')
  anchor=$(printf '%s\n' "$1" | sed -n 's/^- \[[^]]*\]([^)#]*#\([^)]*\)).*/\1/p')
  seed_id=$(printf '%s\n' "$1" | sed -n 's/.*\(SEED-[0-9][0-9]*\).*/\1/p' | head -1)
  if [[ -n "${title}" ]] && [[ -n "${rel}" ]] && [[ -n "${anchor}" ]] && [[ -n "${seed_id}" ]]; then
    parse_ok=1
  fi
}

is_deleted_seed() {
  case "$1" in
    SEED-002 | SEED-005 | SEED-008) return 0 ;;
    *) return 1 ;;
  esac
}

check_title_and_anchor() {
  file="$1"
  where="$2"
  if [[ ! -f "${file}" ]]; then
    fail_msg "${where}: missing seed file ${file}"
    return
  fi
  if ! grep -qE "<a id=\"${anchor}\"></a>" "${file}"; then
    fail_msg "${where}: missing anchor #${anchor}"
    return
  fi
  if ! grep -qF "${title}" "${file}"; then
    fail_msg "${where}: title '${title}' not found"
  fi
}

seen_titles=""
seen_anchors=""
backlog_count=0
while IFS= read -r line || [[ -n "${line}" ]]; do
  [[ -z "${line}" ]] && continue
  parse_entry "${line}"
  if [[ "${parse_ok}" -ne 1 ]]; then
    fail_msg "Backlog list: unparseable entry: ${line}"
    continue
  fi
  backlog_count=$((backlog_count + 1))
  case "${seen_titles}" in
    *"|${title}|"*) fail_msg "duplicate backlog title: ${title}" ;;
    *) ;;
  esac
  seen_titles="${seen_titles}|${title}|"
  key_anchor="${rel}#${anchor}"
  case "${seen_anchors}" in
    *"|${key_anchor}|"*) fail_msg "duplicate backlog link: ${key_anchor}" ;;
    *) ;;
  esac
  seen_anchors="${seen_anchors}|${key_anchor}|"
  if is_deleted_seed "${seed_id}"; then
    fail_msg "backlog links deleted seed: ${line}"
  fi
  case "${rel}" in
    *SEED-002* | *SEED-005* | *SEED-008*) fail_msg "backlog links deleted seed path: ${line}" ;;
    *) ;;
  esac
  check_title_and_anchor "${ROOT}/${rel}" "Backlog:${title}"
  if ! grep -A40 -F "<a id=\"${anchor}\"></a>" "${ROOT}/${rel}" | grep -q '^\*\*Goal:\*\*'; then
    fail_msg "Backlog:${title} missing **Goal:**"
  fi
  if ! grep -A80 -F "<a id=\"${anchor}\"></a>" "${ROOT}/${rel}" | grep -q '^\*\*Evaluation:\*\*'; then
    fail_msg "Backlog:${title} missing **Evaluation:**"
  fi
done < "${tmp_backlog}"

if [[ "${backlog_count}" -eq 0 ]]; then
  fail_msg "Backlog list is empty"
else
  pass_msg "Backlog list: ${backlog_count} unique resolvable entries"
fi

for dormant in \
  SEED-002-trunk-based-multi-agent-collaboration.md \
  SEED-005-dear-do-retrospective-feedback-mailbox.md \
  SEED-008-worktree-branch-trunk-sync.md; do
  if [[ -e "${SEEDS}/${dormant}" ]]; then
    fail_msg "dormant seed still present: ${dormant}"
  fi
done
pass_msg "dormant SEED-002/005/008 absent from seeds/"

tmp_refs="$(mktemp)"
trap 'rm -f "${tmp_backlog}" "${tmp_recent}" "${tmp_refs}"' EXIT
grep -RInE 'SEED-002|SEED-005|SEED-008|trunk-based-multi-agent|dear-do-retrospective|worktree-branch-trunk' "${ROOT}" --include='*.md' > "${tmp_refs}" 2> /dev/null || true
while IFS= read -r hit || [[ -n "${hit}" ]]; do
  [[ -z "${hit}" ]] && continue
  case "${hit}" in
    *'/029-remove-valueless-wip/PLAN.md:'*) continue ;;
    *'/029-remove-valueless-wip/evidence/'*) continue ;;
    *)
      fail_msg "live reference to deleted seed: ${hit}"
      ;;
  esac
done < "${tmp_refs}"

while IFS= read -r line || [[ -n "${line}" ]]; do
  [[ -z "${line}" ]] && continue
  parse_entry "${line}"
  [[ "${parse_ok}" -ne 1 ]] && continue
  deps=$(grep -A120 -F "<a id=\"${anchor}\"></a>" "${ROOT}/${rel}" | grep -m1 '^\*\*Depends on:\*\*' || true)
  [[ -z "${deps}" ]] && continue
  for sid in $(printf '%s\n' "${deps}" | grep -oE 'SEED-[0-9]+' || true); do
    if is_deleted_seed "${sid}"; then
      fail_msg "${title} Depends on deleted ${sid}"
    fi
    match=""
    for candidate in "${SEEDS}/${sid}"-*.md; do
      if [[ -f "${candidate}" ]]; then
        match="${candidate}"
        break
      fi
    done
    if [[ -z "${match}" ]]; then
      fail_msg "${title} Depends on missing seed file for ${sid}"
    fi
  done
done < "${tmp_backlog}"
pass_msg "depends-on references do not point at deleted seeds"

order_of() {
  needle="$1"
  i=0
  while IFS= read -r line || [[ -n "${line}" ]]; do
    i=$((i + 1))
    case "${line}" in
      *"${needle}"*)
        printf '%s\n' "${i}"
        return 0
        ;;
      *) ;;
    esac
  done < "${tmp_backlog}"
  printf '0\n'
}

pos_cleanup=$(order_of "#harden-direction-change")
pos_slice=$(order_of "#keep-slice-planning-bounded")
pos_release=$(order_of "#standalone-client-update")
pos_donut3=$(order_of "#finish-donut-adr-adoption")
pos_donut4=$(order_of "#preserve-donut-adr-adoption-on-update")
pos_extract=$(order_of "#extract-story-refinement")

if [[ "${pos_cleanup}" -gt 0 ]] && [[ "${pos_slice}" -gt 0 ]] && [[ "${pos_cleanup}" -lt "${pos_slice}" ]]; then
  :
else
  fail_msg "prerequisite order: cleanup before keep-slice-planning"
fi
if [[ "${pos_release}" -gt 0 ]] && [[ "${pos_donut3}" -gt 0 ]] && [[ "${pos_release}" -lt "${pos_donut3}" ]]; then
  :
else
  fail_msg "prerequisite order: standalone release before Donut adoption"
fi
if [[ "${pos_donut3}" -lt "${pos_donut4}" ]]; then
  :
else
  fail_msg "prerequisite order: Donut Story 3 before Story 4"
fi
if [[ "${pos_cleanup}" -lt "${pos_extract}" ]]; then
  :
else
  fail_msg "prerequisite order: cleanup before extract-story-refinement"
fi
pass_msg "known prerequisite ordering coherent"

recent_count=0
while IFS= read -r line || [[ -n "${line}" ]]; do
  [[ -z "${line}" ]] && continue
  recent_count=$((recent_count + 1))
  parse_entry "${line}"
  if [[ "${parse_ok}" -eq 1 ]]; then
    check_title_and_anchor "${ROOT}/${rel}" "Recently done:${title}"
    if is_deleted_seed "${seed_id}"; then
      fail_msg "Recently done links deleted seed: ${line}"
    fi
  fi
done < "${tmp_recent}"

if [[ "${recent_count}" -gt 10 ]]; then
  fail_msg "Recently done has ${recent_count} entries (max 10)"
elif [[ "${recent_count}" -eq 0 ]]; then
  fail_msg "Recently done is empty"
else
  pass_msg "Recently done: ${recent_count} <= 10 newest completions"
fi

first=$(head -1 "${tmp_backlog}")
case "${first}" in
  *"#register-ci-host-hooks-consistently"*) pass_msg "explicit first priority preserved (CI host hooks)" ;;
  *) fail_msg "explicit first priority lost; first item: ${first}" ;;
esac

if [[ "${fail}" -ne 0 ]]; then
  printf 'RESULT: FAIL\n'
  exit 1
fi
printf 'RESULT: PASS\n'
exit 0
