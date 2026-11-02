---
id: SEED-216
status: active
planted: 2026-11-02
planted_during: Terry Yin's request to separate optimization candidates from intent review
trigger_when: Developers switch between reviewing project intent and test optimization candidates
scope: story
---

# Review optimization candidates in a separate Intent tab

<a id="optimization-candidates-tab"></a>

### Review optimization candidates in a separate Intent tab

**Identity:** SEED-216#optimization-candidates-tab
```json dough-story-state
{"schemaVersion":1,"refinement":"not-refined","approach":"unselected"}
```

**For / why:** Developers reviewing project intent can choose between intent
review and optimization candidates without treating the candidates report as
an item in the test-source file browser.

**Goal:** Use the space below the dashboard's main header and above the Intent
page content for tabs, with intent review as the default main tab and
**Optimization Candidates** as the other tab.

**Scope:** Move the existing **Test Optimization Candidates** entry out of the
file browser and into the **Optimization Candidates** tab. Keep the file browser
with intent review. The candidates tab shows the existing candidates report
without the file browser, using the available content area.

**Key examples:**

- Enter the selected project's Intent page: intent review is the default main
  tab, and its file browser is available.
- Choose **Optimization Candidates** in the tab strip below the main header:
  the existing candidates content is shown, and the file browser is absent.
- Return to the intent-review tab: intent review and its file browser are
  available again. **Test Optimization Candidates** is no longer a file-browser
  entry.

**Request evidence:** Terry's 2026-11-02 request and attached dashboard
screenshot show unused space between the main header and page content, with
**Test Optimization Candidates** currently selected in the file browser.

**Priority:** Terry requested this as the first queued product-backlog item.
