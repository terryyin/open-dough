---
id: SEED-067
status: active
planted: 2026-10-01
scope: story
---

# SEED-067: Codex refinement launch reliability

## Story

<a id="pin-older-preparation-command-proof"></a>

### Keep older-installation retry proof independent of the current commit

**Identity:** SEED-067#pin-older-preparation-command-proof
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/195-older-preparation-command-proof/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"1990d2ecd0857e027de1ee8df177aa0514de41d4c43e514a4734e8b9e72a47c2","plan":"4b01cda02f77de730dc960bd74c6b9ef51c40aad975789fee13998d44c5044a8"}}
```

**Goal:** Give maintainers reliable regression evidence that retained refinement
retry safely refuses an installed preparation command without `continue`, even
after the implementation has been committed.

**Scope:** Correct only the older-command fixture and its distinguishing proof.
Preserve the real installed-command/Git/browser retry journey, unchanged saved
start and ownership artifacts, and the independent-story success. No production
behavior, native handoff or shared workflow change is included.

**Plan:** [bounded correction input and slice](../slice-plans/195-older-preparation-command-proof/PLAN.md).
