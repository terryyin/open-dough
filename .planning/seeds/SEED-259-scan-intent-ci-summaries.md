---
id: SEED-259
status: active
planted: 2026-11-07
scope: story
---

# Scan CI summaries in dashboard Intent

<a id="correct-scan-intent-ci-summaries"></a>

### Correct Intent CI label announcements and summary sort fallback

**Identity:** SEED-259#correct-scan-intent-ci-summaries
```json dough-story-state
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/504-correct-scan-intent-ci-summaries/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"63f467c6dcc92fcdf3162e5ef46c0ed05e6aae9ac2efda6f1299e00d04f486fb","plan":"6b4895bca1c0fecc81d0dcabc9867b579fdce513babae27971688a8d28f3e62a"}}
```

**Goal.** A developer reviewing Intent CI evidence, including with a screen
reader, hears what each evidence label means and its full words from the
label itself, keeps a chosen Summary sort through a story comparison's
reading state, and reads the same no-breakdown and **Not in the rows above**
explanations in comparison Summaries as in single-run ones: the retrospective
correction of
Scan CI summaries in dashboard Intent as delivered
(`5b4cd8959bc7:.planning/seeds/SEED-259-scan-intent-ci-summaries.md#scan-intent-ci-summaries`).

**Scope.** Evidence labels carry their meaning and full words in their
content; a sort column a table lacks falls back at render time without
clearing the chosen sort; one builder for a part without a file breakdown;
comparison Summaries label what the outside row holds and an entry without a
file breakdown; the revision stream boundary spec returns within the
250-line limit. Adds nothing to that story; its required behavior,
restrictions and scope limits hold.

**Plan:** [Correct Intent CI label announcements and summary sort fallback](../slice-plans/504-correct-scan-intent-ci-summaries/PLAN.md)
