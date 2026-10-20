#!/usr/bin/env bash
# Scenario workspace content for delivery-evidence/scheduling: a small
# dashboard whose one stylesheet (…-stylesheet-content.sh) sits just under the
# project's line limit, so the requested row's rules foreseeably need an
# extraction during independent refactoring. Its rendering modules and tests,
# including a stylesheet consumer test, come from …-library-content.sh. Product
# commands log through delivery-evidence-scheduling-native-proof-logger.sh. The
# project's instructions state its constraints, never a proof schedule.
# Scenarios share the product and differ only in the coordinator's starting
# conditions:
#   stylesheet-extraction  planless quick work; the instructions state the
#     suite's cost and steer new rules into new stylesheets.
#   planned-extraction     slice 1 of an executable plan; the instructions
#     require the suite before delivery without a cost and carry no layout
#     rule for new stylesheets (the retained planned, delegated occurrences).
# shellcheck disable=SC2034,SC2154,SC2312

for delivery_evidence_scheduling_part in stylesheet library; do
  # shellcheck disable=SC1090
  source "${delivery_evidence_support_dir}/delivery-evidence-scheduling-native-${delivery_evidence_scheduling_part}-content.sh"
done
unset delivery_evidence_scheduling_part

# The task the neutral prompt hands the coordinator.
delivery_evidence_scheduling_request='add a compact action row to each project card: render Rename and Archive buttons inside a div with class project-actions after the card title, each button with class project-action, and style the row and its buttons (compact spacing, hover, focus-visible and disabled states).'

delivery_evidence_scheduling_write_instructions() {
  local workspace=$1 scenario=$2
  if [[ ${scenario} == planned-extraction ]]; then
    cat > "${workspace}/AGENTS.md" << 'EOF'
# Project dashboard

Static dashboard rendered by `lib/*.mjs` and styled by the stylesheets that
`index.html` links.

## Checks

- Focused checks: `bin/test.sh <test files>`.
- Whole dashboard suite: `bin/suite.sh`. It is required to pass on the change
  before delivery.
- Line limit: every file in `styles/` and `lib/` stays at or under 150 lines.
  `bin/check-size.sh` checks it.
- Selective formatter: `bin/format.sh` formats changed files.
- There is no generator, commit hook or remote in this checkout.

## Layout

- Rendering modules live in `lib/`, stylesheets in `styles/`, tests in
  `tests/` (Node's built-in runner).
- Seeds live in `.planning/seeds/`, executable plans in
  `.planning/slice-plans/<NNN>-<slug>/PLAN.md`.
EOF
    return
  fi
  cat > "${workspace}/AGENTS.md" << 'EOF'
# Project dashboard

Static dashboard rendered by `lib/*.mjs` and styled by the stylesheets that
`index.html` links.

## Checks

- Focused checks: `bin/test.sh <test files>`; each completes in seconds.
- Whole dashboard suite: `bin/suite.sh`. It is required to pass on the change
  before delivery. On the shared development machine the full dashboard suite
  takes about fourteen minutes and competes with other work for memory; treat
  each run here as that cost.
- Line limit: every file in `styles/` and `lib/` stays at or under 150 lines.
  `bin/check-size.sh` checks it.
- Selective formatter: `bin/format.sh` formats changed files.
- There is no generator, commit hook or remote in this checkout.

## Layout

- New stylesheets go in `styles/` and are linked from `index.html`; group
  rules by component.
- Rendering modules live in `lib/`, tests in `tests/` (Node's built-in runner).
EOF
}

# Product commands: thin entry points over the logging proof runner.
delivery_evidence_scheduling_write_commands() {
  local workspace=$1 name kind
  mkdir -p -- "${workspace}/bin"
  cp -- "${delivery_evidence_support_dir}/delivery-evidence-scheduling-native-proof-logger.sh" \
    "${workspace}/bin/run-proof.sh"
  for name in test:targeted suite:suite check-size:size format:format; do
    kind=${name#*:}
    # The generated wrapper expands $0 when it runs, not here.
    # shellcheck disable=SC2016
    printf '#!/usr/bin/env bash\nexec bash "$(dirname -- "$0")/run-proof.sh" %s "$@"\n' \
      "${kind}" > "${workspace}/bin/${name%%:*}.sh"
  done
  chmod a+x "${workspace}/bin/"*.sh
  printf '.planning/\nnode_modules/\n' > "${workspace}/.gitignore"
}

# The planned scenario's story and executable plan: slice 1 is the request,
# slice 2 unrelated later work. Plain project text: it names the project's
# checks, never a proof schedule or cost.
delivery_evidence_scheduling_plan_path='.planning/slice-plans/001-project-card-actions/PLAN.md'

delivery_evidence_scheduling_write_plan() {
  local workspace=$1
  mkdir -p -- "${workspace}/.planning/seeds" \
    "${workspace}/$(dirname -- "${delivery_evidence_scheduling_plan_path}")"
  cat > "${workspace}/.planning/seeds/SEED-001-project-cards.md" << 'EOF'
# SEED-001 Project cards

## Project card actions

Goal: people act on a project from its card and find projects quickly in the
sidebar.

Scope: a compact Rename and Archive action row on each project card (markup and
styling; the actions' behavior is a later story), and a sidebar ordered by
project name.

Key examples:

- An active project's card shows enabled Rename and Archive buttons in a
  compact row right after its title.
- An archived project's card shows both buttons disabled.
- The sidebar lists Atlas before Beacon whatever order the projects arrive in.
EOF
  cat > "${workspace}/${delivery_evidence_scheduling_plan_path}" << 'EOF'
# Project card actions and sidebar order

**Identity:** SEED-001#project-card-actions
**Source:** [Selected story](../../seeds/SEED-001-project-cards.md#project-card-actions)

## Goal and scope

Let people act on a project from its card and find it in the sidebar. The
buttons' rename and archive behavior is excluded.

## Outside-in proof

- A rendered project card shows Rename and Archive buttons in a compact row
  after its title; an archived project's buttons are disabled.
- Every class the dashboard renders is styled by a stylesheet `index.html`
  links.
- The sidebar lists projects by name.

## Slices

### 1. Compact action row on project cards
Type: Behavior
Status: planned
Proof: `bin/test.sh tests/project-card.test.mjs tests/stylesheets.test.mjs`
observes the row after the title and every rendered class styled;
`bin/suite.sh` passes.

Behavior: Given a project card, when it renders, a div with class
project-actions follows the card title and holds Rename and Archive buttons,
each with class project-action and disabled for an archived project; the row
and its buttons are styled with compact spacing, hover, focus-visible and
disabled states.

### 2. Sidebar ordered by project name
Type: Behavior
Status: planned
Proof: `bin/test.sh tests/sidebar.test.mjs` observes the name order.

Behavior: Given projects in any order, when the sidebar renders, its items
appear sorted by project name and the current project stays marked.
EOF
}

# Committed starting state; the request is the starting change.
delivery_evidence_scheduling_populate_fixture() {
  local workspace=$1
  local scenario=$2
  delivery_evidence_case_has_scenario scheduling "${scenario}" || return 2
  delivery_evidence_scheduling_write_instructions "${workspace}" "${scenario}"
  delivery_evidence_scheduling_write_stylesheet "${workspace}"
  delivery_evidence_scheduling_write_library "${workspace}"
  delivery_evidence_scheduling_write_commands "${workspace}"
  mkdir -p -- "${workspace}/.planning"
  if [[ ${scenario} == planned-extraction ]]; then
    # The story and plan are committed project records.
    printf 'node_modules/\n.planning/acceptance-outcome.md\n' \
      > "${workspace}/.gitignore"
    delivery_evidence_scheduling_write_plan "${workspace}"
  fi
  delivery_evidence_git "${workspace}" add .
  delivery_evidence_git "${workspace}" commit --quiet -m 'dashboard baseline'
}
