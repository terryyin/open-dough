#!/usr/bin/env bash
# ODF-354 controlled replay: a Story Branch execution delivering slice 3 while
# trunk moved after the Take. The workspace is the owned execution checkout on
# exec/export-readings, forked at the Take and published to a bare origin, as
# the Story Branch closure fixture shapes them; another writer's clone then
# pushes the scenario's trunk commits and is removed. Nothing in the workspace,
# its execution state or the commit messages names what trunk changed.
#   story-amended      a Decision-binding promise and example 4 in the story
#                      section, and slice 5 in the plan (the ODF-354 shape)
#   plan-amended       slice 4's proof wording tightened
#   unrelated-advance  a sibling story's edit, a release and a trunk-only file
#   conflict           done slice 2's behavior rewritten
# Each delivered stage's product source comes from …-product-content.sh.
# shellcheck disable=SC2016,SC2154,SC2312 # Literal fixture code; root and source globals.

# shellcheck disable=SC1091
source "${delivery_evidence_support_dir}/delivery-evidence-amended-native-product-content.sh"

delivery_evidence_amended_identity='SEED-042#export-readings'
delivery_evidence_amended_branch=exec/export-readings
delivery_evidence_amended_seed=.planning/seeds/SEED-042-soil-readings.md
delivery_evidence_amended_plan=.planning/slice-plans/007-export-readings/PLAN.md

# Replaces each OLD with NEW in FILE, requiring every OLD to occur once.
delivery_evidence_amended_replace() {
  python3 - "$@" << 'PY'
import sys
from pathlib import Path
path = Path(sys.argv[1])
text = path.read_text()
pairs = sys.argv[2:]
for old, new in zip(pairs[::2], pairs[1::2]):
    assert text.count(old) == 1, (path, old)
    text = text.replace(old, new)
path.write_text(text)
PY
}

# The project as it stood before the Take: product data, guidance and the
# seed, with the story still queued.
delivery_evidence_amended_write_base() {
  local workspace=$1 fixture_dir=$2
  mkdir -p -- "${workspace}/data" "${workspace}/.planning/seeds"
  printf '%s\n' '.agents/' '.claude/' '.codex/' '.cursor/' \
    '.planning/execution-state.txt' > "${workspace}/.gitignore"
  cat > "${workspace}/AGENTS.md" << 'EOF'
# Soil readings

A small Node project; it has no dependencies or build step.

- Proof: `node --test tests/*.test.mjs` runs every test.
- Formatting: the project has no formatter or generator, so formatting is a
  no-op.
EOF
  printf '# Soil readings\n\nLog soil moisture per bed and review it.\n' \
    > "${workspace}/README.md"
  printf '%s\n' '[' \
    '  { "date": "2026-05-01", "bed": "West", "moisture": 0.4 },' \
    '  { "date": "2026-05-02", "bed": "North, raised", "moisture": 0.31 }' \
    ']' > "${workspace}/data/readings.json"
  cp -- "${fixture_dir}/amended-seed.md" "${workspace}/${delivery_evidence_amended_seed}"
  cp -- "${fixture_dir}/amended-backlog.md" "${workspace}/.planning/PRODUCT-BACKLOG.md"
  delivery_evidence_amended_replace "${workspace}/.planning/PRODUCT-BACKLOG.md" \
    $'- [Export readings as CSV](seeds/SEED-042-soil-readings.md#export-readings) — SEED-042#export-readings ([plan](slice-plans/007-export-readings/PLAN.md))\n\n' '' \
    $'## Backlog list\n\n' \
    $'## Backlog list\n\n- [Export readings as CSV](seeds/SEED-042-soil-readings.md#export-readings) — SEED-042#export-readings\n'
}

# Marks the slice under HEADING done in PLAN and, when given, appends LEARNING
# under the plan's Learnings.
delivery_evidence_amended_mark_done() {
  local plan=$1 heading=$2 learning=${3:-}
  python3 - "${plan}" "${heading}" "${learning}" << 'PY'
import sys
from pathlib import Path
path, heading, learning = Path(sys.argv[1]), sys.argv[2], sys.argv[3]
text = path.read_text()
start = text.index(heading)
status = text.index("Status: planned", start)
text = text[:status] + "Status: done" + text[status + len("Status: planned"):]
if learning:
    text = text.replace("## Learnings\n\nNone yet.\n", "## Learnings\n\n") + learning + "\n"
path.write_text(text)
PY
}

# Another writer's trunk commits for SCENARIO, made in clone WRITER.
delivery_evidence_amended_advance_trunk() {
  local writer=$1 scenario=$2
  local seed="${writer}/${delivery_evidence_amended_seed}"
  local plan="${writer}/${delivery_evidence_amended_plan}"
  case ${scenario} in
    story-amended)
      delivery_evidence_amended_replace "${seed}" \
        $'- The README documents the command.\n' \
        $'- The README documents the command.\n- **Decision:** moisture is written with exactly one decimal place, and a\n  reading without a moisture value exports an empty moisture cell, never `0`\n  or `undefined`.\n' \
        $'   the May 2 row follows the header.\n' \
        $'   the May 2 row follows the header.\n4. A reading with moisture `0.42` and one logged without moisture → their\n   moisture cells are `0.4` and empty.\n'
      delivery_evidence_amended_replace "${plan}" \
        $'output.\n\n## Learnings' \
        $'output.\n\n### 5. Write moisture with one decimal and leave missing values empty\nType: Behavior\nStatus: planned\nProof: `node --test tests/export.test.mjs` covers example 4 through\n`exportCsv` and `bin/export.mjs`.\n\nBehavior: the moisture cell is the value with one decimal place, or empty\nwhen the reading has no moisture value.\n\n## Learnings'
      delivery_evidence_git "${writer}" commit --quiet -am 'Planning update'
      ;;
    plan-amended)
      delivery_evidence_amended_replace "${plan}" \
        $'Proof: the README\'s example command, run as written, prints its documented\noutput.' \
        $'Proof: `node --test tests/readme.test.mjs` runs the README\'s example command\nagainst `data/readings.json` and compares its output with the README\'s\ndocumented block.'
      delivery_evidence_git "${writer}" commit --quiet -am 'Planning update'
      ;;
    unrelated-advance)
      delivery_evidence_amended_replace "${seed}" \
        'prints one line per bed with its mean' \
        'prints one line per bed with its mean and lowest'
      delivery_evidence_git "${writer}" commit --quiet -am 'Planning update'
      mkdir -p -- "${writer}/docs"
      printf '# Watering\n\nWater a bed when its moisture falls below 0.2.\n' \
        > "${writer}/docs/watering.md"
      delivery_evidence_git "${writer}" add docs
      delivery_evidence_git "${writer}" commit --quiet -m 'Add watering notes'
      printf '1.4.0\n' > "${writer}/VERSION"
      printf '# Changelog\n\n## 1.4.0\n\n- Watering notes.\n' > "${writer}/CHANGELOG.md"
      delivery_evidence_git "${writer}" add VERSION CHANGELOG.md
      delivery_evidence_git "${writer}" commit --quiet -m 'Release 1.4.0'
      ;;
    conflict)
      delivery_evidence_amended_replace "${plan}" \
        $'Behavior: a cell containing `,` or `"` is wrapped in double quotes with inner\nquotes doubled; other cells are written as they are.' \
        $'Behavior: every cell is wrapped in double quotes, with inner quotes doubled,\nso a spreadsheet never splits or retypes a value.'
      delivery_evidence_git "${writer}" commit --quiet -am 'Planning update'
      ;;
    *) return 2 ;;
  esac
}

delivery_evidence_amended_populate_fixture() {
  local workspace=$1 scenario=$2 fixture_dir origin writer take head plan
  fixture_dir="${source_dir}/tests/fixtures/delivery-evidence"
  origin="${delivery_evidence_root}/origin.git"
  writer="${delivery_evidence_root}/writer"
  plan="${workspace}/${delivery_evidence_amended_plan}"
  git init --bare --quiet -b main "${origin}"
  delivery_evidence_git "${workspace}" remote add origin "${origin}"

  delivery_evidence_amended_write_base "${workspace}" "${fixture_dir}"
  delivery_evidence_git "${workspace}" add -A
  delivery_evidence_git "${workspace}" commit --quiet -m 'Soil readings project'
  mkdir -p -- "$(dirname -- "${plan}")"
  cp -- "${fixture_dir}/amended-plan.md" "${plan}"
  cp -- "${fixture_dir}/amended-backlog.md" "${workspace}/.planning/PRODUCT-BACKLOG.md"
  delivery_evidence_git "${workspace}" add -A
  delivery_evidence_git "${workspace}" commit --quiet \
    -m "Take ${delivery_evidence_amended_identity}"
  take=$(git -C "${workspace}" rev-parse HEAD)
  delivery_evidence_git "${workspace}" push --quiet origin main
  delivery_evidence_git "${workspace}" switch --quiet -c "${delivery_evidence_amended_branch}"
  delivery_evidence_git "${workspace}" branch --quiet -D main

  delivery_evidence_amended_write_product "${workspace}" slice1
  delivery_evidence_amended_mark_done "${plan}" '### 1. ' \
    '- Slice 1: rows are joined with `\n` and no trailing newline; the command adds it.'
  delivery_evidence_git "${workspace}" add -A
  delivery_evidence_git "${workspace}" commit --quiet -m 'Export rows in date order under a header'
  delivery_evidence_amended_write_product "${workspace}" slice2
  delivery_evidence_amended_mark_done "${plan}" '### 2. ' \
    '- Slice 2: only `,` and `"` trigger quoting; newlines in cells are out of scope.'
  delivery_evidence_git "${workspace}" add -A
  delivery_evidence_git "${workspace}" commit --quiet -m 'Quote cells that hold a comma or a quote'
  head=$(git -C "${workspace}" rev-parse HEAD)
  delivery_evidence_git "${workspace}" push --quiet -u origin \
    "${delivery_evidence_amended_branch}"

  git clone --quiet "${origin}" "${writer}"
  delivery_evidence_amended_advance_trunk "${writer}" "${scenario}"
  delivery_evidence_git "${writer}" push --quiet origin main
  rm -rf -- "${writer}"

  delivery_evidence_amended_write_product "${workspace}" slice3
  {
    printf '# Slice 3 accepted proof\n\n'
    printf 'proof:\n  command: node --test tests/cli.test.mjs\n'
    printf '  covers: example 3 and the unfiltered output of bin/export.mjs\n'
    printf '  boundary: bin/export.mjs process output\n  observations:\n'
    printf '    - tests/cli.test.mjs "since keeps readings on or after the date"\n'
    printf '    - tests/cli.test.mjs "without since prints every reading"\n'
    printf '  setup: a temporary readings file\n  result: pass\n\n'
    printf 'Independent refactor: complete with no edits (REFACTOR COMPLETE).\n'
    printf 'Formatting: no-op; the project has no formatter.\n\nRuntime: '
    node --version
    printf '\nObserved terminal result:\n```\n'
    (cd -- "${workspace}" && node --test --test-reporter=tap tests/cli.test.mjs)
    printf '```\n'
  } > "${workspace}/.planning/slice-3-proof.md"
  printf '%s\n' 'Execution mode: Story Branch Mode' \
    "Selected work: ${delivery_evidence_amended_identity}, Taken on trunk" \
    "Active plan: ${delivery_evidence_amended_plan}" \
    'Authorized remote: origin' 'Trunk: main' \
    "Execution branch: ${delivery_evidence_amended_branch}, published to origin" \
    "Execution checkout: ${workspace}, owned by this execution" \
    "Delivered slices: 1 and 2, published to origin ${delivery_evidence_amended_branch} at ${head}" \
    'Current slice: 3; implementation, independent refactor, formatting and proof acceptance are complete; accepted proof is in .planning/slice-3-proof.md; delivery has not started' \
    > "${workspace}/.planning/execution-state.txt"
  printf '%s\n' "origin: ${origin}" "take: ${take}" "branch-head: ${head}" \
    "trunk-before: $(git -C "${origin}" rev-parse refs/heads/main)" \
    > "${delivery_evidence_root}/amended-fixture.txt"
}
