#!/usr/bin/env bash
# shellcheck disable=SC1091,SC2312 # Sourced fixtures supply helpers.
#
# The product backlog's scripts were never declared in install.sh's
# managed_files (only SKILL.md and its two references were), so a real
# install.sh/update delivered the documentation but none of its backlog
# automation. This proves a fresh install and an ordinary update
# deliver the whole transitive script set to both managed roots from each
# physical entry root, and that project backlog bytes are untouched. Refusal
# of an edited or missing managed file and its --force restore belong to the
# shared installation and update checks, not to this payload. The
# offline "actually run the installed copy" proof (an ordinary op, a real
# Git-aware merge, the bounded EISDIR refusal, done catalog adoption and
# completion from both the .agents and .claude roots, and installed
# record-state/read-state producing published bytes the shared reader
# observes) lives in the product-backlog-payload runtime helpers, run at the
# end of this file against the Claude Code root once the release source is
# unavailable. The same offline proof covers the story-state recorder
# modules and record-preparation.md declared here.
set -euo pipefail

source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/../.." && pwd)
source "${source_dir}/Distribution/tests/helpers/public-payload-fixture.bash"
source "${source_dir}/Distribution/tests/helpers/release-fixture.bash"
source "${source_dir}/Distribution/tests/helpers/product-backlog-payload-runtime.bash"
source "${source_dir}/Distribution/tests/helpers/product-backlog-payload-state-runtime.bash"

temporary_dir=$(mktemp -d)
trap 'rm -rf -- "${temporary_dir}"' EXIT
fixture="${temporary_dir}/source"
helper="${source_dir}/Distribution/src/install/open-dough-release.sh"

story_state_payload_files=(
  dough-product-backlog/references/record-preparation.md
  dough-product-backlog/scripts/product-backlog-home-reader.mjs
  dough-product-backlog/scripts/product-backlog-plan-reader.mjs
  dough-product-backlog/scripts/product-backlog-story-purpose.mjs
  dough-product-backlog/scripts/product-backlog-story-state-assessment.mjs
  dough-product-backlog/scripts/product-backlog-story-state-basis.mjs
  dough-product-backlog/scripts/product-backlog-story-state-block.mjs
  dough-product-backlog/scripts/product-backlog-story-state-command.mjs
  dough-product-backlog/scripts/product-backlog-story-state-home.mjs
  dough-product-backlog/scripts/product-backlog-story-state-preparation.mjs
  dough-product-backlog/scripts/product-backlog-story-state.mjs
  dough-product-backlog/scripts/product-backlog-story-dependencies.mjs
  dough-product-backlog/scripts/product-backlog-start-eligibility.mjs
  dough-product-backlog/scripts/product-backlog-accepted-integration.mjs
  dough-product-backlog/scripts/product-backlog-dependency-completion.mjs
  dough-product-backlog/scripts/product-backlog-dependency-consumers.mjs
  dough-product-backlog/scripts/product-backlog-dependency-resolution.mjs
  dough-product-backlog/references/supplier-dependencies.md
  dough-product-backlog/scripts/product-backlog-story-dependencies-command.mjs
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

older="${temporary_dir}/older"
# Model the release this repository actually shipped until scripts (and later
# the story-state recorder modules / record-preparation procedure) were
# declared: docs could install, but the automation and shared procedure did not.
node "${source_dir}/Distribution/tests/support/release-source.mjs" "${fixture}" << 'JSON'
{"revisions": [
  {"name": "release 0.1.1 before-backlog-scripts", "release": {
    "version": "0.1.1", "taggedAt": "2026-09-01T00:00:00",
    "marker": "before-backlog-scripts",
    "withheld": ["dough-product-backlog/scripts/",
      "dough-product-backlog/references/record-preparation.md"],
    "removed": ["dough-product-backlog/scripts",
      "dough-product-backlog/references/record-preparation.md"]}},
  {"name": "release 0.1.2 with-backlog-scripts", "release": {
    "version": "0.1.2", "taggedAt": "2026-09-02T00:00:00",
    "marker": "with-backlog-scripts"}}
]}
JSON
checkout_tagged_release "${fixture}" "${older}" 0.1.1

project_backlog_rel='.planning/PRODUCT-BACKLOG.md'
write_project_backlog_sentinel() {
  local target=$1
  mkdir -p -- "${target}/$(dirname -- "${project_backlog_rel}")"
  node "${source_dir}/Distribution/tests/support/render-published-backlog.mjs" \
    > "${target}/${project_backlog_rel}" << 'JSON'
{"queued":[{"identity":"EXISTING#pre-existing","href":"seeds/EXISTING.md#pre-existing","title":"Pre-existing project work"}]}
JSON
}

# The codex and cursor hints select the same .agents entry root, so cursor
# represents both; claude reads the .claude entry root.
for platform in cursor claude; do
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
done

# Real installed use, with the release source unavailable: the Claude Code
# root's installed copies are invoked directly, never the source repository,
# proving no relative import or path reaches back to it. Verifies required
# imports actually load (an ordinary op and a real non-fast-forward Git
# merge, both exercising the transitive closure of the declared files), not
# merely that files exist. It also records preparation through the
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
# The done catalog is rebuilt and completed from each platform's own root:
# Codex and Cursor share the .agents root, Claude Code reads the .claude root.
agents_scripts_root=$(cd "${temporary_dir}/cursor/.agents/skills/dough-product-backlog/scripts" && pwd -P)
run_offline_done_catalog_proof "${agents_scripts_root}" "${temporary_dir}/cursor/catalog-project"
run_offline_done_catalog_proof "${scripts_root}" "${claude_target}/catalog-project"
# The Git merge adapter keeps the done catalog current from each root too.
run_offline_git_merge_proof "${agents_scripts_root}" "${temporary_dir}/cursor"
run_offline_git_merge_proof "${scripts_root}" "${claude_target}"
run_offline_record_state_and_reader_proof \
  "${scripts_root}" \
  "${installed_skill}" \
  "${claude_target}" \
  "${temporary_dir}"

# The identity declaration reader must work from either installed root after
# its release source has gone away, including legacy records and context.
for runtime in "${agents_scripts_root}" "${scripts_root}"; do
  node --input-type=module - "${runtime}/product-backlog.mjs" "${temporary_dir}" << 'NODE'
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
const [cli, temporary] = process.argv.slice(2);
const root = mkdtempSync(join(temporary, 'installed-identities-'));
const planning = join(root, '.planning');
mkdirSync(join(planning, 'seeds'), { recursive: true });
writeFileSync(join(planning, 'PRODUCT-BACKLOG.md'), '# Product backlog\n\n## Taken\n\n## Backlog list\n');
writeFileSync(join(planning, 'seeds/context.md'), '# Context\n\nReference to SEED-999 is not an allocation.\n');
writeFileSync(join(planning, 'seeds/SEED-100-notes.md'), '# Existing numeric reservation\n');
writeFileSync(join(planning, 'seeds/legacy.md'), '# Old heading layout\n\n**Identity:** scheduler-wake#overdue-jobs\n');
const git = (...args) => execFileSync('git', ['-c', 'user.name=Installed proof', '-c', 'user.email=installed@example.invalid', ...args], { cwd: root, encoding: 'utf8' }).trim();
git('init', '--quiet');
git('add', '-A');
git('commit', '--quiet', '-m', 'Legacy identity evidence');
git('rm', '--quiet', '.planning/seeds/legacy.md');
git('commit', '--quiet', '-m', 'Closed legacy home');
const snapshot = () => readdirSync(planning, { recursive: true }).sort().map(name => {
  const file = join(planning, name);
  return [name, name === 'seeds' ? '(directory)' : readFileSync(file, 'utf8')];
});
const before = snapshot();
const head = git('rev-parse', 'HEAD');
const report = JSON.parse(execFileSync(process.execPath, [cli, 'identity-evidence', '--identity', 'scheduler-wake#overdue-jobs'], { cwd: root, encoding: 'utf8' }));
assert.deepEqual(report.gaps, []);
assert.equal(report.highest.seed, 'SEED-100');
assert.equal(report.next, 'SEED-101');
assert.equal(report.candidate.status, 'in-history');
assert.equal(report.candidate.history.story.evidence, 'seeds/legacy.md');
assert.deepEqual(snapshot(), before);
assert.equal(git('rev-parse', 'HEAD'), head);
NODE
done
