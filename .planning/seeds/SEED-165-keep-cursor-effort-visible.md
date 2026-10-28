---
id: SEED-165
status: active
planted: 2026-10-29
scope: small
---

# Keep Cursor effort selection discoverable

<a id="keep-cursor-effort-visible"></a>

### Keep Cursor effort selection visible

**Identity:** SEED-165#keep-cursor-effort-visible
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planless","assessment":"ready","reasons":[],"basis":{"document":"2f602d3f4eab3261318c0c361c97e945b737dd353246369ea1dd69189c27380a"}}
```

**Goal:** A developer choosing Cursor in a session-start dialog always sees
Reasoning effort and understands how to enable its choices.

**Scope:** Keep the selector visible for Cursor in the existing session-start
dialogs. Disable it for Default and Auto, with an accessible hint to choose a
specific model. Selecting a model with listed effort variants enables the
existing choices and preserves supported launch behavior. Models with no effort
variants retain their existing startup behavior. Feedback-maintenance Cursor
effort remains deferred; Codex and Claude behavior remain unchanged.

**Key examples:** Default or Auto displays a disabled Reasoning effort selector
and the choose-a-specific-model hint. Selecting a specific model with listed
efforts enables the selector. Switching back to Default or Auto disables it
again without preventing a valid default launch.

**Authority:** Terry's direct implementation instruction on 2026-10-29 supplies
this one contextual UI change and its expected behavior; execute as one bounded
slice without adding a separate implementation plan.

**Evaluation:** Extend the existing Cursor dialog journey to observe visibility,
disabled state, accessible hint, re-enabling, and supported startup. Run related
Cursor model and Codex model browser checks, with typecheck and staged lint at
commit. Reuse the shared launch controls and catalog; add no native effort API.
