#!/usr/bin/env bash
set -euo pipefail
log="${SELECTION_LOG:-.planning/selection.log}"
mkdir -p -- "$(dirname -- "${log}")"
pattern=
args=("$@")
i=0
while [[ ${i} -lt ${#args[@]} ]]; do
  case ${args[i]} in
    --test-name-pattern)
      i=$((i + 1))
      pattern=${args[i]}
      ;;
    --test-name-pattern=*)
      pattern=${args[i]#--test-name-pattern=}
      ;;
    *) ;;
  esac
  i=$((i + 1))
done
# Keep scratch output beside the log: sandboxed hosts may deny the system temp.
tmp=$(mktemp "${log}.XXXXXX")
set +e
node --test --test-reporter=tap "${args[@]}" > "${tmp}" 2>&1
status=$?
set -e
# Named tests appear as TAP "ok/not ok N - name". Exclude the file-suite
# phantom Node emits when a name pattern matches no tests (still exit 0).
# grep -Ev exits 1 when every line is filtered; do not let pipefail abort.
selected=$(
  { grep -E '^(ok|not ok) [0-9]+ - ' "${tmp}" \
    | grep -Ev ' - [^ ]+\.(mjs|js|cjs|ts)$| - [^ ]+/[^ ]+$' \
    || true; } \
    | wc -l \
    | tr -d ' '
)
selected=${selected:-0}
# Selected test names let observers count distinct observations across runs.
names=$(
  { grep -E '^(ok|not ok) [0-9]+ - ' "${tmp}" \
    | grep -Ev ' - [^ ]+\.(mjs|js|cjs|ts)$| - [^ ]+/[^ ]+$' \
    || true; } \
    | sed -E 's/^(ok|not ok) [0-9]+ - //' \
    | paste -sd ';' -
)
printf 'selected=%s pattern=%s exit=%s names=%s\n' "${selected}" "${pattern}" \
  "${status}" "${names}" >> "${log}"
output=$(cat "${tmp}")
rm -f -- "${tmp}"
printf '# named-tests-selected: %s\n' "${selected}"
printf '%s\n' "${output}"
exit "${status}"
