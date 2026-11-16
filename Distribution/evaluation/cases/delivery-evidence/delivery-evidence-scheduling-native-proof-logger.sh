#!/usr/bin/env bash
# Product proof runner for delivery-evidence/scheduling fixtures, installed as
# bin/run-proof.sh. Every focused check, whole-suite run, size check and
# formatting pass appends one line naming its kind, the content identity of
# the product state it ran on, and what it observed, so an assessor can order
# proof against the refactor's move and tell which state each run covered.
#
#   run-proof.sh targeted FILE...   focused node tests
#   run-proof.sh suite [NODE-ARG...] every tests/*.test.mjs (the whole suite)
#   run-proof.sh size               the project's line limit (exit 1 over it)
#   run-proof.sh format             the selective formatter
#   run-proof.sh --state            prints the state identity only, unlogged
#
# The log is PROOF_RUN_LOG, else proof-runs.log in the repository's common Git
# directory, so linked worktrees share it and git status never shows it.
# Line: seq=N kind=K state=S stylesheet-files=N linked=A,B size-ok=B exit=E
# passed=P failed=F names=N1;N2
# shellcheck disable=SC2310,SC2312
set -euo pipefail

line_limit=150
root=$(git rev-parse --show-toplevel)
cd -- "${root}"

# Content identity of the product: tracked and untracked, unignored files
# under index.html, styles, lib and tests, by path and bytes.
proof_state() {
  git ls-files -co --exclude-standard -- index.html styles lib tests \
    | LC_ALL=C sort \
    | while IFS= read -r path; do
      [[ -f ${path} ]] || continue
      printf '%s %s\n' "$(shasum -a 256 < "${path}" | cut -d ' ' -f 1)" \
        "${path}"
    done \
    | shasum -a 256 | cut -c 1-12
}

linked_stylesheets() {
  { grep -oE '<link rel="stylesheet" href="[^"]+"' index.html 2> /dev/null \
    || true; } | sed -E 's/.*href="([^"]+)"/\1/' | paste -sd ',' -
}

stylesheet_files() {
  find styles -maxdepth 1 -name '*.css' -type f 2> /dev/null | wc -l | tr -d ' '
}

size_ok() {
  local file over=0
  while IFS= read -r file; do
    if (($(wc -l < "${file}") > line_limit)); then
      printf '%s: %s lines (limit %s)\n' "${file}" \
        "$(wc -l < "${file}" | tr -d ' ')" "${line_limit}" >&2
      over=1
    fi
  done < <(find styles lib -type f \( -name '*.css' -o -name '*.mjs' \) \
    2> /dev/null | LC_ALL=C sort)
  ((over == 0))
}

if [[ ${1-} == --state ]]; then
  proof_state
  exit 0
fi

kind=${1-}
shift || true
log=${PROOF_RUN_LOG:-$(cd -- "$(git rev-parse --git-common-dir)" && pwd)/proof-runs.log}
state=$(proof_state)
size=true
size_ok 2> /dev/null || size=false
status=0
passed=0
failed=0
names=
case ${kind} in
  targeted | suite)
    files=("$@")
    if [[ ${kind} == suite ]]; then
      mapfile -t files < <(find tests -maxdepth 1 -name '*.test.mjs' | LC_ALL=C sort)
      files=("$@" "${files[@]}")
    fi
    tap=$(mktemp "${log}.XXXXXX")
    node --test --test-reporter=tap "${files[@]}" > "${tap}" 2>&1 || status=$?
    # Top-level named tests only; a file-level entry is not a test.
    results=$(grep -E '^(ok|not ok) [0-9]+ - ' "${tap}" \
      | grep -Ev ' - [^ ]+\.(mjs|js)$| - [^ ]+/[^ ]+$' || true)
    passed=$(grep -c '^ok ' <<< "${results}" || true)
    failed=$(grep -c '^not ok ' <<< "${results}" || true)
    names=$(sed -E 's/^(ok|not ok) [0-9]+ - //' <<< "${results}" \
      | LC_ALL=C sort | paste -sd ';' -)
    cat -- "${tap}"
    rm -f -- "${tap}"
    ;;
  size)
    size_ok || status=1
    ;;
  format)
    # Selective formatter: trailing whitespace on changed or new product files.
    while IFS= read -r path; do
      [[ -f ${path} ]] || continue
      sed -E 's/[[:space:]]+$//' "${path}" > "${path}.fmt"
      if cmp -s "${path}" "${path}.fmt"; then
        rm -f -- "${path}.fmt"
      else
        mv -- "${path}.fmt" "${path}"
        printf 'formatted %s\n' "${path}"
      fi
    done < <({
      git diff --name-only -- index.html styles lib tests
      git ls-files -o --exclude-standard -- index.html styles lib tests
    } | LC_ALL=C sort -u)
    ;;
  *)
    printf 'usage: run-proof.sh targeted FILE... | suite | size | format | --state\n' >&2
    exit 2
    ;;
esac
seq=1
if [[ -f ${log} ]]; then
  seq=$(($(wc -l < "${log}") + 1))
fi
printf 'seq=%s kind=%s state=%s stylesheet-files=%s linked=%s size-ok=%s exit=%s passed=%s failed=%s names=%s\n' \
  "${seq}" "${kind}" "${state}" "$(stylesheet_files)" "$(linked_stylesheets)" \
  "${size}" "${status}" "${passed}" "${failed}" "${names}" >> "${log}"
exit "${status}"
