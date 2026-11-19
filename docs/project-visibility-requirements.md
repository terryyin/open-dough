# Project visibility and state requirements

Shipped Development behavior lives in the dashboard's code and automated tests.
[Accepted ADR 0008](adrs/0008-project-dashboard-domain-and-architecture-accepted.md)
holds the domain distinctions. This page keeps direction that is not
implemented yet.

## Three perspectives

Development, Product intent, and Structure are independent related perspectives.
The dashboard presents Development. Product intent and Structure remain design
work.

<a id="product-intent-perspective-the-current-product"></a>

### Product intent perspective: the current product

Product intent is the maintained definition of intended behavior: what the
current product is meant to do and why. Each Product intent contains Purpose
and Proof. How Purpose and Proof are represented beyond the current Intent
reading, and how relationships among stories, product intents, and structure
are recorded or derived, remain open.

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
