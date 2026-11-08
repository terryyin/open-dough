---
id: SEED-265
status: active
planted: 2026-11-08
scope: story
---

# CI timing build sources

<a id="show-ci-build-source-icons"></a>

### Show CI build sources with compact icons

**Identity:** SEED-265#show-ci-build-source-icons

```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Who benefits.** A developer reviewing a story's CI timing in Intent can
scan the measurements and tell at a glance where each endpoint's timing came
from.

**Evaluation.** When CI skips Baseline and Branch for planning-only changes
and runs Landed directly, each routine Build cell shows a compact source icon.
The icons distinguish a build at the requested revision from timing taken from
an ancestor build and have accessible labels that convey the same distinction.
The timing columns show the measurements from the selected builds. Commit
subjects, run and attempt IDs, and routine skip explanations stay out of the
default rows. Exceptional cases such as a failed or cancelled run, missing
proof, or an unexplained absence keep a short visible explanation.

**Scope.** The Build column in Intent's CI timing comparison. Pygardon's
missing per-file pytest timing is separate work.
