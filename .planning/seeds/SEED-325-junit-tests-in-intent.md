---
id: SEED-325
status: active
planted: 2026-11-12
planted_during: Terry reported that Java JUnit test files were missing from Intent
trigger_when: Terry asked for JUnit support as the first story in the product backlog
scope: story
---

# SEED-325 — JUnit tests in Intent

<a id="review-junit-tests-in-intent"></a>

### Review JUnit tests in Intent

**Identity:** SEED-325#review-junit-tests-in-intent
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/600-review-junit-tests-in-intent/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"91ef1452678ba7bec15c42676531f5dc19196dce56253532cd299017bfe5f98c","plan":"518fbbd4d7b51c86fdf2255fda9d8f106d5089d48ef8fa47ac6c479ac9e9cad9"}}
```

#### Goal

A developer reviewing a Java project can find its JUnit test files in the
Intent test browser and open them in **Purpose** to read the behavior they
cover. Terry reported that those files are currently missing from the list.

#### Scope

- Support Java test source through the existing configured-source contract:
  `kind: "java"` selects `.java` files beneath the location, narrowed by an
  optional `include` list. Explicit `sources` patterns keep their existing
  membership and first-matching syntax-hint semantics.
- A developer expands the existing location and package folders, selects a
  file, and reads its exact published source with line numbers in **Purpose**.
  Java syntax uses the same highlighting and plain-text fallback as other
  supported code kinds, including `syntax: "java"` source entries.
- Java and existing test types share listing, selection, source reads,
  Purpose/Proof tabs, story-change placement, revision handling, and recovery.
  Consolidate equivalent behavior in its existing owner; specialize only
  Java file recognition and syntax. No separate JUnit review flow is needed.
- Listing respects each location's rules; source reads admit only safe
  repository paths selected by at least one declared location. This protects
  the existing published-source boundary; it is not a JUnit filename policy.
- Keep CI proof independent of source availability. Opening Java source does
  not claim that its tests ran or add JUnit-result ingestion.

**Delivery limits:** automatic JUnit discovery from annotations, inheritance,
dependencies or build tools; executing Java tests; parsing JUnit XML; and
editing another project's settings are deferred. These are not rejection
rules: selected Java helpers or unusually named tests remain naturally
supported. No fixed Maven/Gradle layout or `*Test.java` convention is imposed.

#### Key examples

1. Doughnut publishes `backend/src/test/java` with `kind: "java"` and
   `include: ["**/*Test.java"]`, containing
   `com/example/CalculatorTest.java` and `com/example/Fixture.java` → the
   developer expands the location and package folders → the test is listed,
   the unmatched helper is absent, and selecting the test opens its exact
   source in **Purpose** at Intent's reading revision, with Java styling.
2. A Java location omits `include`, or a `sources` entry explicitly includes
   `com/example/CalculatorExamples.java` with `syntax: "java"` → the developer
   browses and opens it → its unfamiliar name or JUnit annotation form adds
   no hidden discovery filter. With no `include`, every `.java` file in the
   location is eligible, including a helper.
3. One project publishes Java tests and an existing supported test type → the
   developer opens each through the same controls → each reads in the same
   Purpose pane with its own syntax. A missing Java CI result retains the
   existing Proof explanation and does not prevent reading Purpose.
4. A location's kind or a source entry's syntax remains unknown → the
   developer browses that location → an unsupported kind keeps its existing
   explanation; a file selected by explicit patterns with an unknown syntax
   remains readable as plain text. Making Java supported does not remove
   either recovery contract.

#### Investigation and alternatives

Observed on 2026-11-12: Doughnut's locally available published
`origin/main` at `9554a2837d106757ec647791f6cc3903d0aa45b4` declares the
Java location and pattern in example 1, and publishes nested `*Test.java`
files. This is the identified matching project, without claiming it is the
only project behind Terry's report. In Open Dough at
`98deed0f2283a2d5678940cfa055c528b352fa2a`, a representative authenticated
read returns `unsupported-kind` and refuses opening Java declared by kind.
The same JUnit source selected through explicit `sources` patterns is listed
and read exactly. The shared selector lacks Java; source contents and JUnit
annotations do not participate in membership. See the executable plan for
the consuming-boundary observation and proof ownership.

| Alternative | User effect and system consequence |
| --- | --- |
| Existing explicit `sources` patterns | An available workaround reads Java as plain text, but leaves Doughnut's existing kind declaration unsupported and requires a project configuration change. |
| Java in the existing shared flow — recommended working direction | Honors the existing declaration and familiar review interaction; extends one membership rule and the existing syntax reader. |
| Semantic JUnit discovery | Could identify tests independently of configured patterns, but adds framework/build interpretation and a different discovery promise. Deferred. |

The strongest challenge was that “JUnit support” could add a framework
recognizer while leaving the actual configured-source gap unresolved. The
observed unsupported Java kind supports the shared-flow direction already
called for by this story. Styling supports reading; exact source remains
available if highlighting cannot load. No live production repair is claimed.

Borrowed mechanism: mail routing separates membership rules from reading a
selected message. Location patterns correspond to routing criteria, the
published file path to message identity, and the syntax hint to presentation.
Apply that separation to the shared Intent flow. Its limit is consequential:
a selected Java file is not evidence that it contains or has run a JUnit test.

#### Architecture

Follow [ADR 0008 — Project dashboard domain and architecture](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)
for Purpose/Proof and published reading revisions, and
[ADR 0002 — Software development lifecycle principles](../../docs/adrs/0002-software-development-lifecycle-principles-accepted.md)
for one coherent representation across the product. Membership already belongs
to `src/skills/dough-makeme/scripts/intent-location-selection.mjs`, reused by
dashboard listing, file admission, story overlays and test-entry guidance.
Adding Java also makes explicitly opted-in Java files eligible for MakeMe or
page-object guidance; preserve those independent opt-ins. Keep source-language
presentation in the existing source reader. No new framework adapter, stored
inventory, UI navigation, or architectural exception is required.
