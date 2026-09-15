---
id: SEED-014
status: active
planted: 2026-09-15
planted_during: Human request to retire completed extraction tooling and speculative recognition
trigger_when: Selecting the next product hardening story
scope: bounded
---

# SEED-014: Remove internal extraction and speculative recognition

## Stories

<a id="remove-extraction-and-speculative-recognition"></a>

### 1. Remove internal extraction and speculative recognition

**Status:** Refined; planned.

**Slice plan:** [Remove internal extraction and speculative recognition](../quick/033-remove-extraction-and-speculative-recognition/PLAN.md).

**Goal:** Open Dough maintainers and developers using its released guidance
get a simpler product that supports current needs, with less internal machinery
and documentation to maintain or consume. Retain useful installation-revision
fidelity checking while completely removing finished extraction tooling and
speculative local-duplicate recognition. This hardening reduces the maintenance
burden around the shared software-development lifecycle.

#### Story body

When Open Dough started, the idea was to extract existing AI-agent rules and
skills from other projects, make them public, release them, and install them
back into those projects. We also speculated that a project would identify
local skills that mostly overlapped with or duplicated the installed skills,
then clean up its original local skills and their dependencies. Eventually,
each project would keep the common authoritative copy from Open Dough.

The internal `extract-guidance` skill was useful, and we have extracted all the
skills we wanted to extract. Its job is finished. Remove the internal skill
completely, together with all its dependencies, instructions, and documentation.

Identifying local duplicates through recognition was speculative and was never
used. The old skills have already been removed from the projects. That work was
done by simply instructing an AI agent to find the old skills and their
dependencies and replace them with the new skills and dependencies. Recognition
provided no value in that process, and the requirement has gone away. Remove
the speculative implementation, preparation, recognition data structures, and
associated material completely.

There is still a useful ability to tell whether an installed local copy is
faithful to its original Open Dough revision. Simplify that ability
substantially. The working hypothesis is that recognition is unnecessary even
for this purpose. Examine its actual consumers: remove recognition entirely if
the remaining useful functionality can work without it; if another current
function genuinely needs it, simplify it significantly to the minimum that
function requires.

This is one product-hardening and removal story. Complete removal means the
current revision reads as though the retired behavior had never existed.
Delete the relevant code, tests, documents, instructions, dependencies, and
historical records in the current tree. Rewrite shared material around the
remaining useful behavior. Do not replace deleted content with negations,
retirement notices, statements that a feature no longer exists, or tests that
assert its absence. Git history stays intact and supplies historical recovery.
This cleanup requirement also covers this story's temporary planning material
when the work is closed.

#### Scope

- Remove the internal extraction skill, its host discovery pointers, dedicated
  support, and incoming dependencies. Keep the useful shared skills it produced.
- Remove local-duplicate recognition and replacement preparation, including
  records, metadata, historical extraction accounts, dedicated compatibility or
  retirement handling, and their callers. Inspect actual consumers to resolve
  any genuinely necessary remaining representation.
- Delete tests devoted to the removed behavior, together with their dedicated
  fixtures, helpers, runner entries, and dependencies. In a shared test, delete
  the obsolete assertions and their now-unused setup. Keep the assertions that
  exercise remaining useful behavior. **Never invert an obsolete assertion or
  replace it with an assertion that the removed feature, file, field, or skill
  is absent.** This applies to existing absence assertions as well as new ones.
- Clean affected instructions, documentation, ADR text, release notes,
  maintenance records, and planning references in the current tree. Delete
  material devoted to the removed concepts; rewrite shared material to explain
  only the remaining product. Apply this by meaning and dependency, rather than
  banning words such as “recognition” where they describe unrelated behavior.
- Preserve comparison of managed installed content with its recorded release,
  including useful changed/missing-file detection and the existing ordinary
  update safeguards. SOURCE, VERSION, and tagged release content already serve
  this purpose; recognition records are descriptive practice-matching material.
  Simplify the mechanism where these removals make work unnecessary.

**Human-owned constraints:** The user's 2026-09-15 direction explicitly requires
complete current-tree removal, including tests and individual assertions,
without historical or negation-based replacements. Git history and published
tags remain intact. This direction applies to affected architectural prose too:
[ADR 0001](../../docs/adrs/0001-ubiquitous-language-accepted.md),
[ADR 0003](../../docs/adrs/0003-tagged-release-versioning-accepted.md),
[ADR 0004 §3](../../docs/adrs/0004-client-installation-and-update-accepted.md),
and [ADR 0006](../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md)
currently describe recognition or extraction records. Align those passages with
the selected remaining behavior. For this removed material, the user's explicit
current-tree cleanup direction takes precedence over historical retention in
[ADR 0000 §5](../../docs/adrs/0000-use-adrs-accepted.md); keep useful architectural
decisions in their existing homes, with history recoverable through Git.

**Deferred promises:** Publishing a release, updating other projects, and
building new duplicate-detection, migration, provenance, or audit capabilities.
Planning and implementation details remain for the execution-planning workflow.

#### Key examples

- Given a test exists solely to validate extraction output or recognition
  matching, completing this story deletes that test and its dedicated support.
  An inverted test asserting missing extraction output is not an acceptable
  replacement.
- Given an installation test checks useful payload behavior and separately
  asserts that recognition is excluded or retired, completing this story
  removes the recognition assertion, setup, and related reporting while
  retaining proof of the useful installation behavior.
- Given a document mixes useful release instructions with extraction history
  or recognition requirements, completing this story leaves direct instructions
  for the current release workflow. A document solely about the removed
  behavior is deleted.
- Given managed installed files match their recorded release, the fidelity
  check identifies the match. Given an edited or missing managed file, ordinary
  update retains its existing stop-without-writes behavior. These checks concern
  installed content and its release, independent of matching old local skills.
- Given a recognition consumer only supports local-duplicate identification or
  records past extraction, remove it. If inspection finds a genuinely current
  useful function, preserve that outcome with the minimum necessary mechanism;
  speculative future use does not justify retention.

**Evaluation:** Review the resulting current tree for coherent instructions,
code, data, and tests describing the remaining product. Demonstrate that a
faithful installed copy and a locally changed copy can still be distinguished
against the relevant Open Dough revision through the simplified mechanism.
Evaluate any retained recognition machinery against an actual current consumer
and its necessary behavior. Apply the complete-removal requirement through
review and cleanup rather than permanent absence assertions or historical
explanations in the product.

**Depends on:** No unfinished prerequisite identified for this cleanup.

**Unresolved decisions:** None blocking planning. The consumer inspection is an
implementation investigation under the already supplied decision rule, not an
unanswered product requirement. Complete removal is the default; retention
requires an actual current functional need. Surface a concrete conflict if
inspection reveals a required outcome that cannot satisfy these constraints.
