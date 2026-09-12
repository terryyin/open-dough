# Proof selection and acceptance: comparative source review

Reviewed 2026-09-12 for [Slice 1](../PLAN.md#ordered-slices), under
[AGENTS.md](../../../../AGENTS.md#behavior-review). Historical provenance and its
limits remain in [Story 20](../../../seeds/SEED-004-extract-and-adopt-project-guidance.md#match-success-claims-to-promised-outcome-proof);
no historical execution was repeated.

Baseline: `bb891de`, shared `Own executable proof` and execution `Accept proof`.
Candidate: the uncommitted source in this execution, with SHA-256:

- `src/skills/dough-story-refinement/references/planning.md`:
  `49dafda0cd54457691512170edebad456329e647c1331192e727bc5eab863c00`
- `src/skills/dough-execute-plan/references/wrap-up.md`:
  `c0e6d7851794aeb7967702117b1df0de8b3d0f126d22a7201230139145e30a51`

This is an implementer's manual walkthrough, not independent agent runs, native
host acceptance, or measured token savings. For each row, the supplied input is
separate from the review judgment. Both versions receive those same facts and
an instruction to assess the claim and necessary next action. Expected outcomes
are judgments below, not additional instructions fed to an execution.

| Supplied promise and evidence | Baseline review judgment | Candidate review judgment |
| --- | --- | --- |
| Public stop must settle. Inner cleanup test passes; no assertion observes public caller settlement. | Promise-to-observation mapping rejects public completion; requires inferring that the observed inner boundary is insufficient. Keep inner proof and obtain focused caller-settlement proof. | Explicit inner/caller distinction identifies the missing observation immediately. Same narrow claim and focused next proof; no claim about other stop failures. |
| Fresh start must allocate a target and reach readiness. Fixture supplies an allocated target; a stand-in records a provisioning call, without real allocation or readiness observations. | Setup inspection can identify the gap, but the instructions leave promised setup versus supplied precondition implicit. Accept dispatch/already-allocated proof only; seek allocation/use and readiness evidence. | Explicit fixture rule identifies allocation as bypassed and the stand-in as insufficient for allocation/readiness. Preserve dispatch proof; obtain only the missing observations through a suitable boundary. No demand to replace all unit tests. |
| Usable invocation is promised. Version metadata is current; its required reference is absent. | A version observation does not prove usability. Report the unsupported invocation. | Same result under case-limited success and incomplete-promise rules. No extra audit or reopening of the historical shipped repair follows from this preservation case. |
| For the stated fresh-start case, inspected evidence observes promised allocation, readiness, and caller completion; the boundary is unchanged. | Accept the corresponding success claim and reuse proof under existing acceptance rules. | Accept the same claim. Explicit reuse applies during selection as well; no rerun, broader suite, or broader failure-mode claim. |
| Public completion is promised, inner cleanup is proved, but the missing caller observation cannot be obtained within authorized work. | Reject full completion and return the evidence gap through existing incomplete-proof handling; preserve inner proof. | Report covered inner cleanup and unproved public completion; the latter stays incomplete. Reporting does not fulfill or remove the promise, and does not expand authority. |

The baseline supports correct decisions in every row when its general rule is
interpreted correctly. The candidate's supported advantage is a concrete removal
of that interpretive step for supplied setup and caller completion, with an
explicit disposition for missing proof. This review does not establish the
historical failures were caused by wording or predict recurrence reduction.

## Language, context, and work assessment

The shared section grows from 234 to 321 whitespace-delimited words; acceptance
shrinks from 132 to 118, a combined increase of 73. These are source word counts,
not tokens. Setup/assertion inspection moves into the authoritative shared home;
acceptance already requires that link. No new file read, report, host step, or
verification mechanism is required at runtime. The longer text names two concrete
inference hazards and their disposition instead of adding a generic warning.

Invocation remains selected-story refinement, slice planning/refinement, or
authorized execution, as described by the existing skills. Their links already
load the planning contract. Required promises, decisions, setup, and assertions
remain explicit inputs; missing observations prevent a completion claim. The
execution entry point still stops for missing authority/source/context. Runtime
wording addresses the executing project and contains no incident names or
maintainer optimization procedure.

Direct caller review found no contradiction in slice planning/refinement,
decomposition, or the literal `proof:` handoff. Acceptance retains its
coordinator-owned rejection, focused rerun conditions, and failure disposition.
Only its duplicate setup-inspection sentence needed alignment.

Qualitatively, the candidate can direct the first inspection toward the missing
setup or caller observation, avoiding an overclaim followed by repair or an
unfocused broader rerun. A competent baseline review already incurs none of
that avoidable work; the candidate adds reading cost in that case. No measured
reduction in calls, output, repair work, or total tokens is claimed. The bounded
tradeoff is justified by making the documented inference hazards actionable at
selection without adding reads or ceremony, while all five decisions remain
correct. Source-only improvement is supported; release/adoption and real-project
efficiency remain unproved.
