---
id: SEED-005
status: dormant
planted: 2026-09-06
planted_during: Retrospective feedback idea capture
trigger_when: Useful version-specific feedback arises from actual installed client use
scope: small
---

# SEED-005: Learn from client retrospective feedback

## Why This Matters

Real client use can reveal ineffective guidance or regressions. Keep enough
context and the installed Open Dough version to decide whether shared guidance
should change, simplify, or be removed.

## Smallest useful approach

After the Donut installation/update path works, use an existing project issue,
review, or retrospective note for a concrete observation. The client chooses
whether to share it with Open Dough. Compare it with the relevant released
behavior and make a shared-source improvement when the evidence supports one.

No new client mailbox, participating-project registry, polling service, automatic
export, or regression database is required. The original Dear Do name can remain
an informal label for feedback; it does not require a file or installed skill.
Client-local notes remain under client ownership. An observation from manually
edited installed guidance is not evidence of a released-version regression.

## When to Surface

One actual installed-client observation is useful enough to act on, or repeated
manual reporting shows a concrete missing capability. Until then, keep this idea
outside the implementation queue. Do not add a speculative configuration option.

## Acceptance if refined

Show that a real report identifies an actionable improvement and that the
resulting released guidance addresses it. Any changed public rule/skill still
needs independent native discovery, invocation/application, intended behavior,
affected installation/updating, and coexistence in Codex, Cursor, and Claude
Code. All such evidence remains pending; no feedback system is implemented.

## Related

- [Product backlog](../PRODUCT-BACKLOG.md)
- [Client installation and update (Proposed)](../../docs/adrs/0004-client-installation-and-update.md)
