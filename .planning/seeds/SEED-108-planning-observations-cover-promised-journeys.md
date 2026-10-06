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
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**Beneficiary:** a developer whose executing agent relies on an Open Dough plan.

**Outcome:** A plan cannot call a decisive behavior or proof-route premise
settled using an observation that never reaches the promised operation and
result. Available cheap evidence exposes a false premise before dependent work;
an unavailable owner-held route remains an explicit decision before that work.

**Bounded scope:** Revise the planning observation and readiness judgment for
this one failure family. Include behavior consumers expressed without the
searched identifier, assertions that pass without the required action, and
proof routes that cannot execute the example in the named checkout. Preserve
human decisions and use the smallest relevant observation. Broader suite
selection, CI-observer transport, general concurrency scheduling and product
implementation fixes are outside this story.

**Evaluation:** Walk representative existing findings through the revised
behavior: a cancellation assertion that remains green when the action is
removed, a removed UI path consumed through server/fixture behavior, and an
authenticated live-service example whose proposed local route is unavailable.
Each either changes the plan on decisive evidence or retains a specific missing
observation and its decision owner; merely finding a helper or obtaining a
server response cannot mark that example settled. Include one inexpensive
complete observation that allows planning to proceed. Evaluate executing-agent
guidance with the repository's behavior review and applicable host evidence;
name any unverified native evaluation instead of claiming effectiveness.

**Supporting findings:** [ODF-074](../../docs/maintainer/finding-names.md#odf-074),
[ODF-110](../../docs/maintainer/finding-names.md#odf-110), and
[ODF-190](../../docs/maintainer/finding-names.md#odf-190). Their identities stay
separate. The catalog owns occurrence evidence and the failed responses in
0.3.43 and 0.3.48; 0.3.56 reports motivate reconsidering that response.

**Done when:** The bounded evaluation demonstrates the intended judgment,
the shared guidance uses it, and each addressed finding in
`docs/maintainer/finding-names.md` and its retained source `DearDough.md` records
the actual response commit and first containing release (or honestly states
release pending). Delivery is not itself proof that the mechanism has stopped
recurring; relevant later use starts the watch.

**Dependency:** No recorded blocking story prerequisite. The already-delivered,
unreleased consumer-proof work addresses implementation proof selection and does
not establish or block this planning outcome.
