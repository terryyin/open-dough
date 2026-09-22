#!/usr/bin/env bash
# shellcheck disable=SC2312 # pipefail (set by the sourcing test) covers piped reads.
# Real installed use of the product backlog's scripts, invoked only from a
# platform's own installed copy (never the source repository), proving no
# relative import or path reaches back to the release source once it is
# unavailable. Sourced by tests/product-backlog-payload-update.sh.

# An ordinary op with a non-default, absolute --file and a launch from a
# subdirectory of the installed target -- proving path resolution does not
# assume CWD is the project root -- followed by the bounded EISDIR refusal:
# supplying a directory for --file is refused cleanly, with no raw Node stack
# trace and no leftover lock.
run_offline_ordinary_and_eisdir_proof() {
  local scripts_root=$1
  local claude_target=$2
  local custom_backlog launch_subdir directory_arg before_custom
  local eisdir_status eisdir_output

  custom_backlog="${claude_target}/planning-alt/TEAM-BACKLOG.md"
  mkdir -p -- "$(dirname -- "${custom_backlog}")"
  cat > "${custom_backlog}" << 'EOF'
# Product backlog

## Taken

## Backlog list

- [Existing queued item](seeds/EXISTING.md#existing) — EXISTING#existing
EOF
  launch_subdir="${claude_target}/work/nested"
  mkdir -p -- "${launch_subdir}"

  (
    cd -- "${launch_subdir}"
    node "${scripts_root}/product-backlog.mjs" add \
      --file "${custom_backlog}" \
      --identity 'seeds/PAYLOAD.md#verify-installed-add' \
      --title 'Verify the installed payload mutates the real backlog' \
      --link 'seeds/PAYLOAD.md#verify-installed-add' \
      --position first
  ) > /dev/null
  if ! grep -Fq 'seeds/PAYLOAD.md#verify-installed-add' "${custom_backlog}"; then
    echo 'FAIL: the installed product-backlog.mjs did not add the requested entry.' >&2
    cat "${custom_backlog}" >&2
    return 1
  fi
  if ! grep -Fq 'Existing queued item' "${custom_backlog}"; then
    echo 'FAIL: the installed add operation lost the pre-existing entry.' >&2
    return 1
  fi

  before_custom=$(cat "${custom_backlog}")
  directory_arg=$(dirname -- "${custom_backlog}")
  set +e
  eisdir_output=$(
    cd -- "${launch_subdir}"
    node "${scripts_root}/product-backlog.mjs" add \
      --file "${directory_arg}" \
      --identity 'seeds/REFUSED.md#directory-refusal' \
      --title 'Should be refused' \
      --link 'seeds/REFUSED.md#directory-refusal' \
      --position first 2>&1
  )
  eisdir_status=$?
  set -e
  if [[ "${eisdir_status}" -eq 0 ]]; then
    echo 'FAIL: supplying a directory for --file was accepted instead of refused.' >&2
    return 1
  fi
  if [[ "${eisdir_output}" == *'EISDIR'* || "${eisdir_output}" == *'at readFileSync'* ]]; then
    echo 'FAIL: a directory --file surfaced a raw Node stack trace instead of a clean refusal.' >&2
    echo "${eisdir_output}" >&2
    return 1
  fi
  if [[ "${eisdir_output}" != *'is a directory, not a file'* ]]; then
    echo 'FAIL: a directory --file was not named as the actual problem.' >&2
    echo "${eisdir_output}" >&2
    return 1
  fi
  if [[ -e "${directory_arg}.lock" ]]; then
    echo "FAIL: a leftover lock survived the directory refusal: ${directory_arg}.lock" >&2
    return 1
  fi
  if [[ "$(cat "${custom_backlog}")" != "${before_custom}" ]]; then
    echo 'FAIL: the directory refusal changed the real backlog file.' >&2
    return 1
  fi
}

# A real Git-aware adapter, run the same way: a genuine two-sided merge Git
# cannot fast-forward, reconciled by the shared resolver through the
# installed product-backlog-git-merge.mjs, its installed driver, and every
# module that chain transitively imports -- from a launch subdirectory and a
# non-default --file.
run_offline_git_merge_proof() {
  local scripts_root=$1
  local claude_target=$2
  local git_project git_backlog_rel item_a item_b item_c
  local merge_output resulting_backlog expected_backlog parents

  git_project="${claude_target}/git-project"
  mkdir -p -- "${git_project}/docs" "${git_project}/sub/nested"
  git -C "${git_project}" init --quiet -b main
  git_identity "${git_project}"
  git_backlog_rel='docs/BACKLOG.md'
  item_a='- [Item A](seeds/A.md#a) — A#a'
  item_b='- [Item B](seeds/B.md#b) — B#b'
  item_c='- [Item C](seeds/C.md#c) — C#c'

  write_git_backlog() {
    local taken=$1
    local queue=$2
    {
      printf '%s\n\n' '# Product backlog'
      printf '%s\n\n' '## Taken'
      [[ -z "${taken}" ]] || printf '%s\n\n' "${taken}"
      printf '%s\n\n' '## Backlog list'
      printf '%s\n' "${queue}"
    } > "${git_project}/${git_backlog_rel}"
  }

  write_git_backlog "$(printf '%s\n%s' "${item_a}" "${item_b}")" "${item_c}"
  git -C "${git_project}" add -A
  git -C "${git_project}" commit --quiet -m ancestor

  git -C "${git_project}" checkout --quiet -b close-a
  write_git_backlog "${item_b}" "${item_c}"
  git -C "${git_project}" add -A
  git -C "${git_project}" commit --quiet -m close-a
  git -C "${git_project}" checkout --quiet main

  git -C "${git_project}" checkout --quiet -b close-b
  write_git_backlog "${item_a}" "${item_c}"
  git -C "${git_project}" add -A
  git -C "${git_project}" commit --quiet -m close-b

  git -C "${git_project}" checkout --quiet close-a

  merge_output=$(
    cd -- "${git_project}/sub/nested"
    node "${scripts_root}/product-backlog-git-merge.mjs" merge \
      --ref close-b --file "${git_backlog_rel}"
  )
  if [[ "${merge_output}" != *'accepted'* ]]; then
    echo "FAIL: the installed Git merge adapter did not report acceptance: ${merge_output}" >&2
    return 1
  fi
  resulting_backlog=$(cat "${git_project}/${git_backlog_rel}")
  expected_backlog=$(printf '%s\n\n%s\n\n%s\n\n%s\n' \
    '# Product backlog' '## Taken' '## Backlog list' "${item_c}")
  if [[ "${resulting_backlog}" != "${expected_backlog}" ]]; then
    echo 'FAIL: the installed Git merge adapter did not reconcile both independent closures.' >&2
    printf 'Expected:\n%s\nActual:\n%s\n' "${expected_backlog}" "${resulting_backlog}" >&2
    return 1
  fi
  if git -C "${git_project}" status --porcelain | grep -q .; then
    echo 'FAIL: the merge was not committed cleanly.' >&2
    return 1
  fi
  parents=$(git -C "${git_project}" rev-list --parents -n 1 HEAD | wc -w)
  if [[ "${parents}" -lt 3 ]]; then
    echo 'FAIL: HEAD is not a real two-parent merge commit.' >&2
    return 1
  fi
}
