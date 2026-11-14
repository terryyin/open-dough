#!/usr/bin/env bash
# The actual native Take fixture stays claimable through its installed writer.
# shellcheck disable=SC2154 # Take identity and paths come from the sourced fixture.
set -euo pipefail

source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/../.." && pwd)
# shellcheck source=Distribution/tests/support/product-backlog-native-take.sh
# shellcheck disable=SC1091
source "${source_dir}/Distribution/tests/support/product-backlog-native-take.sh"

work_dir=$(mktemp -d)
trap 'rm -rf -- "${work_dir}"' EXIT
target="${work_dir}/project"
take_write_fixture "${target}"
bash "${source_dir}/install.sh" --target "${target}" --source "${source_dir}" \
  --platform claude > /dev/null
take_record_preparation "${target}"
cp -- "${target}/${take_seed_rel}" "${work_dir}/seed-before.md"
(
  cd -- "${target}"
  node .claude/skills/dough-product-backlog/scripts/product-backlog.mjs \
    read-state --link "${take_href}"
) > "${work_dir}/preparation.json"
node --input-type=module - "${target}" "${work_dir}/preparation.json" "${take_identity}" << 'NODE'
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
const [target, stateFile, identity] = process.argv.slice(2);
const parser = `${target}/.claude/skills/dough-product-backlog/scripts/product-backlog-document.mjs`;
const { parseBacklog } = await import(pathToFileURL(parser).href);
const document = parseBacklog(readFileSync(`${target}/.planning/PRODUCT-BACKLOG.md`, "utf8"));
assert.deepEqual(document.entries.map(({ list, identity }) => ({ list, identity })), [
  { list: "Backlog list", identity },
]);
const state = JSON.parse(readFileSync(stateFile, "utf8"));
assert.equal(state.refinement, "refined");
assert.deepEqual(state.approach, { kind: "planned", plan: "../slice-plans/101-native-claim/PLAN.md" });
assert.equal(state.assessment.status, "ready");
NODE

# The unchanged native assertion must detect a queued fixture without a claim.
if take_assert_backlog "${target}" > "${work_dir}/without-claim.log" 2>&1; then
  echo 'FAIL: native Take assertion accepted the fixture without a claim.' >&2
  exit 1
fi
grep -Fq 'selected story should be Taken' "${work_dir}/without-claim.log"

(
  cd -- "${target}"
  node .claude/skills/dough-product-backlog/scripts/product-backlog.mjs \
    take --identity "${take_identity}" --plan "${take_plan_from_backlog}" > /dev/null
)
take_assert_backlog "${target}"
cmp -- "${work_dir}/seed-before.md" "${target}/${take_seed_rel}"
