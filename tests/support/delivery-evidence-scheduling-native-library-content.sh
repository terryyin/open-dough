#!/usr/bin/env bash
# Library content for delivery-evidence/scheduling: the dashboard page, its
# rendering modules, and their tests, including the stylesheet consumer test
# that observes every rendered class defined by a linked stylesheet.

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
