---
id: SEED-108
status: active
planted: 2026-10-06
planted_during: Authorized retrospective-findings maintenance cycle
trigger_when: Planning-premise responses still miss decisive behavior or proof routes in released use
scope: unknown
---

# SEED-108: Planning observations cover the promised journey

## Why This Matters

A developer running an Open Dough story needs the plan's settled premises to
hold for its real examples. Released premise checks still accept evidence that
stops at a helper, named text, or partial route, leaving owner decisions,
unexpected implementation rounds, and missing proof during execution. This
follow-up reconsiders the failed response using bounded examples from the
findings.

## Stories

<a id="observe-promised-journey"></a>

### Observe decisive planning premises through the full promised journey

**Identity:** SEED-108#observe-promised-journey
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/258-observe-promised-journey/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"810014a457bdd8e6e040ffb5008e893806b6b061bdca69956912499142c1a7e9","plan":"1cf83851eda56c2c7410e94ac3abea3c7da550230e587b99cd15c62097a2ad2b"}}
```

**Goal:** A developer whose executing agent relies on an Open Dough plan gets
settled premises that hold for the plan's real examples. Slice planning calls a
decisive behavior or proof-route premise settled only when its recorded
observation reached the promised operation in the checkout the plan names and
recorded that operation's result; the readiness judgment treats anything less
as a specific missing observation. That removes the mid-execution owner
decisions, extra implementation rounds, and lost proof that ODF-074, ODF-110,
and ODF-190 record on 0.3.51 through 0.3.56, while paid, credentialed, and
owner-held observations stay a human decision.

**Scope:**

Required behavior, revised in the shared guidance that slice planning's plan
writing and the shared readiness criteria own, with slice-plan refinement and
story refinement reusing it by reference:

- A premise's observation is judged by its recorded result. Settled means the
  result is the promised operation's outcome: the example's result, or a proof's
  failure without the behavior it claims to prove. Results such as "exists",
  "found", "callers listed", "step defined", "server answered", or "no commit
  to the spec since" are presence results. They leave the premise open and name
  the operation not yet reached.
- A behavior-consumer premise (who depends on a behavior, what paths carry it,
  what a change removes) is observed from the behavior's effect, not from the
  searched identifier: where the result is produced (the state write site, the
  server response), each transformation to the operation that evaluates it,
  and what asserts or relies on that result (element counts, response shapes,
  fixtures, specs that drive the sequence over an HTTP boundary). When the area
  has a cheap local suite, the smallest complete observation is a scratch edit
  in the preparation's owned workspace that applies the planned removal or
  change, one run of the relevant tests, and a revert before the record write;
  the failing tests are the consumers.
- A proof premise (a named test proves behavior X) is settled by discrimination:
  the test fails with the behavior disabled in a scratch edit and passes with it,
  both reverted. A proof that stays green without the behavior is recorded as
  not proving it, and the slice owns a discriminating proof instead of keeping
  the existing assertion.
- A proof-route premise (the example runs through route R in checkout C) is
  settled by executing the route's unpaid, side-effect-free prefix in the named
  checkout, such as runner spec selection, tool presence, a token route, or a
  log source, up to the first paid, credentialed, or owner-held step. A refused
  or missing step records the route as unavailable there; the plan then names an
  available route (CI, or the primary checkout under that project's own rules)
  or records the specific missing step and its decision owner as an early probe
  slice or a pre-Take decision. Reachability without the example's real shape,
  such as an authenticated write or an attached file, is a presence result.
- A replay that resolves a readiness concern runs the slice's whole promised
  journey for that example; the replay's own "not covered" list blocks `ready`.
- `ready` requires each decisive premise either settled under these results or
  bounded by an early probe slice whose remaining step is paid, credentialed,
  owner-held, or state-changing. A presence result, or an observation made
  outside the checkout the plan names, is a blocking reason that names the
  premise and the unreached operation.

Preserved constraints:

- Human decisions stay human: planning makes no paid, credentialed, owner-held,
  or state-changing observation; those remain probe slices or explicit
  decisions, as today.
- Scratch observations run only in the preparation's owned workspace, never in a
  default or shared checkout, and are reverted before anything is recorded or
  committed, under the owned-workspace rules in [preparation workspace](../../src/skills/dough-story-refinement/references/preparation-workspace.md).
- The smallest relevant observation still applies; claims the approach does not
  depend on are not inspected.

Deferred, with no machinery added for them:

- Which tests an implementer runs inside a slice (broader suite selection,
  ODF-150), CI-observer transport, and concurrency scheduling keep their
  current guidance.
- Product implementation fixes in Open Dough or in the projects whose findings
  motivate this story.
- A mechanical recorder check of observation results: `record-state` keeps
  storing the agent's judgment and its `--reason` text without new fields or
  status grammar.
- Reassessing plans already recorded `ready` before this guidance lands.

**Key examples:**

1. **Assertion green without the action** (Pygardon plan 313). A plan premise
   says an existing shutdown test "asserts every collected wait is cancelled"
   and slice 1 keeps that assertion for key example 2. Planning disables the
   shutdown cancel in a scratch edit of the owned workspace, runs that one test,
   and reverts. The test stays green, because loop teardown cancels leftovers
   after the assertion runs. The premise is recorded false with that result,
   slice 1 owns a proof that observes cancellation inside the lifespan, and the
   "keep the existing assertion" instruction is gone before implementation.
2. **Removed path consumed through server and fixture behavior** (Open Dough
   plan 248; plans 206, 239, 243, and 254 are the same class). A plan removes
   the attention-message path and premises "its consumers are the client
   components" from a grep of client names. The observation follows the message
   from where the response is produced (the server result response and its
   admission exception) to what relies on it (a spec fixture whose final report
   is an attention message, specs that count native controls or relaunch the
   story over HTTP). The slice lists the server branch, the exception, and the
   fixture before implementation. The grep listing alone is recorded as
   presence and leaves the premise open. When the dashboard suite is cheap
   enough, scratch-removing the branch, running the dashboard specs, and
   reverting settles the same premise: the failing specs are the consumers.
3. **Authenticated live-service example with an unavailable local route**
   (Doughnut plans 004 and 008). The story's key example has an agent run the
   CLI against the held app with a token and attach a PDF; the plan proposes a
   local `cy:run` of the live-audio spec in the linked worktree as branch proof.
   Planning runs the route's unpaid prefix in that checkout: the spec selection
   script and the token route. The selection script refuses live-service specs
   in linked worktrees and no token route exists. The plan records the local
   route unavailable, names CI as the branch route for the live spec and the
   token route in the slice's guidance, and where neither exists records a
   pre-Take owner decision naming the missing step. "The server answered" does
   not settle the example's authenticated step.
4. **Inexpensive complete observation; planning proceeds.** A plan moves a
   function that a script reaches, and premises that an existing feature's
   steps run that script. Planning runs the feature's local, unpaid fixture
   once in the owned workspace with a scratch failure in the moved function,
   then reverts. The feature fails at the step that runs the script. The plan
   records the premise, the literal run, and that failure as the observation,
   and the readiness record is `ready` with no reason. Reading that the steps
   name the script would have been presence.
5. **Readiness boundary.** A plan's premise table records "grep found the 17
   files naming the helper; none holds the read" as settled, and "live route:
   CI shard" with no observation. The readiness assessment records `not-ready`
   with one reason per premise naming the unreached operation (the wrapper's
   callers running the helper while holding the read; the CI shard running the
   live spec on branch code) until a fresh observation with that operation's
   result replaces it. A premise whose cheap parts are observed and whose paid
   remainder is an early probe slice that stops dependent slices does not
   block `ready`.

**Supporting findings:** [ODF-074](../../docs/maintainer/finding-names.md#odf-074),
[ODF-110](../../docs/maintainer/finding-names.md#odf-110), and
[ODF-190](../../docs/maintainer/finding-names.md#odf-190). Their identities stay
separate. The catalog owns occurrence evidence and the failed responses in
0.3.43 and 0.3.48; 0.3.56 reports motivate reconsidering that response.

**Done when:** Examples 1, 2, 3, and 5 walked through the revised guidance
each change the plan on decisive evidence or retain a specific missing
observation and its decision owner, example 4 proceeds, and the repository's
behavior review ([AGENTS.md](../../AGENTS.md)) confirms the executing-agent
wording; any native host evaluation not run is named as unverified rather than
claimed. Each addressed finding in `docs/maintainer/finding-names.md` and its
retained source `DearDough.md` records the actual response commit and first
containing release, or honestly states release pending. Delivery is not itself
proof that the mechanism has stopped recurring; relevant later use starts the
watch.

**Dependency:** No recorded blocking story prerequisite. The already-delivered,
unreleased consumer-proof work addresses implementation proof selection and does
not establish or block this planning outcome.
