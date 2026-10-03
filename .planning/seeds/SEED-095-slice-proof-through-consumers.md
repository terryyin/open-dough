---
id: SEED-095
status: active
planted: 2026-10-03
planted_during: Retrospective-findings runbook, 2026-10-03, second selected problem
trigger_when: A slice passes its chosen proof and CI then fails in a consumer of the behavior the slice changed
scope: story
---

# SEED-095: Slice proof through consumers

## Why This Matters

Implementers choose a slice's proof from the files they edited. Specs, page
objects and callers that consume the changed behavior from elsewhere are not
run, so CI is the first to fail and the execution pays a pause, diagnosis,
repair and republication. This is the most frequent retained finding: more
than fifteen executions across three projects, still occurring on 0.3.54.

## Story

<a id="prove-slices-through-consumers"></a>

### Prove a slice through the consumers of what it changes

**Identity:** SEED-095#prove-slices-through-consumers
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/237-prove-slices-through-consumers/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"0848012ec9de74128706797ea5aa656445ecbfd43f4aa60182f8d3ea01aed359","plan":"0f515cfc3cd00131e966fdf975576653912dcf6a714549256d8e80c27de14121"}}
```

**For / why:** The agent implementing or accepting a slice needs the slice's
local proof to include the tests that consume the behavior, text or default it
changed, so a consumer's failure appears before publication.

**Goal:** When a slice changes shared behavior, a visible message or value,
a default, or what a shared page renders, its proof is selected from the
consumers of that change, not only from the edited components. Acceptance does
not publish while a known consumer is unrun. Success is fewer executions that
pay a CI failure, pause and repair for a consumer a cheap local selection would
have run.

**Findings:**
[ODF-150](../../docs/maintainer/finding-names.md#odf-150),
[ODF-107](../../docs/maintainer/finding-names.md#odf-107).
Execution evidence stays in the catalog and the project logs.

**Scope:**

Current guidance (f0f355c / 0.3.33, fcc29fad / 0.3.48) already asks for the
current callers of a changed shared operation, including test-support callers,
at proof selection, hand-back and acceptance. The retained misses after it are
consumers a call-site search does not find. This story extends consumer
selection to them, at the three places where a slice's proof is chosen or
checked: the proof guidance that planning and implementation share, the
coordinator's delegation, and the implementer's return with the coordinator's
acceptance.

Required behavior:

- **Consumers by kind of change.** Selection covers, as the change requires:
  - callers of a changed operation, including continuation and recovery paths
    that reach it (already required; kept);
  - tests and specs that assert a retired literal or value: the old message
    text, status code, label or output form. A search for the retired literal
    is the selection;
  - callers that rely on a changed default by not overriding it;
  - shared test-support stand-ins for a changed contract, such as every mock
    factory of a changed module, not only the ones the edit touched;
  - specs that assert a property of a whole page or surface the change
    renders into (element counts, roles, keyboard order, forbidden words),
    which name no changed component.
- **Run the affected surface's suite when it is cheap.** When the suite
  covering the changed surface runs within the slice's focused-check time,
  run that suite instead of a hand-picked list. Page-wide invariants and
  timing effects are found this way, not by name. This replaces the current
  sentence that discourages broader suites only for that case; every-suite
  runs stay unrequired.
- **Delegation does not narrow below consumers.** A coordinator's or plan's
  named spec list is a minimum. It does not exclude consumers the change
  reaches, and a plan saying wider suites belong to CI does not exempt them.
- **Hand-back names the consumer selection.** The return states the kinds of
  change it made, the searches or suites used to find consumers (including the
  retired literals searched for), the consumers run, and any consumer left
  unrun with its reason.
- **Acceptance stops on an unrun known consumer.** The coordinator does not
  accept or publish a slice while a consumer found by that selection, or one
  the coordinator can name, is unrun: it runs it or returns the slice.

Deferred promises:

- Detecting tests that a narrowed default leaves vacuously passing (an empty
  input set). The Pygardon default case found them; this story adds no
  vacuity check.
- Failures reproducible only in CI's environment (window size, load, worker
  layout); [SEED-093](SEED-093-local-checks-agree-with-ci.md) owns local and
  CI agreement.
- A full-suite mandate for every slice, and any per-project suite catalog or
  test-impact tooling.

**Boundary:** Planning-time premise observation (ODF-074, ODF-110) already has
released responses and is not reopened here. The response is guidance in the
existing proof, delegation and acceptance references; no new script or skill.

**Key examples:** Each replays a retained case; the evaluation walks the
changed guidance through it.

1. *Retired message.* A slice changes `pyannote.audio is required` to new
   wording and proves it with the module's unit tests → selection searches
   tests for the old text → `test_diarize_audio_file_raises_when_pyannote_missing`
   is selected and fails locally before publication (Pygardon plan 190).
2. *Retired value in end-to-end features.* A slice changes reduce from a
   suffixed `key 2` to an appended value; its plan names backend tests only →
   the retired-value search lists
   `relationship_edit_and_remove.feature` → it runs before publication
   (Doughnut SEED-063).
3. *Offered host.* A slice offers `host: "cursor"`, proven by the new start
   specs → the retired-value search finds `agent-launch-refusal` and
   `agent-launch-ad-hoc-boundary` rows expecting HTTP 400 → they fail locally
   (Open Dough plan 210).
4. *Page-wide invariant.* A slice adds an always-rendered `role="status"` line
   to the dashboard; its delegation names four related specs → the dashboard
   suite runs in about a minute, so it is run → the six page-wide specs
   matching two status elements fail locally (Open Dough plan 172; same shape
   as plan 157's completion-word spec).
5. *Shared mock factory.* A slice adds a generated-API call on app mount and
   updates two of three mock factories → selection covers every factory of
   that module → the video clipping browser spec's factory is found
   (Pygardon plan 268).
6. *Shared default.* A slice turns a caps default on in a shared verifier →
   callers that do not override it are consumers → their modules and the
   affected end-to-end features run before acceptance (Pygardon plan 299).
7. *Acceptance stop.* A return lists its consumers but leaves one found
   consumer unrun as "covered by CI" → the coordinator runs it or returns the
   slice; it does not publish.
8. *Boundary.* A slice renames a private helper with no shared contract, text,
   default or rendered change → focused proof stands; no wider suite is
   required.

**Evaluation:** Replay the retained cases above against the changed guidance:
the slice's selected proof includes that consumer and fails locally before
publication. No paid host run is required.

**Completion:** Record the actual response and its first containing release on
ODF-150 and ODF-107 in the catalog.
