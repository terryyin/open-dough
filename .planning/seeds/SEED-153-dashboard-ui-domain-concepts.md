---
id: SEED-153
status: active
planted: 2026-10-27
planted_during: Terry's dashboard UI vocabulary decision
trigger_when: Dashboard UI regions or their implementation use competing names for the same concept
scope: dashboard
---

# SEED-153: Consistent dashboard UI domain concepts

## Why This Matters

A developer discussing the dashboard or tracing its implementation should use
the same precise names throughout. The three-column overview has been called
the page, dashboard, and board, while the shared Side panel can be confused
with its terminal, final report, or story review content. Terry accepted the
concise [dashboard UI concepts in ADR 0008](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md#dashboard-ui-concepts)
and selected global alignment as the highest-priority queued work.

## Selected Story

<a id="align-dashboard-ui-domain-concepts"></a>

### Align the dashboard globally with its UI domain concepts

**Identity:** SEED-153#align-dashboard-ui-domain-concepts

**Beneficiary:** A developer using, discussing, testing, or changing the dashboard.

**Goal:** Every dashboard UI concept maps directly to its architectural
responsibility, implementation names, tests, and documentation, with no
translation between competing vocabularies.

**Scope:** Audit the whole dashboard against ADR 0008's Board, Column, Story
card, Session entry, Sessions sidebar, Side panel, Panel divider, and Scrollbar
definitions. Rename and align UI wording and accessible names, architectural
boundaries, components, modules, files, types, functions, state, selectors,
tests, and maintained documentation wherever they represent those concepts.
Keep one clear responsibility per concept and remove competing synonyms and
alias layers. Name nested scrollbars by their actual owning region. Preserve
published story facts, session identities, saved preferences, and existing
behavior through any required rename or migration.

**Key examples / evaluation:**

- A developer can trace Board, its Columns, Story cards, and Session entries
  from the accepted definition through architecture, code, tests, and docs
  using the same names, adapted only to programming syntax.
- Opening a terminal, final report, or story review uses the same Side panel
  responsibility; content names identify the content rather than the shared
  container. The Sessions sidebar remains a separate cross-project region.
- The Panel divider resizes the Side panel. The Board scrollbar scrolls the
  Board; another region's scrollbar names that region. Names and checks keep
  these responsibilities distinct, including narrow or stacked layouts.
- A whole-dashboard review finds no competing name for an adopted concept or
  single name used for incompatible concepts. Existing relevant automated
  journeys still pass after their names and selectors are aligned.

**Preparation:** Not refined; implementation approach and proof remain to be
selected. This queue entry does not start the naming work.

## Breadcrumbs

- Terry's direction to define the UI concepts, accept ADR 0008, reference it
  from ADR 0001, and queue global alignment first, 2026-10-27.
- [ADR 0001 — Ubiquitous language](../../docs/adrs/0001-ubiquitous-language-accepted.md#dashboard-ui-vocabulary).
- [Dashboard navigation](../../docs/dashboard-navigation.md).
