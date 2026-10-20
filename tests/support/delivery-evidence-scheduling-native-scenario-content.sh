#!/usr/bin/env bash
# Scenario workspace content for delivery-evidence/scheduling: a small
# dashboard whose one stylesheet (…-stylesheet-content.sh) sits just under the
# project's line limit, so the requested row's rules foreseeably need an
# extraction during independent refactoring. A stylesheet consumer test
# observes that every rendered class is defined by a linked stylesheet. Product commands log through
# delivery-evidence-scheduling-native-proof-logger.sh. The project's
# instructions state its constraints and suite cost, never a proof schedule.
# shellcheck disable=SC2034,SC2154,SC2312

# shellcheck disable=SC1091
source "${delivery_evidence_support_dir}/delivery-evidence-scheduling-native-stylesheet-content.sh"

# The task the neutral prompt hands the coordinator.
delivery_evidence_scheduling_request='add a compact action row to each project card: render Rename and Archive buttons inside a div with class project-actions after the card title, each button with class project-action, and style the row and its buttons (compact spacing, hover, focus-visible and disabled states).'

delivery_evidence_scheduling_write_instructions() {
  local workspace=$1
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

# The project card renderer; with-actions renders the requested action row
# after the title.
delivery_evidence_scheduling_write_project_card() {
  local file="$1/lib/project-card.mjs" actions=${2-}
  printf "import { escapeHtml } from './escape.mjs';\n\n" > "${file}"
  if [[ ${actions} == with-actions ]]; then
    cat >> "${file}" << 'EOF'
function renderActions(project) {
  const disabled = project.archived ? ' disabled' : '';
  return [
    '<div class="project-actions">',
    `<button class="project-action" type="button"${disabled}>Rename</button>`,
    `<button class="project-action" type="button"${disabled}>Archive</button>`,
    '</div>',
  ].join('');
}

EOF
  fi
  cat >> "${file}" << 'EOF'
export function renderProjectCard(project) {
  const badge = project.archived ? 'badge badge-archived' : 'badge badge-active';
  const label = project.archived ? 'Archived' : 'Active';
  return [
    '<article class="project-card">',
    `<h2 class="project-card-title">${escapeHtml(project.name)}</h2>`,
EOF
  if [[ ${actions} == with-actions ]]; then
    printf '    renderActions(project),\n' >> "${file}"
  fi
  cat >> "${file}" << 'EOF'
    `<span class="${badge}">${label}</span>`,
    `<p class="project-card-meta">${project.openItems} open items</p>`,
    '</article>',
  ].join('');
}

export function renderProjectGrid(projects) {
  if (projects.length === 0) {
    return '<p class="empty-state">No projects yet</p>';
  }
  return `<section class="project-grid">${projects.map(renderProjectCard).join('')}</section>`;
}
EOF
}

delivery_evidence_scheduling_write_library() {
  local workspace=$1
  mkdir -p -- "${workspace}/lib" "${workspace}/tests"
  cat > "${workspace}/index.html" << 'EOF'
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>Projects</title>
    <link rel="stylesheet" href="styles/dashboard.css">
  </head>
  <body>
    <div class="dashboard" id="app"></div>
  </body>
</html>
EOF
  cat > "${workspace}/lib/escape.mjs" << 'EOF'
export function escapeHtml(text) {
  return String(text)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}
EOF
  delivery_evidence_scheduling_write_project_card "${workspace}"
  cat > "${workspace}/lib/sidebar.mjs" << 'EOF'
import { escapeHtml } from './escape.mjs';

export function renderSidebar(projects, currentName) {
  const items = projects.map((project) => {
    const current = project.name === currentName ? ' sidebar-item-current' : '';
    return `<li class="sidebar-item${current}">${escapeHtml(project.name)}</li>`;
  });
  return [
    '<nav class="sidebar">',
    '<h2 class="sidebar-heading">Projects</h2>',
    `<ul class="sidebar-list">${items.join('')}</ul>`,
    '</nav>',
  ].join('');
}
EOF
  cat > "${workspace}/lib/stylesheets.mjs" << 'EOF'
import { existsSync, readFileSync } from 'node:fs';

// Stylesheets index.html links, and the class selectors they define.
export function linkedStylesheets(indexPath = 'index.html') {
  const html = readFileSync(indexPath, 'utf8');
  return [...html.matchAll(/<link rel="stylesheet" href="([^"]+)"/g)].map((m) => m[1]);
}

export function definedClasses(paths = linkedStylesheets()) {
  const classes = new Set();
  for (const path of paths) {
    if (!existsSync(path)) {
      throw new Error(`linked stylesheet ${path} does not exist`);
    }
    for (const match of readFileSync(path, 'utf8').matchAll(/\.([a-z][a-z0-9-]*)/g)) {
      classes.add(match[1]);
    }
  }
  return classes;
}

export function renderedClasses(markup) {
  const classes = new Set();
  for (const match of markup.matchAll(/class="([^"]+)"/g)) {
    for (const name of match[1].split(/\s+/)) classes.add(name);
  }
  return classes;
}
EOF
  cat > "${workspace}/tests/project-card.test.mjs" << 'EOF'
import test from 'node:test';
import assert from 'node:assert/strict';
import { renderProjectCard, renderProjectGrid } from '../lib/project-card.mjs';

const project = { name: 'Atlas <beta>', archived: false, openItems: 3 };

test('project card shows the escaped title', () => {
  assert.match(renderProjectCard(project), /<h2 class="project-card-title">Atlas &lt;beta&gt;<\/h2>/);
});

test('project card marks archived projects', () => {
  assert.match(renderProjectCard({ ...project, archived: true }), /badge-archived">Archived/);
});

test('empty project grid shows the empty state', () => {
  assert.match(renderProjectGrid([]), /empty-state/);
});
EOF
  cat > "${workspace}/tests/sidebar.test.mjs" << 'EOF'
import test from 'node:test';
import assert from 'node:assert/strict';
import { renderSidebar } from '../lib/sidebar.mjs';

test('sidebar marks the current project', () => {
  const html = renderSidebar([{ name: 'Atlas' }, { name: 'Beacon' }], 'Beacon');
  assert.match(html, /sidebar-item sidebar-item-current">Beacon/);
});
EOF
  cat > "${workspace}/tests/stylesheets.test.mjs" << 'EOF'
import test from 'node:test';
import assert from 'node:assert/strict';
import { renderProjectCard, renderProjectGrid } from '../lib/project-card.mjs';
import { renderSidebar } from '../lib/sidebar.mjs';
import { definedClasses, linkedStylesheets, renderedClasses } from '../lib/stylesheets.mjs';

const projects = [
  { name: 'Atlas', archived: false, openItems: 2 },
  { name: 'Beacon', archived: true, openItems: 0 },
];

test('every rendered class is styled by a linked stylesheet', () => {
  const markup = renderProjectGrid(projects) + renderProjectGrid([])
    + renderProjectCard(projects[1]) + renderSidebar(projects, 'Atlas');
  const defined = definedClasses();
  const missing = [...renderedClasses(markup)].filter((name) => !defined.has(name));
  assert.deepEqual(missing, []);
});

test('every linked stylesheet exists', () => {
  assert.ok(linkedStylesheets().length > 0);
  assert.doesNotThrow(() => definedClasses());
});
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

# Committed starting state; the request is the starting change.
delivery_evidence_scheduling_populate_fixture() {
  local workspace=$1
  local scenario=$2
  [[ ${scenario} == stylesheet-extraction ]] || return 2
  delivery_evidence_scheduling_write_instructions "${workspace}"
  delivery_evidence_scheduling_write_stylesheet "${workspace}"
  delivery_evidence_scheduling_write_library "${workspace}"
  delivery_evidence_scheduling_write_commands "${workspace}"
  mkdir -p -- "${workspace}/.planning"
  delivery_evidence_git "${workspace}" add .
  delivery_evidence_git "${workspace}" commit --quiet -m 'dashboard baseline'
}
