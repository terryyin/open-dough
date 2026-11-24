---
id: SEED-431
status: active
planted: 2026-11-24
planted_during: Wrap-up of the released Codex supplier-watch evaluation
trigger_when: selected from the product backlog
scope: one story
---

# SEED-431 — Reduce Codex wakes during supplier watches

<a id="reduce-codex-wakes-during-supplier-watches"></a>

### Reduce Codex wakes during supplier watches

**Identity:** SEED-431#reduce-codex-wakes-during-supplier-watches
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/809-reduce-codex-wakes-during-supplier-watches/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"1ebcf07714404308d01d1c06ceaae377b1cc5488826160cd33b5a97a6f0580a7","plan":"fafb7522a553b19b7792451edb5325e40b13c811e8717bc5603ad9f8c4efd6f0"}}
```

#### Goal

A maintainer can leave a Codex coordinator watching a named blocking
supplier and spend fewer model requests while supplier facts stay unchanged.
Each uninterrupted unchanged interval allows at most one watch-attributable
request per started five minutes, with at least 90% cached input across those
requests when there are any. The coordinator still acts on the supplier's
publication or the original deadline.

#### Scope

- Cover early returns from Codex cell waits and empty shell polls for the
  running supplier watch. Keep the watch active through an unchanged interval.
- Preserve the shared command's silence while waiting and its publication and
  deadline receipts. Judge a publication against the named dependency agreement.
  If the hold stays, resume with the same remote, refs and absolute deadline.
  Observe any qualifying push that arrived while the previous result was judged.
  At the deadline preserve partial work and record the resume condition.
- Preserve Claude Code's existing wait behavior. This increment covers the
  Codex supplier-watch journey. Other proof and CI waits, a new publication
  transport, and rollout across released installations are outside its scope.

#### Key examples

- A coordinator watches a named supplier for just over eight unchanged minutes.
  Codex returns a running cell or an empty shell poll. The same watch remains
  active, and its trace shows at most two attributable model requests. When
  requests occur, cached input is at least 90% of their input tokens.
- A supplier publishes an intermediate change, then publishes the agreed
  outcome while the coordinator is judging that change. The coordinator
  resumes the still-blocked watch with its original deadline, sees the new
  publication, and continues the blocked work once.
- Nothing qualifying has appeared when the deadline arrives. The coordinator
  handles the deadline receipt, keeps the hold and partial work, and records
  the condition that will let the work resume.

#### Starting evidence

The released evaluation observed three Codex 0.171.0
executions in the SEED-413 workstream with Open Dough 0.3.109. At least 94
wait-only requests exceeded an allowance of 19 across five intervals. All five
publication results were handled, and both reruns kept the original deadline.
Natural deadline handling and realized savings remain unmeasured.
[Evaluation and raw trace locators](https://github.com/terryyin/open-dough/blob/034822b01088941dd0b306874bc608e12c11be38/.planning/slice-plans/692-verify-silent-supplier-wait-in-codex/PLAN.md#measured-watches-and-recommendation)
