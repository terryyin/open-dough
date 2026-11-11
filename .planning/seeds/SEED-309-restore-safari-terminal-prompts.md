---
id: SEED-309
status: active
planted: 2026-11-11
planted_during: Terry authorized judgment and action on the confirmed mobile regression
trigger_when: The bounded quick repair is accepted
scope: story
---

# SEED-309 — Restore Safari terminal prompts

<a id="restore-safari-terminal-prompts"></a>

### Restore Safari terminal prompts

**Identity:** SEED-309#restore-safari-terminal-prompts
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planless"}
```

**Goal:** Restore the existing terminal prompt and dictation actions in Safari on iPad and iPhone without changing their intended behavior.

#### Scope and examples

- Choosing OK or as recommended offers the literal editable text exactly once and does not submit it.
- Choosing Dictate into terminal starts the existing recording flow exactly once when enabled; disabled dictation remains unavailable.
- Internal pointer or touch selection survives Safari's null-related-target blur. Outside-pointer dismissal, keyboard focus departure, Escape, and arrow navigation keep working.
- Reproduce the reported failure before the smallest repair, using the existing integrated terminal journey where it overlaps. Verify the regression and related prompt/dictation behavior in Chromium and WebKit. Follow the [project failure policy](../../AGENTS.md#failing-and-flaky-tests).

This is one planless quick repair with a ten-minute implementation limit and no replanning; an oversized or inconclusive attempt returns its evidence to this same story. No new feature or broader mobile redesign is authorized. Long local runs follow the [maintained macOS sleep guard and its AC/battery condition](../../tests/local-test-resources.md#machine-sleep-on-macos).
