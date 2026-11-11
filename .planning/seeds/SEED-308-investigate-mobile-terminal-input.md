---
id: SEED-308
status: active
planted: 2026-11-11
planted_during: Terry requested investigation of mobile quick prompts and dictation
trigger_when: Investigation of the iPad Safari regression is accepted
scope: story
---

# SEED-308 — Mobile terminal input investigation

<a id="investigate-mobile-terminal-input"></a>

### Investigate mobile terminal input

**Identity:** SEED-308#investigate-mobile-terminal-input
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Goal:** Explain why dashboard quick prompts and dictation work in a desktop browser but fail on mobile.

Scope is diagnosis and evidence, without a product repair. Trace the mobile and desktop input paths, identify a supported cause or remaining uncertainty, and report the appropriate correction. Both quick prompts and dictation should deliver their intended text to the active terminal on mobile as on desktop. The reporter uses Safari on iPad through Tailscale and says dictation worked before its move into quick prompts. The menu opens, but tapping dictation does nothing. iPhone Chrome has not yet been tried.

Investigation and any temporary proof follow the [project failure policy](../../AGENTS.md#failing-and-flaky-tests). Long local runs use the maintained macOS sleep guard and power condition in [local test resources](../../tests/local-test-resources.md#machine-sleep-on-macos).
