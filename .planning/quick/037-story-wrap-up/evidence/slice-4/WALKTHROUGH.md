# Slice 4 behavior walkthrough

Candidate: Proposed `dough-story-wrap-up` after product-review application.
Date: 2026-09-10. Local representative records, not native acceptance.

Builder: [build-fixture.sh](build-fixture.sh). Shared starting queue
[starting/](starting/) (before-cleanup `91b5843a6573c075ddb46c0333162a92338e8051`)
includes the spent story, follow-up retry story, audit trail, and Document
widget SLO. Wrap-up always puts follow-up first and deletes spent history.

## Advice alone

Advice: queue Document widget SLO above Keep the audit trail.
[advice-alone/](advice-alone/): retry, SLO, audit. Direction unchanged.

## Human correction

Advice as above. Human: keep audit trail above SLO.
[human-correction/](human-correction/): retry, audit, SLO. Human order wins.
Follow-up stays first.

## Supported new-story addition

Advice as above plus add **Page operators on timeout** (on-call engineers;
a timeout pages them).
[new-story/](new-story/): retry, page-on-timeout, SLO, audit. Canonical
section exists. Follow-up stays first.

## Unresolved choice

Advice to split the widget product with unknown beneficiary/outcome.
[unresolved/](unresolved/) matches empty-review queue (retry, audit, SLO).
No invented story. Gap reported. Needed context stays with active work.

## Empty product review

No product advice and no extra human input.
[empty-review/](empty-review/): retry, audit, SLO (unrelated order after
follow-up). No mandatory question.

## Behavior review

1. **Invocation context.** Product advice and optional human input are
   wrap-up work, not a new discovery or retrospective.
2. **Required context.** Unknown beneficiary/outcome is reported, not guessed.
3. **Useful outcome.** Authorized compatible queue/story edits apply; human
   input wins; follow-up stays first; skipped review asks nothing.
