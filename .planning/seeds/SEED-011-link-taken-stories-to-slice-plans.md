---
id: SEED-011
status: active
planted: 2026-09-12
planted_during: Product backlog capture
trigger_when: Improve navigation from taken work to execution plans
scope: small
---

# SEED-011: Link taken stories to their slice plans

## Stories

<a id="link-taken-story-to-slice-plan"></a>

### 1. Open a taken story's slice plan from the product backlog

**Status:** Selected for backlog; unrefined.

**For / why:** A developer reviewing taken work can open its slice plan directly
from the product backlog without searching for the execution document.

**Scope:** When a planned story moves into **Taken**, include a link to its
slice plan alongside its canonical story link and identity. Preserve the
canonical story home and keep execution details in the plan.

**Evaluation:** Given a queued story with an existing slice plan, when execution
starts and the story moves into **Taken**, its backlog entry links to both the
correct canonical story and the correct slice plan. A developer can follow the
plan link directly from the backlog.

**Boundaries:** This capture does not change skills or start implementation.
Planless quick execution and bounded corrections that already link directly to
a plan need no invented slice plan; clarify their treatment during refinement.

**Depends on:** None for refinement; an existing slice plan for the planned
execution example.

## Origin

User request on 2026-09-12: capture this story at the top of the product backlog;
a taken product backlog story needs a link to its slice plan.
