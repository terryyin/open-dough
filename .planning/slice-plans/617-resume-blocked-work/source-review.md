# Source-only review

Launch identity: `/root/source_review`

Original input: [verbatim reviewer launch input](source-review-input.md).

## Returned source clauses

Source-only review completed. I read no project files and changed nothing. The identifiers below describe source promises and qualifications, not slice ownership or acceptance criteria.

**Goal and blocked-state behavior**

- **C01 — Leave blocked work:** A developer can leave an authorized execution that cannot currently advance.
- **C02 — Avoid unchanged-state requests:** Generate no recurring model requests solely to recheck unchanged blocked state.
- **C03 — Avoid reconstruction:** Preserve enough execution state that the developer does not have to reconstruct its work.
- **C04 — Respond to changed conditions:** When the recorded condition changes, the correct execution resumes **or** gives actionable attention.
- **C05 — Preserve ownership:** Preserve the execution’s ownership.
- **C06 — Preserve work:** Preserve its work.
- **C07 — Preserve outstanding proof:** Preserve its outstanding proof.
- **C08 — Distinguish supplier pause:** Distinguish a paused supplier from verification that is actually running.
- **C09 — Distinguish host hold:** Distinguish a host usage hold from verification that is actually running.

**Retained execution state**

- **C10:** Retain the execution identity.
- **C11:** Retain its checkout.
- **C12:** Retain its branch.
- **C13:** Retain its owner.
- **C14:** Retain its last accepted proof.
- **C15:** Retain that proof’s applicable revision.
- **C16:** Retain unfinished work.
- **C17:** Retain the exact resume condition.
- **C18:** Retain a supported continuation handle **when available**.
- **C19:** Retain the “next observation or attention owner,” preserving the source’s wording and alternative.
- **C20 — Preserve claim identity:** Saving a condition does not create a new execution claim.

**Continuation and attention**

- **C21 — Resume once:** Resume the right work once on a qualifying change.
- **C22 — Unavailable signal:** Give actionable status when a required signal is unavailable.
- **C23 — Missed deadline:** Give actionable status when a deadline is missed.
- **C24 — Lost CI observation:** Give actionable status when required CI observation is lost.
- **C25 — Preserve authority:** Resume under the original execution authority.
- **C26 — Supported automatic path:** Automatically continue already-authorized work where the host supports delivery.
- **C27 — Unavailable delivery:** Retain state when delivery is unavailable.
- **C28 — Uncertain delivery:** Retain state when delivery is uncertain.
- **C29 — Unavailable-delivery attention:** Give actionable attention when delivery is unavailable.
- **C30 — Uncertain-delivery attention:** Give actionable attention when delivery is uncertain.
- **C31 — Demonstrated Codex continuation:** Demonstrate a successful automatic Codex resume.
- **C32 — Manual fallback:** Provide manual resume as the fallback.
- **C33 — Supported-path experience:** On the supported path, continuation needs no typed developer “resume.”

**Authority qualifications**

- **Q01:** A resume supplies no permission to change scope.
- **Q02:** A resume supplies no permission to choose another model.
- **Q03:** A resume supplies no permission to purchase capacity.
- **Q04:** A resume supplies no permission to waive proof.
- **Q05:** Necessary bounded liveness checks remain meaningful observations.
- **Q06:** Genuine changes remain meaningful observations.
- **Q07:** Deadlines remain meaningful observations.
- **Q08:** Manual resume is the fallback, rather than the normal supported-host path.

**Proof and observation continuity**

- **C34:** Keep the existing CI receipt rules.
- **C35:** Keep the existing overdue-verification rules.
- **C36:** Keep the existing observer-recovery rules.
- **C37:** Local proof remains accepted evidence when CI coverage is lost.
- **C38:** A wake-up does not manufacture a CI completion receipt.
- **C39:** Local proof does not manufacture a CI completion receipt.
- **C40:** At the applicable completion boundary, a known ended observer follows SEED-343’s managed recovery.

**Shared guidance and evidence**

- **C41:** Provide initial comparative proof in Codex.
- **C42:** Provide shared guidance for Codex.
- **C43:** Provide shared guidance for Cursor.
- **C44:** Provide shared guidance for Claude Code.
- **C45:** State explicit evidence limits for the different adapters.
- **C46:** Investigate usage-limit reset observability.
- **Q09:** Do not infer a usage-limit reset from elapsed time.

**Additional commitments exposed by the examples**

- **C47 — Specific supplier need:** When the consumer reaches its supplier blocker, retain the exact supplier outcome it needs.
- **C48 — Supported yield or attention:** Yield through a supported facility **or** report the missing facility.
- **C49 — Reassess the condition:** Delivered new supplier evidence causes reassessment of the exact retained condition.
- **Q10:** Continue when that condition is satisfied; publication alone does not establish satisfaction.
- **Q11:** Supplier completion alone does not establish satisfaction.
- **C50 — Prevent competing writers:** Repeated or uncertain delivery starts no competing writer.
- **C51 — Prevent blind duplication:** Repeated or uncertain delivery starts no blind duplicate submission.
- **C52 — Retain uncertain execution:** Uncertain acceptance retains the execution.
- **C53 — Explain reconciliation:** Explain how its owner can reconcile uncertain acceptance.
- **C54 — Report wake truthfully:** Do not report an attempted wake as confirmed continuation.
- **C55 — Deadline/loss status:** Actionable status names what is known.
- **C56 — Deadline/loss proof:** Actionable status names the remaining proof.
- **C57 — Deadline/loss recovery:** Actionable status names the exact recovery.
- **C58 — Deadline/loss ownership:** Actionable status names the owner.
- **C59 — No inferred supplier success:** Deadline or observation-loss status claims no supplier success.
- **C60 — No inferred CI success:** Deadline or observation-loss status claims no successful CI.
- **C61 — Missing reset signal:** Without reliable reset evidence, status names the missing signal.
- **C62 — Reset recovery ownership:** Without reliable reset evidence, status names the recovery owner.
- **Q12:** An observed usage reset **may** qualify a continuation; observation is not an unconditional promise to resume.
- **Q13:** Six hours passing is not proof of a reset.
- **Q14:** Switching models is not proof of a reset.
- **Q15:** Buying credits is not proof of a reset.
- **Q16:** Six hours passing grants no new authority.
- **Q17:** Switching models grants no new authority.
- **Q18:** Buying credits grants no new authority.

**Trigger and journey examples**

1. **Known supplier pause:** A consumer with preserved partial work and accepted proof reaches a paused supplier, with no verification running. It records the exact required supplier outcome and takes the supported-yield **or** missing-facility path. Unchanged supplier state produces no recurring model checks.
2. **Qualifying change:** New supplier evidence reaches a retained consumer. It reassesses its exact condition and, when satisfied, continues its own authorized work once. Publication and supplier completion are examples of evidence that do not alone establish satisfaction.
3. **Repeated or uncertain delivery:** A previously acted-on signal reappears, or acceptance is uncertain. The execution avoids competing writers and blind duplicate submissions. Uncertainty preserves the execution and gives its owner a reconciliation path.
4. **Deadline or observation loss:** A meaningful deadline arrives, or required observation becomes unavailable. Status provides known facts, remaining proof, exact recovery and owner, without claiming supplier or CI success. The known-ended-observer case follows the referenced managed recovery.
5. **Host usage hold:** Claude Code reports a model usage limit. The execution is retained. An observed reset may qualify continuation; absent reliable evidence, attention identifies the missing signal and recovery owner.

These are representative journeys and conditional promises. They do not make their particular starting circumstances mandatory for every supported case.

**Comparative evaluation commitments**

- **C63:** Observe the same publication decisions in a comparable run.
- **C64:** Observe the same proof decisions in that comparable run.
- **C65:** Observe fewer idle requests.
- **C66:** Observe no extra developer rescue.
- **C67:** Establish native feasibility through execution observation.
- **C68:** Establish comparative improvement through execution observation.
- **Q19:** Do not infer native feasibility.
- **Q20:** Do not infer comparative improvement.
- **Q21:** Comparative evaluation continues to preserve the applicable CI receipt rules.
- **Q22:** Comparative evaluation continues to preserve overdue liveness rules.

**Delivery limits and exclusions**

- **X01:** Reducing the cost of waiting for a running verification command belongs to the sibling long-verification story.
- **X02:** Automatic recovery after host/session exit is not a delivery commitment.
- **X03:** Automatic recovery after quota resets is not a delivery commitment.
- **X04:** Release/rollout is not a delivery commitment.
- **X05:** The general effort-accounting tool is not a delivery commitment.
- **X06:** Context compaction is not a delivery commitment.
- **X07:** A general background job scheduler is not a delivery commitment.
- **Q23:** The listed scope limits do not become rejection rules for cases a simple solution naturally supports.

The statement that this is the first efficiency story, because supplier pause caused idle requests and developer rescue, supplies motivation rather than an additional behavioral promise.

## Commitments

| Id | Source commitment | Slice | Observation or obligation |
| --- | --- | --- | --- |
| C01 | Leave blocked work: A developer can leave an authorized execution that cannot currently advance. | slice 4 |  |
| C02 | Avoid unchanged-state requests: Generate no recurring model requests solely to recheck unchanged blocked state. | slice 2 | observed: slice2-assessment.md#proof-index; first lifecycle unchanged/unproved/qualified evidence and same-worker rearm assertions; slice2-native-run actual same-thread accepted/completed records, matching native settings, independent report and zero extra replay turn |
| C03 | Avoid reconstruction: Preserve enough execution state that the developer does not have to reconstruct its work. | slice 2 | observed: slice2-assessment.md#proof-index; blocked-execution.test.mjs retained.input, accepted/outstanding proof arrays, original partial bytes and repeated enrollment; native accepted/completed records retain revision, owner and authority |
| C04 | Respond to changed conditions: When the recorded condition changes, the correct execution resumes **or** gives actionable attention. | slice 4 |  |
| C05 | Preserve ownership: Preserve the execution’s ownership. | slice 2 | observed: slice2-assessment.md#proof-index; blocked-execution.test.mjs retained.input, accepted/outstanding proof arrays, original partial bytes and repeated enrollment; native accepted/completed records retain revision, owner and authority |
| C06 | Preserve work: Preserve its work. | slice 2 | observed: slice2-assessment.md#proof-index; blocked-execution.test.mjs retained.input, accepted/outstanding proof arrays, original partial bytes and repeated enrollment; native accepted/completed records retain revision, owner and authority |
| C07 | Preserve outstanding proof: Preserve its outstanding proof. | slice 3 | observed: slice3-assessment.md promise table; actual CLI attention/loss/usage records retain identity/authority/work/proof and executable owner recovery; controlled expiry/loss yields one same-thread attention, uncertainty reconciles exact history, repeated recovery preserves settled generation and one submission |
| C08 | Distinguish supplier pause: Distinguish a paused supplier from verification that is actually running. | slice 2 | observed: blocked-execution.test.mjs running verification rejection before supplier enrollment; delegation and overdue guidance retain the existing verification owner |
| C09 | Distinguish host hold: Distinguish a host usage hold from verification that is actually running. | slice 3 | observed: existing running-verification rejection and overdue guidance suites remain passing; SKILL/delegation/overdue route paused supplier or usage hold to one shared policy |
| C10 | Retain the execution identity. | slice 2 | observed: slice2-assessment.md#proof-index; blocked-execution.test.mjs retained.input, accepted/outstanding proof arrays, original partial bytes and repeated enrollment; native accepted/completed records retain revision, owner and authority |
| C11 | Retain its checkout. | slice 2 | observed: slice2-assessment.md#proof-index; blocked-execution.test.mjs retained.input, accepted/outstanding proof arrays, original partial bytes and repeated enrollment; native accepted/completed records retain revision, owner and authority |
| C12 | Retain its branch. | slice 2 | observed: slice2-assessment.md#proof-index; blocked-execution.test.mjs retained.input, accepted/outstanding proof arrays, original partial bytes and repeated enrollment; native accepted/completed records retain revision, owner and authority |
| C13 | Retain its owner. | slice 2 | observed: slice2-assessment.md#proof-index; blocked-execution.test.mjs retained.input, accepted/outstanding proof arrays, original partial bytes and repeated enrollment; native accepted/completed records retain revision, owner and authority |
| C14 | Retain its last accepted proof. | slice 2 | observed: slice2-assessment.md#proof-index; blocked-execution.test.mjs retained.input, accepted/outstanding proof arrays, original partial bytes and repeated enrollment; native accepted/completed records retain revision, owner and authority |
| C15 | Retain that proof’s applicable revision. | slice 2 | observed: slice2-assessment.md#proof-index; blocked-execution.test.mjs retained.input, accepted/outstanding proof arrays, original partial bytes and repeated enrollment; native accepted/completed records retain revision, owner and authority |
| C16 | Retain unfinished work. | slice 2 | observed: slice2-assessment.md#proof-index; blocked-execution.test.mjs retained.input, accepted/outstanding proof arrays, original partial bytes and repeated enrollment; native accepted/completed records retain revision, owner and authority |
| C17 | Retain the exact resume condition. | slice 2 | observed: slice2-assessment.md#proof-index; blocked-execution.test.mjs retained.input, accepted/outstanding proof arrays, original partial bytes and repeated enrollment; native accepted/completed records retain revision, owner and authority |
| C18 | Retain a supported continuation handle **when available**. | slice 2 | observed: slice2-assessment.md#proof-index; blocked-execution.test.mjs retained.input, accepted/outstanding proof arrays, original partial bytes and repeated enrollment; native accepted/completed records retain revision, owner and authority |
| C19 | Retain the “next observation or attention owner,” preserving the source’s wording and alternative. | slice 2 | observed: slice2-assessment.md#proof-index; blocked-execution.test.mjs retained.input, accepted/outstanding proof arrays, original partial bytes and repeated enrollment; native accepted/completed records retain revision, owner and authority |
| C20 | Preserve claim identity: Saving a condition does not create a new execution claim. | slice 2 | observed: slice2-assessment.md#proof-index; blocked-execution.test.mjs retained.input, accepted/outstanding proof arrays, original partial bytes and repeated enrollment; native accepted/completed records retain revision, owner and authority |
| C21 | Resume once: Resume the right work once on a qualifying change. | slice 2 | observed: slice2-assessment.md#proof-index; first lifecycle unchanged/unproved/qualified evidence and same-worker rearm assertions; slice2-native-run actual same-thread accepted/completed records, matching native settings, independent report and zero extra replay turn |
| C22 | Unavailable signal: Give actionable status when a required signal is unavailable. | slice 3 | observed: slice3-assessment.md promise table; actual CLI attention/loss/usage records retain identity/authority/work/proof and executable owner recovery; controlled expiry/loss yields one same-thread attention, uncertainty reconciles exact history, repeated recovery preserves settled generation and one submission |
| C23 | Missed deadline: Give actionable status when a deadline is missed. | slice 3 | observed: slice3-assessment.md promise table; actual CLI attention/loss/usage records retain identity/authority/work/proof and executable owner recovery; controlled expiry/loss yields one same-thread attention, uncertainty reconciles exact history, repeated recovery preserves settled generation and one submission |
| C24 | Lost CI observation: Give actionable status when required CI observation is lost. | slice 3 | observed: slice3-assessment.md promise table; actual CLI attention/loss/usage records retain identity/authority/work/proof and executable owner recovery; controlled expiry/loss yields one same-thread attention, uncertainty reconciles exact history, repeated recovery preserves settled generation and one submission |
| C25 | Preserve authority: Resume under the original execution authority. | slice 2 | observed: slice2-assessment.md#proof-index; first lifecycle unchanged/unproved/qualified evidence and same-worker rearm assertions; slice2-native-run actual same-thread accepted/completed records, matching native settings, independent report and zero extra replay turn |
| C26 | Supported automatic path: Automatically continue already-authorized work where the host supports delivery. | slice 2 | observed: slice2-assessment.md#proof-index; first lifecycle unchanged/unproved/qualified evidence and same-worker rearm assertions; slice2-native-run actual same-thread accepted/completed records, matching native settings, independent report and zero extra replay turn |
| C27 | Unavailable delivery: Retain state when delivery is unavailable. | slice 3 | observed: slice3-assessment.md promise table; actual CLI attention/loss/usage records retain identity/authority/work/proof and executable owner recovery; controlled expiry/loss yields one same-thread attention, uncertainty reconciles exact history, repeated recovery preserves settled generation and one submission |
| C28 | Uncertain delivery: Retain state when delivery is uncertain. | slice 3 | observed: slice3-assessment.md promise table; actual CLI attention/loss/usage records retain identity/authority/work/proof and executable owner recovery; controlled expiry/loss yields one same-thread attention, uncertainty reconciles exact history, repeated recovery preserves settled generation and one submission |
| C29 | Unavailable-delivery attention: Give actionable attention when delivery is unavailable. | slice 3 | observed: slice3-assessment.md promise table; actual CLI attention/loss/usage records retain identity/authority/work/proof and executable owner recovery; controlled expiry/loss yields one same-thread attention, uncertainty reconciles exact history, repeated recovery preserves settled generation and one submission |
| C30 | Uncertain-delivery attention: Give actionable attention when delivery is uncertain. | slice 3 | observed: slice3-assessment.md promise table; actual CLI attention/loss/usage records retain identity/authority/work/proof and executable owner recovery; controlled expiry/loss yields one same-thread attention, uncertainty reconciles exact history, repeated recovery preserves settled generation and one submission |
| C31 | Demonstrated Codex continuation: Demonstrate a successful automatic Codex resume. | slice 1 | observed: native-probe-assessment.md; native-probe-run/native-acceptance.json, held/resumed native history and matching settings; actual completed same-thread turn, feasibility only |
| C32 | Manual fallback: Provide manual resume as the fallback. | slice 3 | observed: slice3-assessment.md promise table; actual CLI attention/loss/usage records retain identity/authority/work/proof and executable owner recovery; controlled expiry/loss yields one same-thread attention, uncertainty reconciles exact history, repeated recovery preserves settled generation and one submission |
| C33 | Supported-path experience: On the supported path, continuation needs no typed developer “resume.” | slice 2 | observed: slice2-assessment.md#proof-index; first lifecycle unchanged/unproved/qualified evidence and same-worker rearm assertions; slice2-native-run actual same-thread accepted/completed records, matching native settings, independent report and zero extra replay turn |
| C34 | Keep the existing CI receipt rules. | slice 3 | observed: blocked-execution-attention.test.mjs CI loss retains full outstanding SHA/repo/target/observer/managed-recovery context and unchanged terminal bytes; existing execution-completion-recovery and guidance suites pass; no new CI receipt or observer operation |
| C35 | Keep the existing overdue-verification rules. | slice 3 | observed: existing running-verification rejection and overdue guidance suites remain passing; SKILL/delegation/overdue route paused supplier or usage hold to one shared policy |
| C36 | Keep the existing observer-recovery rules. | slice 3 | observed: blocked-execution-attention.test.mjs CI loss retains full outstanding SHA/repo/target/observer/managed-recovery context and unchanged terminal bytes; existing execution-completion-recovery and guidance suites pass; no new CI receipt or observer operation |
| C37 | Local proof remains accepted evidence when CI coverage is lost. | slice 3 | observed: slice3-assessment.md promise table; actual CLI attention/loss/usage records retain identity/authority/work/proof and executable owner recovery; controlled expiry/loss yields one same-thread attention, uncertainty reconciles exact history, repeated recovery preserves settled generation and one submission |
| C38 | A wake-up does not manufacture a CI completion receipt. | slice 3 | observed: blocked-execution-attention.test.mjs CI loss retains full outstanding SHA/repo/target/observer/managed-recovery context and unchanged terminal bytes; existing execution-completion-recovery and guidance suites pass; no new CI receipt or observer operation |
| C39 | Local proof does not manufacture a CI completion receipt. | slice 3 | observed: blocked-execution-attention.test.mjs CI loss retains full outstanding SHA/repo/target/observer/managed-recovery context and unchanged terminal bytes; existing execution-completion-recovery and guidance suites pass; no new CI receipt or observer operation |
| C40 | At the applicable completion boundary, a known ended observer follows SEED-343’s managed recovery. | slice 3 | observed: blocked-execution-attention.test.mjs CI loss retains full outstanding SHA/repo/target/observer/managed-recovery context and unchanged terminal bytes; existing execution-completion-recovery and guidance suites pass; no new CI receipt or observer operation |
| C41 | Provide initial comparative proof in Codex. | slice 4 |  |
| C42 | Provide shared guidance for Codex. | slice 4 |  |
| C43 | Provide shared guidance for Cursor. | slice 4 |  |
| C44 | Provide shared guidance for Claude Code. | slice 4 |  |
| C45 | State explicit evidence limits for the different adapters. | slice 4 |  |
| C46 | Investigate usage-limit reset observability. | slice 3 | observed: slice3-assessment.md usage observability investigation: official interactive-mode/statusline documentation, bounded read-only findings and explicit absence of a current observed reset for the audited executions |
| C47 | Specific supplier need: When the consumer reaches its supplier blocker, retain the exact supplier outcome it needs. | slice 2 | observed: slice2-assessment.md#proof-index; first lifecycle unchanged/unproved/qualified evidence and same-worker rearm assertions; slice2-native-run actual same-thread accepted/completed records, matching native settings, independent report and zero extra replay turn |
| C48 | Supported yield or attention: Yield through a supported facility **or** report the missing facility. | slice 2 | observed: slice2-assessment.md#proof-index; first lifecycle unchanged/unproved/qualified evidence and same-worker rearm assertions; slice2-native-run actual same-thread accepted/completed records, matching native settings, independent report and zero extra replay turn |
| C49 | Reassess the condition: Delivered new supplier evidence causes reassessment of the exact retained condition. | slice 2 | observed: slice2-assessment.md#proof-index; first lifecycle unchanged/unproved/qualified evidence and same-worker rearm assertions; slice2-native-run actual same-thread accepted/completed records, matching native settings, independent report and zero extra replay turn |
| C50 | Prevent competing writers: Repeated or uncertain delivery starts no competing writer. |  | G1 |
| C51 | Prevent blind duplication: Repeated or uncertain delivery starts no blind duplicate submission. | slice 2 | observed: blocked-execution-races.test.mjs lost acknowledgment and absent acceptance cases; generated recovery argv executed from another cwd, exact matching native history, repeat recovery retains one submission |
| C52 | Retain uncertain execution: Uncertain acceptance retains the execution. | slice 2 | observed: blocked-execution-races.test.mjs lost acknowledgment and absent acceptance cases; generated recovery argv executed from another cwd, exact matching native history, repeat recovery retains one submission |
| C53 | Explain reconciliation: Explain how its owner can reconcile uncertain acceptance. | slice 2 | observed: blocked-execution-races.test.mjs lost acknowledgment and absent acceptance cases; generated recovery argv executed from another cwd, exact matching native history, repeat recovery retains one submission |
| C54 | Report wake truthfully: Do not report an attempted wake as confirmed continuation. | slice 2 | observed: blocked-execution-races.test.mjs lost acknowledgment and absent acceptance cases; generated recovery argv executed from another cwd, exact matching native history, repeat recovery retains one submission |
| C55 | Deadline/loss status: Actionable status names what is known. | slice 3 | observed: slice3-assessment.md promise table; actual CLI attention/loss/usage records retain identity/authority/work/proof and executable owner recovery; controlled expiry/loss yields one same-thread attention, uncertainty reconciles exact history, repeated recovery preserves settled generation and one submission |
| C56 | Deadline/loss proof: Actionable status names the remaining proof. | slice 3 | observed: slice3-assessment.md promise table; actual CLI attention/loss/usage records retain identity/authority/work/proof and executable owner recovery; controlled expiry/loss yields one same-thread attention, uncertainty reconciles exact history, repeated recovery preserves settled generation and one submission |
| C57 | Deadline/loss recovery: Actionable status names the exact recovery. | slice 3 | observed: slice3-assessment.md promise table; actual CLI attention/loss/usage records retain identity/authority/work/proof and executable owner recovery; controlled expiry/loss yields one same-thread attention, uncertainty reconciles exact history, repeated recovery preserves settled generation and one submission |
| C58 | Deadline/loss ownership: Actionable status names the owner. | slice 3 | observed: slice3-assessment.md promise table; actual CLI attention/loss/usage records retain identity/authority/work/proof and executable owner recovery; controlled expiry/loss yields one same-thread attention, uncertainty reconciles exact history, repeated recovery preserves settled generation and one submission |
| C59 | No inferred supplier success: Deadline or observation-loss status claims no supplier success. | slice 3 | observed: slice3-assessment.md promise table; actual CLI attention/loss/usage records retain identity/authority/work/proof and executable owner recovery; controlled expiry/loss yields one same-thread attention, uncertainty reconciles exact history, repeated recovery preserves settled generation and one submission |
| C60 | No inferred CI success: Deadline or observation-loss status claims no successful CI. | slice 3 | observed: slice3-assessment.md promise table; actual CLI attention/loss/usage records retain identity/authority/work/proof and executable owner recovery; controlled expiry/loss yields one same-thread attention, uncertainty reconciles exact history, repeated recovery preserves settled generation and one submission |
| C61 | Missing reset signal: Without reliable reset evidence, status names the missing signal. | slice 3 | observed: blocked-execution-usage.test.mjs: six controlled hours and model/purchase offers produce no input; missing-reset receipts retain owner/proof and execute project-owned manual fallback; evidenced fixture reset permits one same-authority reassessment, with real-host limits explicit |
| C62 | Reset recovery ownership: Without reliable reset evidence, status names the recovery owner. | slice 3 | observed: blocked-execution-usage.test.mjs: six controlled hours and model/purchase offers produce no input; missing-reset receipts retain owner/proof and execute project-owned manual fallback; evidenced fixture reset permits one same-authority reassessment, with real-host limits explicit |
| C63 | Observe the same publication decisions in a comparable run. | slice 4 |  |
| C64 | Observe the same proof decisions in that comparable run. | slice 4 |  |
| C65 | Observe fewer idle requests. | slice 4 |  |
| C66 | Observe no extra developer rescue. | slice 4 |  |
| C67 | Establish native feasibility through execution observation. | slice 1 | observed: native-probe-assessment.md; native-probe-run/native-acceptance.json, held/resumed native history and matching settings; actual completed same-thread turn, feasibility only |
| C68 | Establish comparative improvement through execution observation. | slice 4 |  |
| Q01 | A resume supplies no permission to change scope. | slice 2 | observed: slice2-assessment.md#proof-index; first lifecycle unchanged/unproved/qualified evidence and same-worker rearm assertions; slice2-native-run actual same-thread accepted/completed records, matching native settings, independent report and zero extra replay turn |
| Q02 | A resume supplies no permission to choose another model. | slice 2 | observed: slice2-assessment.md#proof-index; first lifecycle unchanged/unproved/qualified evidence and same-worker rearm assertions; slice2-native-run actual same-thread accepted/completed records, matching native settings, independent report and zero extra replay turn |
| Q03 | A resume supplies no permission to purchase capacity. | slice 2 | observed: slice2-assessment.md#proof-index; first lifecycle unchanged/unproved/qualified evidence and same-worker rearm assertions; slice2-native-run actual same-thread accepted/completed records, matching native settings, independent report and zero extra replay turn |
| Q04 | A resume supplies no permission to waive proof. | slice 2 | observed: slice2-assessment.md#proof-index; first lifecycle unchanged/unproved/qualified evidence and same-worker rearm assertions; slice2-native-run actual same-thread accepted/completed records, matching native settings, independent report and zero extra replay turn |
| Q05 | Necessary bounded liveness checks remain meaningful observations. | slice 3 | observed: existing running-verification rejection and overdue guidance suites remain passing; SKILL/delegation/overdue route paused supplier or usage hold to one shared policy |
| Q06 | Genuine changes remain meaningful observations. | slice 2 | observed: slice2-assessment.md#proof-index; first lifecycle unchanged/unproved/qualified evidence and same-worker rearm assertions; slice2-native-run actual same-thread accepted/completed records, matching native settings, independent report and zero extra replay turn |
| Q07 | Deadlines remain meaningful observations. | slice 3 | observed: slice3-assessment.md promise table; actual CLI attention/loss/usage records retain identity/authority/work/proof and executable owner recovery; controlled expiry/loss yields one same-thread attention, uncertainty reconciles exact history, repeated recovery preserves settled generation and one submission |
| Q08 | Manual resume is the fallback, rather than the normal supported-host path. | slice 2 | observed: slice2-assessment.md#proof-index; first lifecycle unchanged/unproved/qualified evidence and same-worker rearm assertions; slice2-native-run actual same-thread accepted/completed records, matching native settings, independent report and zero extra replay turn |
| Q09 | Do not infer a usage-limit reset from elapsed time. | slice 3 | observed: blocked-execution-usage.test.mjs: six controlled hours and model/purchase offers produce no input; missing-reset receipts retain owner/proof and execute project-owned manual fallback; evidenced fixture reset permits one same-authority reassessment, with real-host limits explicit |
| Q10 | Continue when that condition is satisfied; publication alone does not establish satisfaction. | slice 2 | observed: slice2-assessment.md#proof-index; first lifecycle unchanged/unproved/qualified evidence and same-worker rearm assertions; slice2-native-run actual same-thread accepted/completed records, matching native settings, independent report and zero extra replay turn |
| Q11 | Supplier completion alone does not establish satisfaction. | slice 2 | observed: slice2-assessment.md#proof-index; first lifecycle unchanged/unproved/qualified evidence and same-worker rearm assertions; slice2-native-run actual same-thread accepted/completed records, matching native settings, independent report and zero extra replay turn |
| Q12 | An observed usage reset **may** qualify a continuation; observation is not an unconditional promise to resume. | slice 3 | observed: blocked-execution-usage.test.mjs: six controlled hours and model/purchase offers produce no input; missing-reset receipts retain owner/proof and execute project-owned manual fallback; evidenced fixture reset permits one same-authority reassessment, with real-host limits explicit |
| Q13 | Six hours passing is not proof of a reset. | slice 3 | observed: blocked-execution-usage.test.mjs: six controlled hours and model/purchase offers produce no input; missing-reset receipts retain owner/proof and execute project-owned manual fallback; evidenced fixture reset permits one same-authority reassessment, with real-host limits explicit |
| Q14 | Switching models is not proof of a reset. | slice 3 | observed: blocked-execution-usage.test.mjs: six controlled hours and model/purchase offers produce no input; missing-reset receipts retain owner/proof and execute project-owned manual fallback; evidenced fixture reset permits one same-authority reassessment, with real-host limits explicit |
| Q15 | Buying credits is not proof of a reset. | slice 3 | observed: blocked-execution-usage.test.mjs: six controlled hours and model/purchase offers produce no input; missing-reset receipts retain owner/proof and execute project-owned manual fallback; evidenced fixture reset permits one same-authority reassessment, with real-host limits explicit |
| Q16 | Six hours passing grants no new authority. | slice 3 | observed: blocked-execution-usage.test.mjs: six controlled hours and model/purchase offers produce no input; missing-reset receipts retain owner/proof and execute project-owned manual fallback; evidenced fixture reset permits one same-authority reassessment, with real-host limits explicit |
| Q17 | Switching models grants no new authority. | slice 3 | observed: blocked-execution-usage.test.mjs: six controlled hours and model/purchase offers produce no input; missing-reset receipts retain owner/proof and execute project-owned manual fallback; evidenced fixture reset permits one same-authority reassessment, with real-host limits explicit |
| Q18 | Buying credits grants no new authority. | slice 3 | observed: blocked-execution-usage.test.mjs: six controlled hours and model/purchase offers produce no input; missing-reset receipts retain owner/proof and execute project-owned manual fallback; evidenced fixture reset permits one same-authority reassessment, with real-host limits explicit |
| Q19 | Do not infer native feasibility. | slice 1 | observed: native-probe-assessment.md; native-probe-run/native-acceptance.json, held/resumed native history and matching settings; actual completed same-thread turn, feasibility only |
| Q20 | Do not infer comparative improvement. | slice 4 |  |
| Q21 | Comparative evaluation continues to preserve the applicable CI receipt rules. | slice 4 |  |
| Q22 | Comparative evaluation continues to preserve overdue liveness rules. | slice 4 |  |
| Q23 | The listed scope limits do not become rejection rules for cases a simple solution naturally supports. | slice 4 |  |
| X01 | Reducing the cost of waiting for a running verification command belongs to the sibling long-verification story. | slice 4 |  |
| X02 | Automatic recovery after host/session exit is not a delivery commitment. | slice 4 |  |
| X03 | Automatic recovery after quota resets is not a delivery commitment. | slice 4 |  |
| X04 | Release/rollout is not a delivery commitment. | slice 4 |  |
| X05 | The general effort-accounting tool is not a delivery commitment. | slice 4 |  |
| X06 | Context compaction is not a delivery commitment. | slice 4 |  |
| X07 | A general background job scheduler is not a delivery commitment. | slice 4 |  |
