#!/usr/bin/env bash
# shellcheck disable=SC2034,SC2154,SC2312 # Sourcing script sets set -euo pipefail; globals cross functions.
# Shared setup and assertions for the product backlog's native
# installed-workflow-use proof (tests/product-backlog-native.sh --case use).
#
# A fresh native session is asked, in ordinary language naming neither a script
# nor a verb, to integrate one branch's backlog change into another. It must
# discover and run the installed
# product-backlog-git-merge.mjs adapter for itself, hit its real `conflict`
# stop on a genuine two-sided rename dispute, and report it plainly without
# forcing past it. After explicit human repair -- here, this test script
# itself supplies the resolved backlog and stages it, playing the human's
# role -- a second fresh native session resumes through the same adapter's
# `continue` verb and completes a real two-parent merge commit.

use_backlog_rel='.planning/PRODUCT-BACKLOG.md'
use_driver_config_key='merge.dough-product-backlog.driver'

# Write the whole backlog for a given "Item C" title; the complete known shape
# avoids brittle search-and-replace over the entry's own Markdown syntax.
use_write_backlog() {
  local target=$1
  local item_c_title=$2
  mkdir -p -- "${target}/$(dirname -- "${use_backlog_rel}")"
  cat > "${target}/${use_backlog_rel}" << EOF
# Product backlog

## Taken

## Backlog list

- [Item A](seeds/A.md#a)
- [Item B](seeds/B.md#b)
- [${item_c_title}](seeds/C.md#c)
EOF
}

use_commit_all() {
  local target=$1
  local message=$2
  git -C "${target}" -c user.name='Use fixture' \
    -c user.email='fixture@example.invalid' add -A
  git -C "${target}" -c user.name='Use fixture' \
    -c user.email='fixture@example.invalid' commit --quiet -m "${message}"
}

use_assert_codex_call() {
  local transcript=$1
  local invocation=$2
  local label=$3
  if ! grep -F '"type":"item.started"' "${transcript}" \
    | grep -Fq "${invocation}"; then
    printf 'FAIL: native Codex transcript did not show the installed merge adapter %s call.\n' \
      "${label}" >&2
    return 1
  fi
}

use_native_cleanup() {
  local status=$?
  local output
  if [[ ${status} -eq 0 ]]; then
    rm -rf -- "${temporary_dir}"
    return
  fi
  printf '\nFAIL: preserving native %s installed-workflow-use evidence after status %s.\n' \
    "${use_host_name}" "${status}" >&2
  for output in "${temporary_dir}"/native-use-*-output.md; do
    [[ -f ${output} ]] || continue
    printf '%s\n' "--- $(basename -- "${output}") ---" >&2
    cat "${output}" >&2
  done
  printf 'PRESERVED: %s\n' "${temporary_dir}" >&2
}

use_run_native() {
  local source_dir=$1
  local host=$2
  local target
  case ${host} in
    claude)
      use_host_name='Claude Code'
      use_skill_root='.claude/skills'
      ;;
    codex)
      use_host_name='Codex'
      use_skill_root='.agents/skills'
      ;;
    *)
      echo "FAIL: unsupported native use host '${host}'." >&2
      return 2
      ;;
  esac
  # Not `local`: use_native_cleanup's EXIT trap reads this after this
  # function returns.
  temporary_dir=$(mktemp -d)
  target="${temporary_dir}/project"
  mkdir -p -- "${target}"
  use_write_backlog "${target}" 'Item C'

  bash "${source_dir}/install.sh" --target "${target}" --source "${source_dir}" \
    --platform "${host}" > /dev/null
  if [[ ${host} == codex ]]; then
    guard_assert_registered "${target}" codex
  fi

  git -C "${target}" init --quiet -b main
  use_commit_all "${target}" 'fixture: installed baseline with backlog'

  git -C "${target}" checkout --quiet -b close-a
  use_write_backlog "${target}" 'Item C1'
  use_commit_all "${target}" 'close-a: rename item C'
  git -C "${target}" checkout --quiet main

  git -C "${target}" checkout --quiet -b close-b
  use_write_backlog "${target}" 'Item C2'
  use_commit_all "${target}" 'close-b: rename item C'

  git -C "${target}" checkout --quiet close-a

  trap use_native_cleanup EXIT

  if [[ ${host} == codex ]]; then
    native_codex_prepare "${temporary_dir}" "${source_dir}"
  fi

  run_native_use() {
    local output_file=$1
    local prompt=$2
    local transcript=${3:-}
    if [[ ${host} == codex ]]; then
      native_codex_run \
        "${target}" "${output_file}" "${prompt}" "${transcript}" \
        bypass-hook-trust
      return
    fi
    (
      cd -- "${target}" || exit
      claude --print --dangerously-skip-permissions --no-session-persistence \
        "${prompt}"
    ) > "${output_file}" 2>&1
  }

  local merge_output="${temporary_dir}/native-use-merge-output.md"
  local merge_transcript="${temporary_dir}/native-use-merge-transcript.jsonl"
  run_native_use "${merge_output}" \
    "Branch 'close-b' in this repository has its own change to this project's backlog that needs to be combined into the branch checked out right now. Integrate close-b's backlog change into the current branch, following this project's installed guidance for combining backlog changes across branches. Report plainly what happens, including whether you reach a stop that needs a human decision, and do not force past any such stop." \
    "${merge_transcript}"

  if [[ ${host} == codex ]]; then
    use_assert_codex_call "${merge_transcript}" \
      '.agents/skills/dough-product-backlog/scripts/product-backlog-git-merge.mjs merge --ref close-b' \
      merge
  fi

  if ! grep -Eiq 'conflict|stop|human' "${merge_output}"; then
    echo 'FAIL: native output did not report a conflict/stop needing a human decision.' >&2
    exit 1
  fi
  if [[ ! -f "${target}/.git/MERGE_HEAD" ]]; then
    echo 'FAIL: native session did not leave Git genuinely mid-merge.' >&2
    exit 1
  fi
  if ! git -C "${target}" ls-files -u -- "${use_backlog_rel}" | grep -q .; then
    echo 'FAIL: the backlog path is not left unresolved in the index.' >&2
    exit 1
  fi
  if ! grep -Fq "${use_backlog_rel} merge=dough-product-backlog" \
    "${target}/.git/info/attributes" 2> /dev/null; then
    echo 'FAIL: the installed Git merge driver was never registered -- the native session likely ran a raw git merge instead of the installed adapter.' >&2
    exit 1
  fi
  if ! git -C "${target}" config --get "${use_driver_config_key}" \
    | grep -Fq 'product-backlog-git-driver.mjs'; then
    echo 'FAIL: the registered merge driver does not point at the installed product-backlog-git-driver.mjs.' >&2
    exit 1
  fi
  local worktree_conflict
  worktree_conflict=$(cat "${target}/${use_backlog_rel}")
  if [[ "${worktree_conflict}" != *'<<<<<<< ours'* || "${worktree_conflict}" != *'>>>>>>> theirs'* ]]; then
    echo 'FAIL: the worktree conflict markers do not match the installed adapter shared resolver shape.' >&2
    exit 1
  fi
  if [[ "${worktree_conflict}" != *'different titles'* ]]; then
    echo 'FAIL: the conflict explanation is missing the domain-specific dispute this project reports.' >&2
    exit 1
  fi

  # Explicit human repair: the test script itself supplies the resolved
  # backlog content and stages it, playing the human's role.
  local resolved="${temporary_dir}/resolved-backlog.md"
  cat > "${resolved}" << 'EOF'
# Product backlog

## Taken

## Backlog list

- [Item A](seeds/A.md#a)
- [Item B](seeds/B.md#b)
- [Item C, resolved by hand](seeds/C.md#c)
EOF
  cp -- "${resolved}" "${target}/${use_backlog_rel}"
  git -C "${target}" add -- "${use_backlog_rel}"

  local continue_output="${temporary_dir}/native-use-continue-output.md"
  local continue_transcript="${temporary_dir}/native-use-continue-transcript.jsonl"
  run_native_use "${continue_output}" \
    "The backlog integration from branch close-b was stopped earlier by a real conflict. A human has now resolved the backlog file by hand and staged it with git add. Resume and complete that same integration now, following this project's installed guidance, and report plainly whether it completed." \
    "${continue_transcript}"

  if [[ ${host} == codex ]]; then
    use_assert_codex_call "${continue_transcript}" \
      '.agents/skills/dough-product-backlog/scripts/product-backlog-git-merge.mjs continue' \
      continue
  fi

  if [[ -f "${target}/.git/MERGE_HEAD" ]]; then
    echo 'FAIL: native session did not complete the merge -- MERGE_HEAD still present.' >&2
    exit 1
  fi
  if git -C "${target}" ls-files -u | grep -q .; then
    echo 'FAIL: unresolved paths remain after the native session claimed completion.' >&2
    exit 1
  fi
  if [[ "$(cat "${target}/${use_backlog_rel}")" != "$(cat "${resolved}")" ]]; then
    echo 'FAIL: the completed merge does not hold the human-resolved backlog bytes exactly.' >&2
    exit 1
  fi
  local parents
  parents=$(git -C "${target}" rev-list --parents -n 1 HEAD | wc -w)
  if [[ "${parents}" -lt 3 ]]; then
    echo 'FAIL: HEAD is not a real two-parent merge commit.' >&2
    exit 1
  fi
  if ! grep -Eiq 'complet|accept|merge|finish' "${continue_output}"; then
    echo 'FAIL: native continue output did not report completion.' >&2
    exit 1
  fi

  native_tool_version=$(${host} --version)
  printf 'Native tool version: %s\n' "${native_tool_version}"
  printf 'Candidate: %s\n' \
    "${use_skill_root}/dough-product-backlog/scripts/product-backlog-git-merge.mjs"
  printf '%s\n' \
    "PASS: a fresh native ${use_host_name} session discovered and ran the installed product-backlog-git-merge.mjs adapter, not a raw git merge, for an ordinary-language backlog integration request naming neither the script nor its verb." \
    "PASS: the session reached the adapter's real conflict stop -- Git genuinely mid-merge, the backlog path genuinely unresolved in the index, real adapter-authored conflict markers on disk -- and reported it plainly instead of forcing past it." \
    "PASS: after explicit human repair, a second fresh native session resumed through the same adapter's continue verb and completed a real two-parent merge commit holding the human-resolved bytes exactly."
}
