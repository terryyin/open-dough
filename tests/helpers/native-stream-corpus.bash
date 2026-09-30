#!/usr/bin/env bash
# Helpers for tests/native-stream-replay.sh: rebuild a retained attempt from a
# corpus entry, and expect the corpus command's refusal.
# shellcheck disable=SC2154 # corpus, work_dir, and corpus_add come from the sourcing test.
# shellcheck disable=SC2312 # Captured refusal output is checked by value.

# Retains corpus entry $1 as attempt $2 under the results directory.
retain_attempt() {
  local entry="${corpus}/$1" attempt="${work_dir}/results/$2" file name
  mkdir -p -- "${attempt}"
  for file in "${entry}"/*; do
    name=$(basename -- "${file}")
    case ${name} in
      *events.jsonl.gz) gunzip -c -- "${file}" > "${attempt}/${name%.gz}" ;;
      *expected) ;;
      *) cp -- "${file}" "${attempt}/" ;;
    esac
  done
}

# An attempt the command refuses, naming `reason`, adds nothing.
expect_refusal() {
  local attempt="${work_dir}/results/$1" reason=$2 status=0
  node "${corpus_add}" --corpus "${work_dir}/refused" "${attempt}" \
    > /dev/null 2> "${work_dir}/refusal.err" || status=$?
  if [[ ${status} -ne 1 ]] || [[ $(cat "${work_dir}/refusal.err") != "refused: ${attempt}: ${reason}" ]] \
    || [[ -e ${work_dir}/refused ]]; then
    printf 'FAIL: adding %s exited %s, expected only refused: %s\n' \
      "$1" "${status}" "${reason}" >&2
    cat "${work_dir}/refusal.err" >&2
    return 1
  fi
}
