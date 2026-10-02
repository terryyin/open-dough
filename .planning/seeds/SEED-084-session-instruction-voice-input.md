---
id: SEED-084
status: active
planted: 2026-10-03
planted_during: Maintainer request to capture session voice input
trigger_when: A developer wants to dictate additional instructions when starting a dashboard session
scope: unestimated
---

# SEED-084: Voice input for session instructions

## Why This Matters

A developer starting a dashboard session wants to speak the additional
instructions instead of typing them into the text area.

## Stories

<a id="session-instruction-voice-input"></a>

### Dictate additional instructions when starting a session

**Identity:** SEED-084#session-instruction-voice-input
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Beneficiary and outcome:** A developer can use voice input to add text to the
additional-instruction field before starting a dashboard session.

**Key example:** The developer speaks an instruction, sees its transcription
in the additional-instruction text area, can review or edit it, and starts the
session with that text included in its instructions.

**Investigation direction:** During refinement, check whether Codex or ChatGPT
provides a suitable service for this use. If neither does, consider the OpenAI
API. Service availability, suitability, and the integration approach are open;
this capture does not claim that an existing host service is available.

**Boundary and open questions:** This story covers voice input for the startup
instruction field. Refine recording interaction, microphone permission,
transcription failure behavior, and any service cost or credential decisions
needed for that outcome. It does not add a live voice conversation to sessions.

## Breadcrumbs

- Terry's 2026-10-03 request: capture this as the first queued story, investigate
  Codex or ChatGPT support, and use the OpenAI API as a fallback possibility.
- [Product backlog](../PRODUCT-BACKLOG.md).
