#!/usr/bin/env bash
# Two dashboard suite runs started together from one checkout each build and
# serve their own assets: both pass and print nothing, neither touches the
# production build in `dashboard/dist` (present or absent), and neither leaves
# its private build behind. The runs are local ones, as on a developer
# machine, so CI's own settings are not passed on.
set -euo pipefail

source_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)
temporary_dir=$(mktemp -d)
trap 'rm -rf -- "${temporary_dir}"' EXIT
builds="${temporary_dir}/tmp"
mkdir -- "${builds}"

# The production build's state: absent, or its directory's and entry page's
# modification times.
dist_state() {
  node -e '
    const fs = require("node:fs");
    const dist = process.argv[1];
    if (!fs.existsSync(dist)) {
      console.log("absent");
    } else {
      const page = dist + "/index.html";
      console.log(fs.statSync(dist).mtimeMs,
        fs.existsSync(page) ? fs.statSync(page).mtimeMs : "no-page");
    }
  ' "${source_dir}/dashboard/dist"
}

run_suite() {
  (
    cd -- "${source_dir}"
    # Drop FORCE_COLOR / NO_COLOR so a coloured coordinator shell cannot make
    # Playwright warn outside a test and fail this local concurrent contract.
    # The HTTP icon check serves built files through preview and works in the
    # npm test job, which has no installed browser.
    exec env -u CI -u NODE_ENV -u npm_config_local_prefix \
      -u OPEN_DOUGH_DASHBOARD_SPLIT -u OPEN_DOUGH_DASHBOARD_DEADLINE_MS \
      -u OPEN_DOUGH_DASHBOARD_PROOF_RECORD -u OPEN_DOUGH_DASHBOARD_TIMES \
      -u FORCE_COLOR -u NO_COLOR \
      TMPDIR="${builds}" \
      OPEN_DOUGH_DASHBOARD_ARTIFACT_TRACE="${temporary_dir}/$1.artifacts" \
      npm run --silent test:dashboard -- \
      'dashboard/backend-tests/runtime/serving-modes[.]spec[.]ts$' \
      --grep "both serve Open Dough's declared icon exports"
  ) > "${temporary_dir}/$1.out" 2>&1
}

dist_before=$(dist_state)
run_suite first &
first=$!
run_suite second &
second=$!
first_status=0 second_status=0
wait "${first}" || first_status=$?
wait "${second}" || second_status=$?

for run in first second; do
  if [[ -s ${temporary_dir}/${run}.out ]]; then
    printf 'FAIL: the %s concurrent dashboard run printed:\n' "${run}" >&2
    cat -- "${temporary_dir}/${run}.out" >&2
    exit 1
  fi
done
if ((first_status != 0 || second_status != 0)); then
  printf 'FAIL: concurrent dashboard runs exited %s and %s.\n' \
    "${first_status}" "${second_status}" >&2
  exit 1
fi
node --input-type=module - "${temporary_dir}/first.artifacts" "${temporary_dir}/second.artifacts" << 'JS'
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

const builds = process.argv.slice(2).map((record) => {
  const events = readFileSync(record, "utf8").trim().split("\n")
    .map((line) => JSON.parse(line));
  const appEvents = events.filter(({ key }) => key === "app");
  const starts = appEvents.filter(({ event }) => event === "start");
  const completed = appEvents.filter(({ event }) => event === "complete");
  assert.equal(starts.length, 1, `Expected one app build start in ${record}`);
  assert.equal(completed.length, 1, `Expected one completed app build in ${record}`);
  const { directory } = completed[0];
  assert.equal(directory, starts[0].directory);
  assert.equal(existsSync(directory), false, `Expected ${directory} to be removed`);
  return directory;
});
assert.notEqual(builds[0], builds[1], "Each run must build to its own directory");
JS
dist_after=$(dist_state)
if [[ ${dist_after} != "${dist_before}" ]]; then
  printf 'FAIL: dashboard/dist changed during the runs (%s, then %s).\n' \
    "${dist_before}" "${dist_after}" >&2
  exit 1
fi
leftover=$(find "${builds}" -maxdepth 1 -name 'dough-dashboard-build-*')
if [[ -n ${leftover} ]]; then
  printf 'FAIL: a run left its private build behind: %s\n' "${leftover}" >&2
  exit 1
fi
