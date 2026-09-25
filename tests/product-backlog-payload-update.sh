#!/usr/bin/env bash
# shellcheck disable=SC1091,SC2154,SC2312 # Sourced fixtures supply helpers and managed_files.
#
# The product backlog's scripts were never declared in the client payload
# manifest (only SKILL.md and its two references were), so a real
# install.sh/update delivered the documentation but none of the automation
# slices 1-4 built. This proves a fresh install and an ordinary update
# deliver the whole transitive script set to both managed roots across all
# three entry contexts, that edited/missing backlog scripts refuse and
# restore by force, and that project backlog bytes are untouched. The
# offline "actually run the installed copy" proof (an ordinary op, a real
# Git-aware merge, the bounded EISDIR refusal, and installed
# record-state/read-state producing published bytes the shared reader
# observes) lives in the product-backlog-payload runtime helpers, run at the
# end of this file against the Claude Code root once the release source is
# unavailable. Slice 12 extends that offline proof to the story-state recorder
# modules and record-preparation.md declared here.
set -euo pipefail

source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)
source "${source_dir}/tests/helpers/public-payload-fixture.bash"
source "${source_dir}/tests/helpers/release-fixture.bash"
source "${source_dir}/tests/helpers/product-backlog-payload-runtime.bash"
source "${source_dir}/tests/helpers/product-backlog-payload-state-runtime.bash"

temporary_dir=$(mktemp -d)
trap 'rm -rf -- "${temporary_dir}"' EXIT
fixture="${temporary_dir}/source"
helper="${source_dir}/src/install/open-dough-release.sh"

story_state_payload_files=(
  dough-product-backlog/references/record-preparation.md
  dough-product-backlog/scripts/product-backlog-home-reader.mjs
  dough-product-backlog/scripts/product-backlog-plan-reader.mjs
  dough-product-backlog/scripts/product-backlog-story-purpose.mjs
  dough-product-backlog/scripts/product-backlog-story-state-assessment.mjs
  dough-product-backlog/scripts/product-backlog-story-state-basis.mjs
  dough-product-backlog/scripts/product-backlog-story-state-block.mjs
  dough-product-backlog/scripts/product-backlog-story-state-home.mjs
  dough-product-backlog/scripts/product-backlog-story-state-preparation.mjs
  dough-product-backlog/scripts/product-backlog-story-state.mjs
)

assert_story_state_payload() {
  local target=$1
  local root relative
  for root in .agents/skills .claude/skills; do
    for relative in "${story_state_payload_files[@]}"; do
      if [[ ! -f "${target}/${root}/${relative}" ]]; then
        echo "FAIL: ${target}/${root}/${relative} was not delivered." >&2
        exit 1
      fi
    done
  done
}

mkdir -p -- "${fixture}"
git -C "${fixture}" init --quiet -b main
git_identity "${fixture}"
write_candidate_payload "${fixture}" 0.1.1 before-backlog-scripts
# Model the release this repository actually shipped until scripts (and later
# the story-state recorder modules / record-preparation procedure) were
# declared: docs could install, but the automation and shared procedure did not.
for script in install.sh src/install/open-dough-release-version.sh; do
  sed \
    -e '/dough-product-backlog\/scripts\//d' \
    -e '/dough-product-backlog\/references\/record-preparation\.md/d' \
    "${fixture}/${script}" > "${fixture}/filtered"
  mv -- "${fixture}/filtered" "${fixture}/${script}"
done
rm -rf -- "${fixture}/src/skills/dough-product-backlog/scripts"
rm -f -- "${fixture}/src/skills/dough-product-backlog/references/record-preparation.md"
commit_all "${fixture}" 'release before backlog scripts were declared'
tag_release "${fixture}" 0.1.1 '2026-09-01T00:00:00'
older="${temporary_dir}/older"
checkout_tagged_release "${fixture}" "${older}" 0.1.1
write_candidate_payload "${fixture}" 0.1.2 with-backlog-scripts
commit_all "${fixture}" 'declare and deliver the full backlog script set'
tag_release "${fixture}" 0.1.2 '2026-09-02T00:00:00'

project_backlog_rel='.planning/PRODUCT-BACKLOG.md'
write_project_backlog_sentinel() {
  local target=$1
  mkdir -p -- "${target}/$(dirname -- "${project_backlog_rel}")"
  cat > "${target}/${project_backlog_rel}" << 'EOF'
# Product backlog

## Taken

## Backlog list

- [Pre-existing project work](seeds/EXISTING.md#pre-existing) — EXISTING#pre-existing
EOF
}

for platform in codex cursor claude; do
  target="${temporary_dir}/${platform}"
  prepare_target "${target}"
  write_project_backlog_sentinel "${target}"
  project_backlog_before=$(cat "${target}/${project_backlog_rel}")

  bash "${older}/install.sh" --target "${target}" --source "${fixture}" --platform "${platform}" > /dev/null
  for root in .agents/skills .claude/skills; do
    if [[ -e "${target}/${root}/dough-product-backlog/scripts" ]]; then
      echo "FAIL: ${platform}: older release already delivered undeclared backlog scripts under ${root}." >&2
      exit 1
    fi
    if [[ -e "${target}/${root}/dough-product-backlog/references/record-preparation.md" ]]; then
      echo "FAIL: ${platform}: older release already delivered undeclared record-preparation.md under ${root}." >&2
      exit 1
    fi
  done
  if [[ "$(cat "${target}/${project_backlog_rel}")" != "${project_backlog_before}" ]]; then
    echo "FAIL: ${platform}: fresh install touched the project's own backlog bytes." >&2
    exit 1
  fi

  bash "${helper}" apply --target "${target}" --platform "${platform}" > /dev/null
  for root in .agents/skills .claude/skills; do
    assert_payload "${target}/${root}/dough-update" 0.1.2 with-backlog-scripts
    if [[ ! -f "${target}/${root}/dough-product-backlog/scripts/product-backlog.mjs" ]]; then
      echo "FAIL: ${platform}: update did not deliver product-backlog.mjs under ${root}." >&2
      exit 1
    fi
  done
  assert_story_state_payload "${target}"
  if [[ "$(cat "${target}/${project_backlog_rel}")" != "${project_backlog_before}" ]]; then
    echo "FAIL: ${platform}: update touched the project's own backlog bytes." >&2
    exit 1
  fi
  assert_sentinels "${target}"

  # Successful delivery traverses the same physical roots for every entry
  # hint, so one representative platform owns the edited/missing-file
  # refusal matrix for the newly-declared backlog scripts.
  if [[ "${platform}" == cursor ]]; then
    for dependency in dough-product-backlog/scripts/product-backlog-git-merge.mjs \
      dough-product-backlog/scripts/product-backlog-git-repository.mjs \
      dough-product-backlog/scripts/product-backlog-story-state.mjs \
      dough-product-backlog/references/record-preparation.md; do
      for change in edit remove; do
        path="${target}/.claude/skills/${dependency}"
        if [[ "${change}" == edit ]]; then
          printf '\n// local edit\n' >> "${path}"
        else
          rm -- "${path}"
        fi
        before=$(snapshot_path_state "${target}")
        if bash "${helper}" apply --target "${target}" --platform "${platform}" > /dev/null 2>&1; then
          echo 'FAIL: changed backlog script accepted by ordinary update.' >&2
          exit 1
        fi
        if bash "${fixture}/install.sh" --target "${target}" --source "${fixture}" --platform "${platform}" > /dev/null 2>&1; then
          echo 'FAIL: changed backlog script accepted by repeat install.' >&2
          exit 1
        fi
        after=$(snapshot_path_state "${target}")
        [[ "${before}" == "${after}" ]]
        bash "${helper}" apply --target "${target}" --platform "${platform}" --force > /dev/null
        assert_payload "${target}/.claude/skills/dough-update" 0.1.2 with-backlog-scripts
      done
    done
    assert_story_state_payload "${target}"
    assert_sentinels "${target}"
  fi
done

# Real installed use, with the release source unavailable: the Claude Code
# root's installed copies are invoked directly, never the source repository,
# proving no relative import or path reaches back to it. Verifies required
# imports actually load (an ordinary op and a real non-fast-forward Git
# merge, both exercising the transitive closure of the declared files), not
# merely that files exist. Slice 12 also records preparation through the
# installed recorder and observes the published bytes with the shared reader.
claude_target="${temporary_dir}/claude"
scripts_root=$(cd "${claude_target}/.claude/skills/dough-product-backlog/scripts" && pwd -P)
installed_skill=$(cd "${claude_target}/.claude/skills/dough-product-backlog" && pwd -P)

fixture_moved="${temporary_dir}/source-removed"
mv -- "${fixture}" "${fixture_moved}"
if [[ -e "${fixture}" ]]; then
  echo 'FAIL: release source fixture is still present; the offline proof would be meaningless.' >&2
  exit 1
fi

run_offline_ordinary_and_eisdir_proof "${scripts_root}" "${claude_target}"
run_offline_git_merge_proof "${scripts_root}" "${claude_target}"
run_offline_record_state_and_reader_proof \
  "${scripts_root}" \
  "${installed_skill}" \
  "${claude_target}" \
  "${temporary_dir}"
