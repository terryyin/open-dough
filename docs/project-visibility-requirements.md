# Project visibility and state requirements

Shipped Development behavior lives in the dashboard's code and automated tests.
[Accepted ADR 0008](adrs/0008-project-dashboard-domain-and-architecture-accepted.md)
holds the domain distinctions. This page keeps direction that is not
implemented yet.

## Three perspectives

Development, Product intent, and Structure are independent related perspectives.
The dashboard presents Development and a test-focused Intent reader. The
unified review design extends Intent to repository files. Structure remains
a separate future perspective.

<a id="product-intent-perspective-the-current-product"></a>

### Product intent perspective: the current product

Product intent is the maintained definition of intended behavior: what the
current product is meant to do and why. Each Product intent contains Purpose
and Proof. How Purpose and Proof are represented beyond the current Intent
reading, and how relationships among stories, product intents, and structure
are recorded or derived, remain open.

With no selected story, a developer can read the whole project at one named
revision and see CI changes on trunk. Selecting a story supplies a comparison
and optional session selection. Its cumulative review includes production code,
tests and other repository files. A Done story opens at its historical result.
Proof identifies the builds actually observed, including ancestor or later
builds used for context. If no comparable pair isolates the contribution, show
the available observations and the gap. The [review design](dashboard-ux-ui-north-star.md#review-in-intent)
describes navigation and file filters.

## Questions retained for later design

- How relationships among development work, its stories, product intents, and
  structure are recorded or derived beyond the current changed-test reading,
  including expected impact versus observed change.
- Whether and how architectural direction belongs in the structural perspective.
- Whether to introduce a commit mailbox and timeout-based handover, including
  how to transfer ownership safely when the former agent might still be active.
- Whether **Start session** belongs only in Development or stays visible across
  perspectives. Structure's later interface remains separate design work.

Further design keeps published progress distinct from local activity. This
document selects no new storage schema, service, or dashboard control.
