#!/usr/bin/env bash
# Shared native-proof helpers for one complete-revision call versus fixture-masked
# stop/await leftovers. Journey files keep their own observation field layouts.
# shellcheck disable=SC2034,SC2154,SC2312

native_completion_seen() {
  local node_log=$1 transcript=$2 mailbox=$3 sha=$4
  grep -F 'complete-revision' "${node_log}" \
    | grep -F "${mailbox}" \
    | grep -Fq "${sha}" \
    || grep -F 'complete-revision' "${transcript:-/dev/null}" \
    | grep -F "${mailbox}" \
      | grep -Fq "${sha}"
}

# complete-revision calls for mailbox $3 and revision $4: the node call log $1,
# or the tool starts transcript $2 shows ("subtype":"started" in Cursor's
# stream, "type":"item.started" in Codex's), whichever sees more.
native_completion_call_count() {
  local node_log=$1 transcript=$2 mailbox=$3 sha=$4
  local complete_count transcript_complete_count=0
  complete_count=$(grep -Fc "complete-revision ${mailbox} ${sha}" "${node_log}" || true)
  if [[ -n ${transcript} && -f ${transcript} ]]; then
    transcript_complete_count=$(
      grep -E '"subtype":"started"|"type":"item.started"' "${transcript}" \
        | grep -F 'complete-revision' \
        | grep -F "${mailbox}" \
        | grep -Fc "${sha}" || true
    )
    if ((transcript_complete_count > complete_count)); then
      complete_count=${transcript_complete_count}
    fi
  fi
  printf '%s\n' "${complete_count}"
}

# Revision $2 is registered in mailbox $1 once the mailbox holds its coverage
# record, which only the mailbox's own registration writes, whether a
# register-push command or managed delivery registered it.
native_completion_registered() {
  local mailbox=$1 sha=$2
  if [[ -f ${mailbox}/coverage/${sha}.json ]]; then
    printf 'true\n'
  else
    printf 'false\n'
  fi
}

native_completion_await_count() {
  local node_log=$1 mailbox=$2 sha=$3
  grep -Fc "await-revision ${mailbox} ${sha}" "${node_log}" || true
}

native_completion_stop_count() {
  local node_log=$1 mailbox=$2
  grep -Ec "[[:space:]]stop[[:space:]]+${mailbox}([[:space:]]|$)" "${node_log}" || true
}

# Echoes true when complete-revision produced a stopped/finished terminal without
# a fixture fallback stop masking missing product shutdown.
native_completion_product_shutdown() {
  local complete_count=$1 forced_stop_file=$2 terminal=$3
  local forced_stop=false
  [[ -n ${forced_stop_file} && -f ${forced_stop_file} ]] && forced_stop=true
  if [[ ${complete_count} -ge 1 && ${forced_stop} == false &&
    (${terminal} == stopped || ${terminal} == finished) ]]; then
    printf 'true\n'
  else
    printf 'false\n'
  fi
}

native_completion_forced_stop() {
  local forced_stop_file=$1
  if [[ -n ${forced_stop_file} && -f ${forced_stop_file} ]]; then
    printf 'true\n'
  else
    printf 'false\n'
  fi
}
