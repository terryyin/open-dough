# Open Dough language and concept audit

Date: 2026-09-09. Discussion input; not an ADR, approved glossary, or execution plan.

Resolution update, 2026-09-09: **C01 and C03 are resolved in source guidance**.
Terry Yin selected 15 as the resplit threshold: a count greater than 15 recommends
resplitting (15 does not; 16 does). The resplit description and recognition
review now agree with slice-plan refinement. An already-ready plan now produces
a readiness report; execution still requires separate authorization from the
invoking workflow. Installed release copies remain at their recorded version.
The inventory and findings below describe the original audit snapshot; C01 and
C03 are retained as the record of the resolved issues. The remaining 21 findings
are open.

The skills already express a substantial domain model. ADR 0001 describes only part of it. The main problems are overloaded names, implicit relationships and readiness states, and a few actual contradictions. Unification should preserve useful distinctions rather than replace every related word with one term.

## Scope and authority

“OpenDO” is interpreted as **Open Dough**, the repository's product name. No product rename is assumed.

Reviewed all nine source skills under `src/skills/`, their three shared runtime references, all eight recognition records, and the two related internal maintainer skills. Followed dependencies into maintainer guidance, the ADR catalog and records, installation documentation, and the updater's installer/helper terminology. README supplies the broader guidance taxonomy. Historical planning artifacts and test fixtures were not treated as current definitions or exhaustively audited.

The eight payload skills and their runtime references currently byte-match their copies in both `.agents/skills/` and `.claude/skills/`. `dough-acme-change-readiness` exists in source but is outside the current payload declarations and absent from both installations. Presence in source does not establish Released status.

[ADR 0001][adr1] is **Proposed**, as are ADRs 0002 and 0004. Comparisons against them identify agreement, gaps, and tensions, not violations of accepted policy. Relevant Accepted decisions are [0000][adr0] (human decision ownership), [0003][adr3] (guidance/release lifecycle), [0005][adr5] (validation and evidence), and [0006][adr6] (one authoritative behavioral source). Index and record statuses agree; no supersession ambiguity was found. This audit changes no decision or runtime guidance.

Inventory notation: **Defined** = explicitly defined in ADR 0001; **Mentioned** = present but not independently defined there; **Additional** = used elsewhere and missing as a definition; **Client-owned** = intentionally supplied by the client project. Rows group close synonyms or related fields; they do not assert that every grouped word is interchangeable.

## Skill and dependency map

| Skill | Concepts it primarily handles | Direct behavioral dependencies |
| --- | --- | --- |
| [dough-story-decomposition][decompose] | Parent problem, candidate stories, value, learning, ordering, seed | Problem-decomposition reference; seed format; story refinement |
| [dough-story-refinement][refine] | Selected story, goal, scope, key examples, shared understanding | Planning reference; seed format; decomposition; conditional ADR awareness |
| [dough-slice-planning][slice-plan] | Executable plan, Behavior/Structure slices, proof, sizing/readiness | Shared decomposition and planning references; story refinement; slice-plan refinement |
| [dough-slice-plan-refinement][slice-refine] | Same-plan revision, Ready/Refine/Escalate, overrun, resplit recommendation | Slice planning; shared references; story refinement/decomposition; resplit |
| [dough-resplit-story][resplit] | Replacement stories, slice mapping, provisional plans, readiness holds | Decomposition; story refinement; slice-plan refinement; product backlog |
| [dough-product-backlog][backlog] | Direction, selected story references, priority, completion history | Client seed/anchor conventions; decomposition, refinement and planning workflows |
| [dough-adr-awareness][adr-skill] | Decisions, records, statuses, authority, supersession, exceptions | Client ADR index, records, conventions and conditional proposal template |
| [dough-update][update] | Release selection, source, baseline, installation, managed content | Pinned installer and four sourced helpers; declared payload files |
| [dough-acme-change-readiness][readiness] | Change proposal, work-item reference, risk, rollback signal, readiness brief | Client work-item convention; source-only Proposed guidance |
| [extract-guidance][extract] — internal | Extraction, generalization, provenance, recognition, Proposed guidance | AGENTS.md; ADR 0003; supplied source and direct references |
| [release-version][release-skill] — internal | Preparation, finalization, version, changelog, tag, release availability | ADR 0003; payload declarations; applicable behavior/delivery reviews |

Dependency placement matters: the broad `problem-decomposition.md` under story decomposition also owns slice rules; `planning.md` under story refinement also owns executable-plan rules. These are shared owners, not separate story-only rules.

## Concept inventory

### Product framing and story identity

Sources: [ADR 0001][adr1], [problem decomposition][problem], [seed format][seed-format], [planning reference][planning], [product backlog][backlog].

| Concept / terms in use | Meaning in the current material | ADR 0001 relationship |
| --- | --- | --- |
| Parent problem / current problem / concern / product idea | The situation worth changing; includes beneficiary, current workaround and desired effect | Mentioned through Seed; wider operational meaning Additional |
| Capability / problem-or-capability level | An ability or framing level above story selection; also used to name slice outcomes | Additional; hierarchy ambiguous |
| Beneficiary / user / customer / stakeholder | Person receiving value or affected by the outcome; several roles can differ | Mentioned; roles not distinguished |
| Evaluator | Person who can judge the result without inspecting implementation | Additional |
| Desired effect / desired change / outcome / result | Observable change sought at a particular level | Mentioned; levels need qualification |
| Business goal / broader ambition | Larger purpose to which a story contributes | Additional |
| Near-future direction / short-term vision | Human-controlled focus on one customer value or goal; primary scope input | Additional |
| User value / customer value / value now | Benefit and reason to pursue an outcome now | Mentioned; no independent definition |
| Learning value / highest learning / learning question | Value of testing a consequential assumption | Mentioned through Story; operational meaning Additional |
| Assumption / hypothesis / confidence | Belief awaiting evidence, proposed expectation, and uncertainty about it | Additional |
| Evidence / evaluation signal / acceptance signal | Observation used to assess a candidate or its outcome | Additional |
| Constraint / genuine constraint / boundary assumption | Restriction on the problem or outcome; distinguished from a proposed design | Additional |
| Alternative / simpler alternative / recommended direction | Competing course of action, including defer, manual or existing-tool options | Additional |
| Seed | Non-executable capture of one parent problem and canonical story sections; also holds later refinement and completion | Defined; operational use is more specific |
| Seed identity / seed ID / canonical seed directory / filename | Stable identity and client-defined storage representation of a seed | Client-owned |
| Seed metadata: status, planted, planted_during, trigger_when, scope | Lifecycle, creation date/context, resurfacing trigger, whole-set size | Client-owned; example field names have semantic problems |
| Resurfacing trigger / When to Surface | Condition for returning attention to a concern | Additional |
| Story / user story / candidate story | Possibility worth pursuing for user or learning value; candidate is a consideration state | Defined; candidates need not yet be fully understood |
| Selected story / understood story / refined story | Selection, sufficient understanding, and refinement result; related but distinct conditions | Additional |
| Story title / story section / stable anchor / story link | Human label, canonical representation, and reference identity | Mentioned canonical home; representation Client-owned |
| Parent story / original story / sibling story / replacement story | Original and replacements in resplitting; siblings share a decomposition context | Additional; “parent story” is under-specified |
| Goal | Beneficiary, desired change and contribution to a business goal | Additional |
| Scope / included behavior / material exclusions | What the selected story covers and deliberately leaves out | Additional |
| Key example / acceptance example / counterexample / boundary / exception | Concrete situations that clarify inclusion, exclusion or special behavior | Additional |
| Valuable / Visible / Vertical / 3V | Selection criteria: stakeholder outcome, externally evaluable result, end-to-end operation | Additional |
| Product prerequisite / dependency / Depends on | Prior outcome necessary for another; distinguished from invented technical preparation | Additional |
| Effort hypothesis / estimate / S–M–L / effort band | Comparative story sizing with confidence and assumptions | Client-owned band definitions |
| Safe stopping point / retained value / safety conditions | Useful, safe state if later work is cancelled or deferred | Additional; also used at slice level |
| First-to-drop order / scope reduction / deferral / cancellation | Removing or delaying candidate scope; not implied by reprioritization | Additional |
| Interim behavior / prototype / assumption test | Temporary usable behavior or bounded experiment to obtain evidence | Additional; not necessarily equivalent |
| Story decomposition | Resolve framing, choose useful story boundaries, size and order candidates | Additional |
| Story refinement | Establish goal, scope and examples for selected stories | Additional |
| Story resplitting | Replace a large story with smaller valuable stories and map existing plan/work to them | Additional |

### Backlog and execution planning

Sources: [backlog][backlog], [slice planning][slice-plan], [slice-plan refinement][slice-refine], [resplitting][resplit], [shared planning reference][planning], [shared decomposition reference][problem].

| Concept / terms in use | Meaning in the current material | ADR 0001 relationship |
| --- | --- | --- |
| Product backlog / backlog list | Global ordered selection of story references; details remain in seeds | Additional |
| Backlog item / entry / queued story | Reference to one selected story, with its exact title and seed ID | Additional; entry is not the story itself |
| Priority / ranking / ordering / backlog placement | Relative attention or delivery order informed by human priorities, direction, value, learning and prerequisites | Additional |
| Recently done / completion history | At most ten newest completed backlog entries | Additional |
| Completion record / completion evidence | Status and supporting evidence retained with the story; history list points to it | Additional |
| Roadmap | Broader planning artifact the backlog must not become | Client-owned/excluded artifact; undefined |
| Executable plan / execution plan / slice plan / active plan | One story's execution instructions, ordered slices, proof mappings and current decisions/learnings | Additional; main artifact missing from ADR 0001 |
| Provisional plan / mapped plan / awaiting story refinement | Resplit slice material saved for a later story but explicitly barred from execution/refinement | Additional; overlaps the name “plan” |
| Slice | Bounded executable unit within a selected story | Defined |
| Behavior slice / Behavior | Pre-condition, trigger, one external postcondition and outside-in proof | Mentioned in Slice; operational definition elsewhere |
| Structure slice / Structure | Internal change preserving behavior and immediately enabling the next Behavior | Mentioned in Slice; operational definition elsewhere |
| Slice type | Exactly Behavior or Structure | Additional |
| Slice status: planned / in-progress / done | Example progress vocabulary, replaceable by client conventions | Client-owned |
| Slice planning / execution planning / implementation planning | Produce one executable plan for an understood story | Additional; mostly synonyms |
| Slice-plan refinement / active-plan refinement / execution-plan refinement | Revise remaining slices in the same plan, preserving compatible evidence and completed work | Additional; mostly synonyms |
| Ready / Refine / Escalate | Classification of remaining slices: sufficiently bounded, needs subdivision, or requires higher-level review | Additional; action and condition labels mixed |
| Ready for direct execution / refinement recommended | Plan assessment with or without unresolved refinement triggers | Additional |
| Refined plan / readiness hold / execution can resume | Refinement result, explicit prohibition, or resume assessment | Additional; not a single lifecycle |
| Slice target / slice budget / hard limit | Expected effort threshold and stopping limit for a slice, including verification and cleanup | Client-owned values; “budget” is broader than “target” |
| Focused-test exception / external-wait exception | Permitted client exceptions to a slice's hard limit | Client-owned |
| Overrun / repeated-overrun threshold / escalation | Execution exceeding sizing assumptions and the rule for reconsidering slices or story scope | Client-owned policy |
| Slice count / resplit recommendation | Size signal counting current completed and remaining slices, excluding obsolete replaced slices | Additional; conflicting numerical rule |
| Attempt / attempt-owned work / developer work / unrelated work | Execution attempt and edit ownership relevant to safe recovery | Additional |
| Park / revert / preserve compatible work | Recover or stop safely without destroying others' work or still-valid evidence | Additional |
| Proof ownership / owning slice / promise mapping | Assign each checkable final-state promise to a slice and observable verification | Additional |
| Slice mapping / plan partition / replacement trace / realignment | Preserve scope, evidence and identity while redistributing work after resplitting | Additional |
| Current decisions / learnings / resume-useful history | Plan information that constrains or changes remaining work | Additional |
| Phase / quick task / milestone / phase artifacts / project memory | Host/client workflow structures surrounding the Open Dough artifacts | Client-owned; not extra Open Dough work levels |
| Delivery / implementation / execution / integration / cleanup | Different activities or outcomes in carrying out planned work | Mentioned/informal; completion boundaries need qualification |

### Examples, proof and validation

Sources: [planning reference][planning], [decomposition reference][problem], [ADR 0005][adr5], [AGENTS.md][agents], [slice planning][slice-plan].

| Concept / terms in use | Meaning in the current material | ADR 0001 relationship |
| --- | --- | --- |
| Pre-condition → trigger → result / postcondition | Situation, event and observed behavior; shared example form | Additional |
| Promise / final-state promise / requirement / contract | Checkable obligation to be satisfied; relation among these labels is implicit | Additional |
| Outside-in proof / stable boundary / high-level boundary | Verification at the externally meaningful boundary of the promised outcome | Additional |
| Proof / check / verification / demonstration / observation | Check procedure, execution and result are often grouped under “proof” | Additional; overloaded |
| Proof loop / single-proof-loop / implementation beat / multi-beat scenario | Cohesion and subdivision vocabulary used to judge slice size | Additional; no operational definition |
| Green result / focused verification / regression proof / unit proof / end-to-end check | Passing relevant checks and different verification scopes | Additional |
| Structure proof | Evidence that existing external behavior remains unchanged | Additional |
| Representative proof / experiment | Isolated check of a concrete infrastructure/storage assumption against an engine/version | Additional |
| Representative behavior review / walkthrough | Maintainer checks invocation context, required context and useful outcome | Additional; defined by maintainer guidance |
| Native acceptance story | Story owning real-tool validation requirements and evidence | Additional; defined by Accepted ADR 0005 |
| Implementation story | Story whose inexpensive functional completion can precede separately tracked native acceptance | Additional |
| Integration coverage / skill behavior coverage | Proof of shared host integration versus proof of a particular skill's behavior | Additional; deliberately distinct |
| Deterministic check / CI / fixture / assessment logic / assessor | Repeatable validation mechanisms; not substitutes for native behavioral evidence | Additional |
| Native run / fresh session / runtime / candidate | Actual tool execution and the particular guidance/environment being assessed | Additional; “candidate” differs from candidate story |
| Evidence record / reusable evidence / fresh execution / reuse judgment | Recorded observation and later decision on whether it still applies | Additional |
| Passed / pending / inconclusive / invalidated evidence | Validation judgments; separate from story, plan and guidance lifecycle states | Additional |
| Enduring behavior / executable examples / product documentation / enduring design | Long-lived homes for behavior and design after planning detail is spent | Mentioned indirectly; distinction Additional |

### Guidance, distribution and maintenance

Sources: [ADR 0001][adr1], [ADR 0003][adr3], [README][readme], [updater][update], [installation documentation][installation], [extractor][extract], [release skill][release-skill].

| Concept / terms in use | Meaning in the current material | ADR 0001 relationship |
| --- | --- | --- |
| Open Dough | Reusable development guidance product and source project | Product name; do not silently introduce OpenDO/OpenDOugh aliases |
| Guidance / practice / shared lifecycle definition | Instructions and ways of working; “practice” can be the behavior a skill encodes | Guidance Defined; relationships Additional |
| Philosophy / principle / process | Beliefs and rationale; judgment guidance; lifecycle activities and feedback | Additional taxonomy from README |
| Rule / AI agent rule | Agent instruction with scope/application conditions, possibly automatic | Mentioned; naming explicitly undecided |
| Skill / AI agent skill / on-demand skill | Reusable task instructions discoverable and executable by an agent | Mentioned; activation is a separate dimension |
| Open Dough skill | Client-intended skill at any guidance stage; `dough-` prefix | Defined |
| Internal skill / maintainer skill | Skill used only inside Open Dough; no mandatory `dough-` prefix | Defined |
| Runtime instructions / entrypoint / supporting instruction / reference / runtime dependency | Entry file and required material used to carry out guidance | Mentioned; composition not fully defined |
| Shared source / authoritative home / shared core | Canonical behavior from which tool integrations derive | Additional |
| Platform integration / adapter / discovery pointer / automatic-application bridge | Host-specific discovery or application mechanism | Additional; mechanisms are not interchangeable |
| Client project / target project / client repository | Repository using an installed payload; Open Dough also fills this role | Defined |
| Client project context / local conventions / repository guidance | Client-supplied paths, limits, workflows, status terms and decisions | Additional; distinct from configuration |
| Local guidance / local practice / unrelated guidance / home guidance | Client or user instructions outside Open Dough's managed payload | Additional |
| Source project / source repository / source snapshot / recorded source | Extraction origin, release supplier, immutable checkout, or locator | Additional distinctions; “source” overloaded |
| Client payload / managed payload | Complete declared release files to install | Defined |
| Managed content / managed files | Release-supplied files inside the client installation | Defined within Client installation |
| Client installation / installed copy / physical installation | Payload instance and record in a native root; sometimes the whole client setup | Defined; cardinality unclear |
| Tool / host / platform / running tool / invoking tool / entry context | Codex, Cursor or Claude Code; running tool chooses record lookup context | Additional |
| Native skill root / physical root / updater destination | Payload directory versus the nested updater directory containing records | Additional; distinct locations |
| Installation record / installed version / recorded SOURCE / VERSION | Source locator and numeric version, represented by two files per physical root | Defined; locator type needs widening |
| Baseline / recorded release / unchanged installation / unverifiable installation | Recorded release payload used for comparison, and comparison outcomes | Additional |
| Client configuration / open-dough.json | Reserved proposal for future client settings, separate from managed files | Defined, explicitly not yet implemented |
| Release / tagged release / source release | Immutable versioned source snapshot whose declared payload is available to clients | Defined |
| Version / numeric release version / MAJOR.MINOR.PATCH | One product-wide numeric identity; not independent skill versions | Mentioned; defined by ADR 0003 |
| Latest / highest numeric release | Highest numeric version tag in the supplied source, independent of dates or branch edits | Additional; defined by ADR 0003 |
| Tag / commit / pinned snapshot / detached checkout | Release name, immutable revision and inspected checkout representations | Additional technical representations |
| Changelog / release notes / dated entry | Human-readable change description associated with release metadata | Additional |
| Guidance revision lifecycle: Proposed / Promoted / Released | Draft/extracted revision; maintainer-selected revision; revision in an available tagged payload | Defined; binding source ADR 0003 |
| Installed | Copy relationship to a client and recorded release, not a fourth guidance stage | Defined |
| Public / publish / release availability | Accessibility versus making a release tag available | Additional distinctions fixed by ADR 0003 |
| Extraction / generalization | Turn one supplied practice into reusable Proposed guidance while preserving its source | Additional |
| Promotion / release preparation / finalization | Select revision/dependencies; prepare metadata; commit metadata and create local tag | Additional; finalization is not remote availability |
| Installation / ordinary update / forced reinstall / legacy bootstrap | First placement, verified baseline advance, explicitly forced replacement, older-installation migration | Mentioned; operation distinctions Additional |
| Adoption / local-guidance replacement / replacement suitability / equivalence | Project-specific substitution of a local practice; outside reusable updater behavior | Additional |
| Maintenance material / maintainer material | Source-only information supporting production, assessment or updates | Defined; harmless synonym |
| Recognition record / RECOGNITION.md | Descriptive purpose, triggers, distinctive behavior, context, provenance and review evidence | Defined |
| Provenance / original clues / source checksum / unchanged-source result | Origin and evidence the extractor preserved supplied files | Additional |
| Review / validation needed / evaluated guidance | Assessment evidence or remaining assessment work | Additional; not guidance lifecycle stages |
| Preservation / coexistence / retirement / recovery | Protect unrelated content, operate alongside it, remove obsolete managed files, recover an incomplete install | Additional |

### Decisions, authority and change readiness

Sources: [ADR awareness][adr-skill], [ADR catalog][adr-index], [ADR 0000][adr0], [change readiness][readiness].

| Concept / terms in use | Meaning in the current material | ADR 0001 relationship |
| --- | --- | --- |
| Architectural decision / ADR / decision record | Durable cross-cutting decision versus its written record | Mentioned; defined elsewhere |
| Architecture-shaped work / architecture area / architectural concern | Client-defined work requiring relevant ADR consultation | Client-owned |
| ADR store / index / catalog / current record set | Location and authoritative listing used to classify decisions | Client-owned; index/catalog are permitted equivalents |
| ADR Proposed / Accepted / Rejected / Superseded | Draft, current decision, declined proposal and historical replacement | Additional lifecycle, distinct from guidance stages |
| Authority / authoritative status field / filename hygiene | Which signals determine status versus naming conformity | Client-owned |
| Supersession / successor / chain / current Accepted ADR | Replacement relationship and valid current decision | Additional |
| Conflict / deviation / approved exception / durable trail | Incompatible action, departure, human authorization, and retained reason | Additional |
| Advice / consultation / proposal / acceptance / announcement / approval | Human decision activities; advice does not require consensus or an extra architect approver | Additional |
| Human / decision maker / maintainer / agent | Decision authority and execution roles; not always the same person | Additional |
| Proposal template / directed mechanical hygiene | Client format for requested drafting and maintenance after human decisions | Client-owned / Additional |
| Change proposal / proposed change | Input to readiness review; relationship to story, plan or ADR unspecified | Additional |
| Work item / work-item reference / TASK-NNN | Client intake identifier required by the readiness skill | Client-owned; not defined as a story or slice |
| Readiness brief / User / Outcome / Risk / Rollback / Missing context | Fixed brief fields; risk means main failure risk and rollback means a signal | Additional |
| Ready to build / ready for human review / final approval | Invocation question, produced assessment and human decision; not equivalent | Additional; boundary unclear |
| Completion marker | Required skill-report text such as STORY DECOMPOSITION WRITTEN or SLICE PLAN REFINED | Additional output contract; not proof of implementation |

## Collisions and poor uses

“Contradiction” means current statements give incompatible instructions or facts. “Ambiguity” means multiple plausible meanings remain. “Wording” means language obscures a reasonably inferable concept. Proposed resolutions below are recommendations, not adopted decisions.

| ID | Finding and evidence | Why it matters | Proposed resolution |
| --- | --- | --- | --- |
| C01 — Contradiction | [Slice-plan refinement][slice-refine] recommends resplitting at **greater than 15** slices. [Resplit description][resplit] says **more than 13**; its [recognition review][resplit-record] says 14 triggers it. | A 14- or 15-slice plan gets different advice depending on the file. Review evidence covers a different rule. | Choose the intended threshold once; reference its owner and align the description/review. The audit does not choose 13 or 15. |
| C02 — Ambiguity | [Planning reference][planning] defines an executable plan after story understanding. [Resplit][resplit] creates later “plans” that are provisional and explicitly not ready for refinement or execution. | “Plan exists” and “slice plan” no longer imply the input conditions that planning/refinement require. | Define **provisional plan** and **executable plan**, with the transition requiring story refinement and realignment. Qualify plan references where readiness matters. |
| C03 — Conflicting instruction | [Slice-plan refinement][slice-refine] says “Do not … implement product code,” but its input gate says “execute directly.” | Readiness advice can be interpreted as an instruction to execute during a refinement-only invocation. | Say “report ready for execution; no further refinement is required.” Keep authorization separate from readiness. |
| C04 — Ambiguity | Ready, refined, ready for direct execution, ready for human review, awaiting story refinement, and execution can resume occur across [planning][slice-plan], [refinement][slice-refine], [resplit][resplit], and [change readiness][readiness]. | These describe different objects, prerequisites and authority. “Refined” alone does not establish permission or every readiness condition. | Qualify **story understanding**, **plan execution readiness**, **slice assessment**, **review readiness**, and **execution authorization**. Do not impose one status enum on all of them. |
| C05 — Ambiguity | [ADR 0001][adr1] calls a story “romantic, speculative,” potentially fuzzy. [Decomposition][problem] uses the same term for candidates and requires 3V when selecting for planning. | This is compatible evolution, but the transition is implicit. Readers may require every initial idea to pass 3V or plan any speculative story. | Define Story as the evolving possibility; explicitly distinguish **candidate**, **selected**, and **understood for planning** conditions. Preserve the exploratory meaning. |
| C06 — Wording / hidden hierarchy | [Slice-plan refinement][slice-refine] says “parent-story review,” while its routing distinguishes selected-story changes from parent-problem/candidate-order changes. [Decomposition][problem] calls the upper level “Problem or capability.” | Implies an undefined story nesting hierarchy and makes the escalation destination unclear. “Capability” also names slice headings. | Use **selected-story review** or **parent-problem/decomposition review** as appropriate. Reserve **original story** for resplitting; define capability if it is to be a separate level. |
| C07 — Semantic collision | Seed metadata [uses `scope` for whole-set size][seed-format]; story refinement [uses Scope for inclusion/exclusion][planning]. | One word means size in one artifact and behavior boundaries in another. | Call the concept **aggregate effort/size** in prose and **story scope** for boundaries; map to legacy client field names explicitly. |
| C08 — Lifecycle assumption | [Seed format][seed-format] asks for “dormant status” and resurfacing metadata, but seeds also hold selected, active, refined and completed stories. | A seed created for immediate refinement need not be dormant. Seed status and story progress can differ. | Define a seed as a durable concern/story container, with client-owned seed lifecycle. Dormancy should be conditional rather than its universal initial meaning. |
| C09 — Boundary gap | [ADR 0001][adr1] gives every story a canonical seed home. [Slice planning][slice-plan] accepts the story and its seed “when one exists”; [planning][planning] permits a source decision link “when applicable.” | It is unclear whether externally represented or unseeded stories are supported exceptions or merely temporary missing context. | Decide the minimum story identity required for planning and whether a seed must first be created. State any supported external-story mapping. |
| C10 — Under-defined execution vocabulary | [Decomposition][problem] and [slice refinement][slice-refine] gate work on “proof loop,” “implementation beats,” “cohesive path,” and “Behavior/Structure gate.” | These terms decide whether work is split, yet offer no concrete test of sameness. Multiple assertions may belong to one outcome; several edits may belong to one implementation step. | Define the unit around one independently evaluable outcome and its implementation/verification cycle; replace “beat” with the actual observable step or separable change. Add one positive and one negative example. |
| C11 — Overloaded proof | [Planning][planning] uses Proof for a planned signal/check and also speaks of completed evidence and preserving proof. | A command written in a plan can be mistaken for evidence that the promise passed. | Distinguish **verification method**, **expected observation**, **observed result**, and **evidence record**. Proof can remain the umbrella concept. |
| C12 — Object/collection ambiguity | [ADR 0001][adr1] describes installations for each application. [Updater][update] operates on two roots for three tools, yet still says “selected installation.” [Helper][apply-helper] says both “shared installation” and “both physical installations.” | Unclear whether installation identity belongs to a project, tool or root, and whether `--platform` limits writes. | Define project-level installation as an aggregate or explicitly define per-root instances. Always distinguish **invoking tool**, **physical skill root**, and **all-root update operation**. |
| C13 — Scope wording drift | [Installation docs][installation] say installation preserves “any other tool's separate installation”; [README][readme] says projects may adopt “one or more integrations.” Current updater writes both supported roots together. | Sounds like supported tool layouts may be independently selected or preserved. The runtime operation has a different boundary. | State that each operation reconciles both supported roots while preserving unrelated guidance and unsupported layouts. Distinguish use of an integration from selective installation. |
| C14 — Definition too narrow | [ADR 0001][adr1] defines the installation source as a repository **URL**. [Updater][update] records a repository URL **or local path**. | A valid implemented source is excluded by the draft definition. “Source” also denotes extracted guidance and a checkout. | Use **release source locator (repository URL or local path)**; qualify extraction source and release snapshot separately. |
| C15 — Historical/current ambiguity | [ADR-awareness recognition][adr-record] says platforms “installed this record.” Current [updater][update] and [ADR 0003][adr3] exclude recognition records from installation; [installer][installer] retires the old record. | Historical evidence reads like the current payload contract. | Label that paragraph explicitly as evidence for an earlier payload and state the limits of reuse. Do not rewrite the original observation as though it never happened. |
| C16 — Missing concept relationship | The source-only [change-readiness skill][readiness] introduces **change proposal**, **work item**, and **readiness brief**, with no mapping to Story, Slice, Plan or ADR. | Could create a second, competing work model and approval path when promoted. | Treat work-item ID as client metadata; define what proposal types are supported and whether the brief evaluates a story, executable plan or another input. Keep this unresolved until its intended role is chosen. |
| C17 — Misleading readiness wording | [Change readiness][readiness] triggers on “ready to build” but only returns “ready for human review.” It demands concrete content under every heading, including Missing context, without saying whether “none” is valid or missing required context blocks readiness. `Rollback` actually means rollback signal. | Readers cannot infer build readiness or the exact readiness predicate from the brief. | Name the output **review-ready brief**, define required-context completeness, permit explicit “none” where appropriate, and label **rollback signal** precisely. |
| C18 — Lifecycle namespace ambiguity | **Proposed** is both an ADR state and a guidance-revision stage; **Review: ready for maintainer review** appears in recognition records alongside **Promoted/Released** in ADR 0003. | Can accidentally make review text or ADR acceptance determine release eligibility. | Qualify **ADR status**, **guidance revision stage**, **review result**, and **installed version**. Retain existing vocabulary inside those contexts; review text is not a stage registry. |
| C19 — Approval-role ambiguity | [ADR awareness][adr-skill] lists “consultation, announcement, decision, and approval”; [ADR process][adr-index] explicitly requires advice without a separate architect approval. | “Approval” can be read as an extra person or gate beyond the human decision maker. The skill also expressly disclaims new gates, so this is ambiguity rather than an actual mandated extra gate. | Use the client's **human decision/acceptance process** and distinguish explicit exception approval from ordinary ADR acceptance. |
| C20 — Completion boundary gap | [Backlog][backlog] says complete items after verifying evidence. [ADR 0005][adr5] allows an implementation story to finish while linked native acceptance remains pending. | Bare “done,” “verified” or “complete” can incorrectly imply release readiness or all-tool validation. | Name the completed object and criteria: story scope complete, native acceptance pending/passed, release checks satisfied. Preserve the separation ADR 0005 intentionally establishes. |
| C21 — Reference naming obscures responsibility | `dough-story-refinement/references/planning.md` owns story refinement, executable planning, proof, plan refinement and cleanup; `dough-story-decomposition/references/problem-decomposition.md` owns both story and slice decomposition. | Broad file names and story-owned directories hide which workflow owns a rule, encouraging duplicate definitions. | Make reference titles and link labels name the exact responsibility and section. Consider moving/splitting only if it improves clarity while preserving one authoritative source under ADR 0006. |
| C22 — Vocabulary collision in a related draft | [ADR 0002][adr2] calls “our payload—the codebase” the whole future maintenance burden. [ADR 0001][adr1] defines client payload as the declared installable subset. | The same product term refers to different sets of files. | In ADR 0002 use **codebase** or **maintained system**, reserving **client payload** for distribution content. |
| C23 — Taxonomy and provenance wording | [README][readme] treats philosophy, principles, process, rules and skills as “layers,” mixing kinds of meaning with delivery forms. `dough-acme-change-readiness` retains `acme` from its [extraction provenance][readiness-record]. | The layers are not necessarily a hierarchy; the client-specific name suggests behavior tied to a source organization even though the body is generalized. Neither is a naming-rule violation. | Distinguish **guidance content** from **guidance delivery form**. Consider a purpose-only readiness skill name if promoted; keep source identity in recognition provenance. |

## Distinctions to preserve

- **Seed ≠ story ≠ backlog entry ≠ executable plan ≠ slice.** A seed owns canonical story sections; the backlog references selected stories; a plan organizes slices for one story. A Structure slice is not a separate preparatory story.
- **Outcome ≠ value ≠ evidence.** An outcome is the change, value is why it matters, and evidence lets an evaluator judge it. A key example clarifies the outcome; it is not automatically an executed test.
- **Story ordering ≠ slice execution order ≠ global backlog priority.** These operate within different collections. Local seed numbers are not global priorities.
- **Product prerequisite ≠ runtime skill dependency ≠ Structure preparation.** Each is legitimate, but they relate different objects.
- **Story refinement ≠ slice-plan refinement.** One clarifies the outcome; the other changes the execution breakdown without silently changing that outcome.
- **Safe story stopping point ≠ safe slice boundary.** The first retains independently useful value; the second can be a safe internal Structure step immediately before its Behavior.
- **Client context ≠ client configuration ≠ managed content.** Context exists today in client guidance; the proposed configuration file is not yet introduced; edits to managed files are not supported customization.
- **Skill behavior review ≠ native integration proof ≠ native skill behavior proof.** Shared mechanism evidence may be reused; it cannot establish every skill's behavior.
- **Proposed guidance ≠ Proposed ADR. Released ≠ Installed. Finalized local tag ≠ published tag.** These labels describe different objects or availability relationships.
- **Recognition ≠ adoption ≠ installation.** Describing suitability, choosing to replace a local practice, and installing a release are different activities.

Harmless aliases can stay where context is clear: user story/story, ADR index/catalog, maintenance material/maintainer material, and execution plan/executable plan. Synonyms become problematic when they hide a change of object, stage, authority or required outcome.

## Suggested order for unification

1. Completed in source: resolve C01 and C03, which can directly change the agent's next action.
2. Agree the planning relationships and readiness distinctions in C02–C11, C16–C17 and C20. These are the largest missing area in ADR 0001.
3. Agree installation identity and source terminology in C12–C15, then qualify the lifecycle/authority terms in C18–C19.
4. Add the agreed concepts and relationships to the proposed glossary, retaining concrete procedures in their authoritative skill references. Use client-owned terms through explicit mappings rather than inventing universal phase/status/path conventions.
5. Align descriptions, runtime instructions and recognition evidence. Review one representative story-to-plan-to-resplit journey and one installation/update journey for consistent terms. Correct glossary prose alone will not resolve divergent executable instructions.

The original audit changed no runtime skill, installed copy, ADR, or lifecycle status. The subsequent C01/C03 source edits are recorded above. Neither the audit nor the manual resolution review claims native behavioral validation.

## Source references

[adr0]: ../../docs/adrs/0000-use-adrs-accepted.md
[adr1]: ../../docs/adrs/0001-ubiquitous-language.md
[adr2]: ../../docs/adrs/0002-software-development-lifecycle-principles.md
[adr3]: ../../docs/adrs/0003-tagged-release-versioning-accepted.md
[adr5]: ../../docs/adrs/0005-cross-tool-validation-accepted.md
[adr6]: ../../docs/adrs/0006-write-skills-for-executing-agents-accepted.md
[adr-index]: ../../docs/adrs/README.md
[agents]: ../../AGENTS.md
[readme]: ../../README.md
[decompose]: ../../src/skills/dough-story-decomposition/SKILL.md
[refine]: ../../src/skills/dough-story-refinement/SKILL.md
[slice-plan]: ../../src/skills/dough-slice-planning/SKILL.md
[slice-refine]: ../../src/skills/dough-slice-plan-refinement/SKILL.md
[resplit]: ../../src/skills/dough-resplit-story/SKILL.md
[backlog]: ../../src/skills/dough-product-backlog/SKILL.md
[adr-skill]: ../../src/skills/dough-adr-awareness/SKILL.md
[update]: ../../src/skills/dough-update/SKILL.md
[readiness]: ../../src/skills/dough-acme-change-readiness/SKILL.md
[problem]: ../../src/skills/dough-story-decomposition/references/problem-decomposition.md
[seed-format]: ../../src/skills/dough-story-decomposition/references/seed-format.md
[planning]: ../../src/skills/dough-story-refinement/references/planning.md
[extract]: ../../.agents/skills/extract-guidance/SKILL.md
[release-skill]: ../../.agents/skills/release-version/SKILL.md
[installation]: ../../docs/installation-and-updates.md
[installer]: ../../install.sh
[apply-helper]: ../../src/install/open-dough-release-apply.sh
[adr-record]: ../../src/skills/dough-adr-awareness/RECOGNITION.md
[resplit-record]: ../../src/skills/dough-resplit-story/RECOGNITION.md
[readiness-record]: ../../src/skills/dough-acme-change-readiness/RECOGNITION.md
