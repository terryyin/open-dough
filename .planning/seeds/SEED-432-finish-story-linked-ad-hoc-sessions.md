---
id: SEED-432
status: active
planted: 2026-11-24
planted_during: Execution split of SEED-426
trigger_when: selected from the product backlog
scope: one story
---

# SEED-432 — Finish story-linked ad hoc sessions in the Dashboard

<a id="finish-story-linked-ad-hoc-sessions"></a>

### Finish story-linked ad hoc sessions in the Dashboard

**Identity:** SEED-432#finish-story-linked-ad-hoc-sessions
```json dough-story-dependencies
{"schemaVersion":1,"identity":"SEED-432#finish-story-linked-ad-hoc-sessions","dependencies":[{"supplier":{"identity":"SEED-426#start-ad-hoc-work-under-a-story","href":"seeds/SEED-426-start-ad-hoc-work-under-a-story.md#start-ad-hoc-work-under-a-story"},"implementation":"Use the installed owned draft and stopped-claim recovery through the Dashboard launch boundary.","rationale":"The mapped Dashboard launch routes call the installed operation and need its authoritative behavior available on the shared integration base.","condition":"The installed owned-draft admission and retained-candidate retry are integrated on trunk with their bare-remote proof.","state":"satisfied","resolution":{"revision":"f5396f92c15036b7f1e4af81a824692414792ebd","path":".planning/seeds/SEED-426-start-ad-hoc-work-under-a-story.md#start-ad-hoc-work-under-a-story","summary":"Installed draft admission and retained-candidate retry are integrated. The first-seed and lost-response cases prove one canonical story and Taken assignment on a bare remote. The retry cases prove the losing candidate is retained, a clean same-worktree retry succeeds, and unrelated edits remain safe. Ordinary completion is covered. Fourteen focused installed cases and branch CI run 45373952427 passed.\nCondition satisfied: The installed owned-draft admission and retained-candidate retry are integrated on trunk with their bare-remote proof.\nAccepted integration: 96feeac0c68d517fc1e4432c5b750550bce92cb2 on origin/refs/heads/main."}},{"supplier":{"identity":"SEED-433#run-dashboard-launch-tests-on-an-installed-project","href":"seeds/SEED-433-run-dashboard-launch-tests-on-an-installed-project.md#run-dashboard-launch-tests-on-an-installed-project"},"implementation":"Run the Dashboard backend and E2E launch consumers on an installed project with a matching bare origin, with their expectations updated for the installed route.","rationale":"Admitting every default-choice ad hoc start requires an installed project and origin. Without the supplier, about 364 consumer specs are reached and 11 backend specs fail on harness setup, which overran SEED-432's slice 3 four times. The developer extracted that harness migration as a separate test-only story.","condition":"Dashboard launch consumers run on an installed project with a matching bare origin on trunk, with passing expectations for the installed route.","state":"satisfied","resolution":{"revision":"9cd90fe67384e09bcdcb4f75cdb4c48a6857855b","path":".planning/seeds/SEED-433-run-dashboard-launch-tests-on-an-installed-project.md#run-dashboard-launch-tests-on-an-installed-project","summary":"Plan 816 installed both host layouts and a matching bare origin for each fixture-created catalog project. The full story-branch E2E gate passed 779 cases and the backend gate passed 1,984 with its existing opt-in replay skip. On the accepted integrated revision, the shared-machine installed-backend launch and the Claude and Codex Start journeys passed. The shared-machine case checks both installed layouts, bare-origin parity and the persisted launch record. The installed Start cases exercise the native command and publication path against that origin.\nCondition satisfied: Dashboard launch consumers run on an installed project with a matching bare origin on trunk, with passing expectations for the installed route.\nAccepted integration: 672fc3210ea793abfa349ec73adb38c9e09c6add on origin/refs/heads/main."}}]}
```
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/813-finish-story-linked-ad-hoc-sessions/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"899d36e21db629dcb54b2b27d91909519db19613726d24adf258a9dd504beae2","plan":"2a5df5d48f13ea48efaf7131ca6117c14e19b0110e6a4f51a162193321321dfb"}}
```

**Goal.** A developer who starts ad hoc work from an isolated Dashboard
checkout gets an ordinary story, published as Taken on the project remote
before the native session opens. The session then appears on that story's
Board card.

**Developer decision.** Admit new independent ad hoc work as an ordinary
story directly into **Taken**, using the same product backlog admission as
accepted contextual work. The project repository owns membership and published
comparisons. The Dashboard keeps the local launch and recovery evidence. [ADR 0008](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md#durable-project-state-and-local-operational-state)
defines those responsibilities. On 2026-11-25 the developer split this story
at its delivered isolated-start boundary.
[SEED-439](SEED-439-complete-story-linked-ad-hoc-sessions.md#complete-story-linked-ad-hoc-sessions)
carries the remaining scope.

**Scope.**

- An isolated, non-follow-up Start publishes one canonical story and its Taken
  assignment before it opens a native session. It keeps review and auto-land
  choices, the native first input and attachment bytes.
- A refused admission, a competing claim or an origin mismatch opens no native
  session. Continue after a receipt refusal or lost reply reuses the same
  attempt and opens one native session under the accepted identity.
- Verify the production cutover inputs read-only, so later cutover work starts
  from recorded dispositions.

**UI.** **Start session** shows admission in progress for an isolated
workspace. A refusal explains the reason and offers Continue for that attempt.
Use the existing instruction label as the initial story title. With no usable
label, use “Ad hoc work” with the launch date and time, fixed on the first
attempt. The new Session entry appears on the ordinary Story card.

**Key examples.**

- A developer submits an instruction in an isolated workspace. The remote
  receives one story and Taken assignment, and the native session opens once,
  in the worktree at the admitted revision. On the Board, the story carries
  the new Session entry.
- When the admission push is held, no native session starts until Continue,
  and then exactly one does.

**Preparation.** [Plan 813](../slice-plans/813-finish-story-linked-ad-hoc-sessions/PLAN.md)
holds the delivered slices 1–3. Its remaining slices and evidence moved to
SEED-439's plan 833. The developer withdrew
SEED-420's separate identity, association and review model. Its
[preparation](https://github.com/terryyin/open-dough/commit/985168b9c1bf32c84c45814a83393bc9d17a1c2b)
and [integrated implementation](https://github.com/terryyin/open-dough/commit/eef6f7234dffe03e7a3fa33e41805533b0dfdacc)
remain recoverable in Git.
