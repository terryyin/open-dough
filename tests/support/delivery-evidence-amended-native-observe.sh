#!/usr/bin/env bash
# Observes the source records and trunk after a coordinator reached slice 3's
# delivery boundary: the agent's freshness commands and their printed results
# from the host stream, each record's branch copy against the Take and trunk
# texts read from origin, the candidate's own freshness check of the final
# workspace, the plan's statuses and obligations, whether trunk content
# reached the branch, origin trunk before and after, and the response's stop.
# shellcheck disable=SC2154,SC2312

delivery_evidence_amended_fact() {
  delivery_evidence_obs_get "$1" "$2"
}

delivery_evidence_amended_observe() {
  local scenario=$1 workspace=$2 response=$3 transcript=$4
  local evidence_root facts origin take head trunk_before trunk_after merged=false
  local trunk_only=false path payload git_dir
  evidence_root=$(dirname -- "${transcript}")
  facts="${evidence_root}/amended-fixture.txt"
  origin=$(delivery_evidence_amended_fact origin "${facts}")
  take=$(delivery_evidence_amended_fact take "${facts}")
  head=$(delivery_evidence_amended_fact branch-head "${facts}")
  trunk_before=$(delivery_evidence_amended_fact trunk-before "${facts}")
  if [[ -s ${transcript} && -n ${native_case_host:-} ]]; then
    native_host_stream "${native_case_host}" "${transcript}" calls \
      > "${evidence_root}/command-results.jsonl"
  else
    : > "${evidence_root}/command-results.jsonl"
  fi
  git -C "${workspace}" status --porcelain=v1 > "${evidence_root}/final-status.txt"
  git -C "${workspace}" diff > "${evidence_root}/final-product.diff"
  trunk_after=$(git -C "${origin}" rev-parse refs/heads/main)
  git_dir=$(git -C "${workspace}" rev-parse --absolute-git-dir)
  if git -C "${workspace}" merge-base --is-ancestor "${trunk_before}" HEAD 2> /dev/null \
    || [[ -e ${git_dir}/MERGE_HEAD || -d ${git_dir}/rebase-merge || -d ${git_dir}/rebase-apply ]]; then
    merged=true
  fi
  while IFS= read -r path; do
    [[ -n ${path} && -e ${workspace}/${path} ]] && trunk_only=true
  done < <(git -C "${origin}" diff --name-only --diff-filter=A \
    "${take}" "${trunk_before}")
  # The candidate's check of the final branch copy, run after the session.
  node "${source_dir}/src/skills/dough-execute-plan/scripts/source-freshness.mjs" \
    check --workspace "${workspace}" --identity "${delivery_evidence_amended_identity}" \
    --remote origin --target-ref refs/heads/main \
    > "${evidence_root}/final-freshness.json" 2> /dev/null || true
  payload=$(delivery_evidence_installed_payload "${source_dir}")

  printf 'scenario: %s\n' "${scenario}"
  printf 'payload: %s\n' "${payload}"
  node --input-type=module - "${source_dir}" "${workspace}" "${origin}" \
    "${take}" "${head}" "${trunk_before}" "${evidence_root}/command-results.jsonl" \
    "${evidence_root}/final-freshness.json" "${response}" \
    "${delivery_evidence_amended_seed}" "${delivery_evidence_amended_plan}" << 'JS'
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
const [source, workspace, origin, take, head, trunk, callsPath, finalPath, responsePath, seedPath, planPath] =
  process.argv.slice(2);
const scripts = join(source, "src/skills");
const { sectionOf } = await import(join(scripts, "dough-execute-plan/scripts/execution-source.mjs"));
const { readPlanSlices } = await import(join(scripts, "dough-product-backlog/scripts/product-backlog-plan-reader.mjs"));
const { readStoryObligations, normalizeStoryQuote } = await import(
  join(scripts, "dough-execute-plan/scripts/story-obligation-reader.mjs"));
const href = "seeds/SEED-042-soil-readings.md#export-readings";
const read = (path) => (existsSync(path) ? readFileSync(path, "utf8") : "");
const show = (cwd, rev, path) => execFileSync("git", ["-C", cwd, "show", `${rev}:${path}`], { encoding: "utf8" });
const section = (text) => sectionOf(text, href)?.text;
const field = (key, value) => console.log(`${key}: ${value}`);

const calls = read(callsPath).split("\n").filter(Boolean).map((line) => JSON.parse(line));
const ran = (verb) => calls.filter(({ command }) =>
  new RegExp(`source-freshness\\.mjs['"]?\\s+${verb}\\b`).test(command));
const results = ran("check").flatMap(({ output }) =>
  [...String(output ?? "").matchAll(/"result":"(\w+)"/g)].map((match) => match[1]));
field("check-ran", ran("check").length > 0);
field("absorb-ran", ran("absorb").length > 0);
field("check-results", results.join(" ") || "none");

const response = read(responsePath);
// Harness correction found by the paid rounds: "surfaced" means the result is
// named in the stream, and a Codex response saying "the absorbed trunk
// amendment" names it without the literal word. "amended" therefore matches
// its word stem (amended, amendment); the other results stay whole words.
const patterns = { unchanged: /\bunchanged\b/i, amended: /\bamend\w*/i, conflict: /\bconflict\b/i };
const names = Object.keys(patterns).filter((word) => patterns[word].test(response));
field("response-names", names.join(" ") || "none");

const baseSection = section(show(origin, take, seedPath));
const trunkSection = section(show(origin, trunk, seedPath));
const branchSection = section(read(join(workspace, seedPath)));
field("story-copy", branchSection === trunkSection ? "trunk" : branchSection === baseSection ? "base" : "other");
let final = {};
try {
  final = JSON.parse(read(finalPath));
} catch {}
const state = (record) =>
  final.result === "refused" || !final.records
    ? "refused"
    : final.records.find((item) => item.record === record)?.state ?? "refused";
field("final-story", state("story"));
field("final-plan", state("plan"));

const plan = read(join(workspace, planPath));
const statuses = (text) => {
  const answer = readPlanSlices(text);
  return answer.status === "interpreted" ? answer.slices : [];
};
const now = statuses(plan);
const committed = statuses(show(workspace, head, planPath));
field("plan-statuses", now.map(({ index, status }) => `${index}:${status}`).join(" ") || "none");
field("done-statuses-kept", committed.filter(({ status }) => status === "done").every(({ index, name }) =>
  now.some((slice) => slice.index === index && slice.name === name && slice.status === "done")));

const { entries } = readStoryObligations(plan);
field("obligations", entries.map(({ id, disposition }) => `${id}=${disposition?.type ?? "none"}`).join(" ") || "none");
const added = (clause) => {
  const quote = normalizeStoryQuote(clause);
  return normalizeStoryQuote(trunkSection).includes(quote) && !normalizeStoryQuote(baseSection).includes(quote);
};
field("amendment-disposition", entries.some((entry) => entry.disposition && entry.storyClause && added(entry.storyClause)));

const stop = `${response}\n${plan}`;
field("awaiting-story-review", /awaiting story review/i.test(stop));
field("conflict-named", stop.includes("PLAN.md") && stop.includes(trunk.slice(0, 7)));
JS
  printf 'trunk-tip-merged: %s\n' "${merged}"
  printf 'trunk-only-file-on-branch: %s\n' "${trunk_only}"
  printf 'origin-trunk-before: %s\n' "${trunk_before}"
  printf 'origin-trunk-after: %s\n' "${trunk_after}"
  printf 'harness-inspected: %s\n' "$(native_harness_inspected 'tests/support/delivery-evidence-.*-native|native harness source|amended-fixture\.txt' "${transcript}" "${response}")"
}

delivery_evidence_amended_retain() {
  local file
  for file in amended-fixture.txt final-freshness.json final-status.txt \
    final-product.diff command-results.jsonl; do
    native_result_copy_if_present "${delivery_evidence_root}/${file}" "${file}"
  done
  mkdir -p -- "${native_result_attempt_dir}/final-product"
  cp -R -- "${delivery_evidence_workspace}/.planning" \
    "${native_result_attempt_dir}/final-product/"
}
