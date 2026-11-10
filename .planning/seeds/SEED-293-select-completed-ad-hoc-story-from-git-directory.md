---
id: SEED-293
status: active
planted: 2026-11-10
scope: story
---

# SEED-293: Select a completed ad hoc story from its Git directory capture

<a id="select-completed-ad-hoc-story-from-git-directory"></a>

### Select a completed ad hoc story from its Git directory capture

**Identity:** SEED-293#select-completed-ad-hoc-story-from-git-directory
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planless","assessment":"ready","reasons":[],"basis":{"document":"6f49ba28ee72f3e980a5a5e30ed067650125f33e8d4be12309eafec66361817f"}}
```

**Goal:** Resolve the reported failure to select the completed story from an
existing ad hoc session when its saved landing names the repository's common
Git directory.

**Scope:** One bounded bug repair under Dough Bug Fixing, with no replanning
and a ten-minute implementation attempt. Preserve the validated completion,
project binding, ambiguity and unavailable-evidence rules. Reuse the existing
repository identity owner. No client skill release or session record rewrite.

**Expectations:** Selecting Pygardon's retained test-optimization session with
landing repository `/Users/terryyin/git/pygardon/.git` must select its evidenced
Done story `SEED-20261092#faster-sharadar-test-feedback`. Checkout-root captures
must keep working. A different repository must stay unassociated. Reproduce
through the existing dashboard journey before repair, then run that regression
and related association tests with real Git fixtures and shared MakeMe data.

**Evidence:** On 2026-11-10 the production completed-story endpoint at
`http://127.0.0.1:4173` returned `{"kind":"absent"}` for Codex session
`01a1c2f7-af5a-7001-9e50-215e985fc9c5`, launch reference
`cf7384a1-f783-4d7c-ba40-ee779c4ecb49`. The deployed source compared the saved
`.git` path directly with the configured checkout root; the story's fixture
instead supplied the checkout root. Remaining uncertainty is whether another
evidence check fails once repository identity is compared correctly.

Follow the [failing and flaky test policy](../../AGENTS.md#failing-and-flaky-tests)
as written throughout implementation, delegation and repair. For long local
checks on awake macOS use `caffeinate -s -i` on AC, or `caffeinate -i` on
battery and inspect sleep logs, under [local resources](../../tests/local-test-resources.md#machine-sleep-on-macos).
