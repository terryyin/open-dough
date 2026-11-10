---
id: SEED-294
status: active
planted: 2026-11-10
scope: story
---

# Opt in to Intent Coverage during story wrap-up

<a id="opt-in-to-intent-coverage-at-wrap-up"></a>

### Opt in to Intent Coverage during story wrap-up

**Identity:** SEED-294#opt-in-to-intent-coverage-at-wrap-up
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

A project maintainer can choose whether story wrap-up automatically invokes
Dough Intent Coverage. Record the opt-in in the project's
`.planning/open-dough.json`. The default is off.

- With the file or setting absent, or the setting explicitly off, an otherwise
  eligible wrap-up skips the automatic check and completes normally.
- With the setting explicitly on, an otherwise eligible wrap-up automatically
  invokes Dough Intent Coverage.
- A developer can still request Intent Coverage explicitly during review,
  regardless of the automatic wrap-up setting.
