---
id: SEED-273
status: active
planted: 2026-11-08
scope: story
---

# Start a follow-up from recently done work

## Correction

<a id="lean-follow-up-listing"></a>

### Keep follow-up context out of listings and resume it after its source expires

**Identity:** SEED-273#lean-follow-up-listing
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/529-lean-follow-up-listing/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"e61fcd1ed991c639c23359cbeadc7bd36ab688ab9361533ab76006d3f748f94e","plan":"6b2e9f9b78f15604d37ff47ff63079d7abb861168e943f23188eadf8ca1d8efe"}}
```

**Goal.** A developer using Follow up keeps a lean dashboard: the sessions
overview the page polls stops carrying each follow-up's resolved context, which
repeats the source sessions' requests and final reports and can reach about
20 KB per held session, and repeating a follow-up whose start is still retained
resumes that start even after its source record has expired. This corrects the
delivered Start a follow-up from recently done work
(SEED-273#follow-up-from-done, recoverable at `c6e935c28:.planning/seeds/SEED-273-follow-up-from-done.md`)
story; it adds no new promise.

**Scope.** The done listing and open-entry listing of a follow-up session's
recorded context, admission's resume of a retained follow-up start whose source
record is gone, and the residue the review named (duplicate per-host Default
main input cases and a re-export kept only for an old import), with focused
proof. Plan:
[529-lean-follow-up-listing](../slice-plans/529-lean-follow-up-listing/PLAN.md).
