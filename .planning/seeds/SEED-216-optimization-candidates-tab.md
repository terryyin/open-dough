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
{"schemaVersion":1,"refinement":"refined","approach":"planned","plan":"../slice-plans/444-optimization-candidates-tab/PLAN.md","assessment":"ready","reasons":[],"basis":{"document":"5a4789b3c6e64547dc14f69a16b17cef1e605162b0dbe74d99946659c19d3976","plan":"2f8a858f81f9b6d637f23a63315ce67eb96f8a5dfa3105a0985a495d896afa8b"}}
```

**For / why:** Developers reviewing project intent can choose between intent
review and optimization candidates without treating the candidates report as
navigation in the test-source file browser.

**Goal:** On the selected project's Intent page, a tab strip in the space below
the dashboard's main header (banner) and above the Intent page content lets the
developer choose **Intent** (default) or **Optimization Candidates**. Intent
keeps the file browser with Purpose and Proof. Optimization Candidates shows the
existing Test Optimization Candidates report across the content area without the
file browser.

**Scope:**

- **Intent-local tabs.** Place a two-tab control under the banner / above Intent
  content: **Intent** and **Optimization Candidates**. The strip belongs to the
  Intent perspective only; Development and the banner perspective switch stay as
  they are. Intent is the default when the developer enters Intent.
- **Remove the file-browser candidates control.** Today's
  **Test Optimization Candidates** button at the top of the Intent locations
  column is gone. The locations column holds only Purpose locations.
- **Optimization Candidates tab.** Shows the existing candidates report (same
  record, sections, states, and location links) using the full Intent content
  area. The file browser is absent on this tab.
- **Intent tab.** Keeps today's file browser with location groups, Purpose, and
  Proof. Opening Intent with nothing else selected shows that browse/read
  layout, not the candidates report.
- **Cross-tab open from the report.** Choosing a location link in the
  candidates report switches to the Intent tab, opens that file's Purpose (and
  Proof) as today, and keeps return-to-entry when the developer chooses
  Optimization Candidates again.

**Scope limits (deferred promises, not rejections):**

- Putting the candidates tab choice on the URL or making it a deep link.
- Changing the candidates record format, read API, or report sections.
- Elevating Optimization Candidates to a banner-level perspective beside
  Development and Intent.
- Redesigning Purpose/Proof layout (side-by-side vs tabs) or the banner itself.

**Key examples:**

- Enter the selected project's Intent page: the tab strip shows **Intent**
  selected; the file browser and reading layout are available; the former
  locations-column **Test Optimization Candidates** control is absent.
- Choose **Optimization Candidates**: the existing candidates content fills the
  Intent content area; the file browser is absent.
- Return to **Intent**: file browser, Purpose, and Proof are available again as
  before the candidates tab.
- From Optimization Candidates, open a location named in an entry: the Intent
  tab becomes selected, that file's Purpose (and Proof) show, and choosing
  Optimization Candidates again restores the report focused on that entry.

**UI:** Describe the strip as two peer Intent modes under the banner, not as a
third project perspective. Prefer the dashboard's existing segmented
radiogroup treatment (as on Perspective / Project) for the control's look and
keyboard behavior; exact pixels are not a delivery promise. Do not place the
candidates control back inside the locations column.

**Architecture:** No Accepted decision conflicts.
[ADR 0008](../../docs/adrs/0008-project-dashboard-domain-and-architecture-accepted.md)
keeps Development and Product intent as perspectives; Optimization Candidates
remains an Intent-local reading mode, not a new perspective or durable workflow
record. Tab and return-entry state stay disposable page state like today's
candidates/purpose view. The existing candidates read path
(`IntentCandidatesRecord` and the pinned
`.planning/TEST-OPTIMIZATION-CANDIDATES.md` read) is reused; this story adds no
server contract. The consequential layout change is that Intent content has two
chrome modes—locations+reading versus full-width report—owned inside Intent,
coordinating selection when a report location opens.

**Request evidence:** Terry's 2026-11-02 request and attached dashboard
screenshot show unused space between the main header and page content, with
**Test Optimization Candidates** currently selected in the locations column.

**Priority:** Terry requested this as the first queued product-backlog item.

**Refinement notes (2026-11-02):**

- **Observed:** The candidates control is a dedicated button above location
  groups in `IntentBrowser`, not a tree row; default reading view today is
  candidates (`useState("candidates")`). No Intent tab strip exists yet; closest
  pattern is the banner radiogroup. Candidates view is local state, not URL.
- **Explore:** Compared (1) Intent-local tabs under the banner (requested),
  (2) restyle the left-column button in place, (3) a third banner perspective.
  Recommend (1): it matches the request and keeps Product intent as one
  perspective. (2) fails the separation. (3) conflicts with ADR 0008's
  perspective set without evidence for a new peer.
- **Borrow:** Like an IDE Problems panel versus the Explorer tree: a report
  about the project that is not itself a source file, reached as a peer view
  with different chrome. Limit: Problems usually stay a bottom pane; here the
  report takes the whole Intent content area by request.
- **Challenge:** Strongest doubt was that changing the default away from
  candidates could surprise current habit while still meeting the wording. The
  request and examples make Intent the default explicitly; keep that. Cross-tab
  open from the report is required so the existing location-open journey still
  works once the left control is gone.
- **Clarify:** Smallest scope is the tab strip, removal of the locations-column
  control, full-width report without the browser, Intent as default, and
  preserved open-from-report behavior. URL persistence and record/API changes
  stay deferred.
