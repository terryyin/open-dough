// Open Sessions list attention order from typed observations: oldest needing
// the developer first, then other open sessions newest first, with the
// Sessions button's attention badge.
import { expect, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import type { LaunchRecord, SessionState } from "../../src/launchRecord.ts";
import { mountOpenSessions, observe } from "./sessions-sidebar-open-mount.ts";
import {
  entries,
  hiddenStateLabelOf,
  openControlOf,
  present,
  titleOf,
} from "./sessions-sidebar-page.ts";

function titles() {
  return entries().map((entry) => titleOf(entry).textContent);
}

function attentionBadge() {
  return document.querySelector<HTMLElement>(
    ".sessions-toggle-group .sessions-toggle-attention",
  );
}

test("leads with the sessions that need the developer, earliest launch first, then the others newest first", async () => {
  const now = Date.now();
  const story = (letter: string, minutesAgo: number) => {
    const title = `Story ${letter}`;
    return makeMe.aLaunchRecord
      .executing({
        identity: `SEED-900#story-${letter}`,
        title,
        source: "doughnut",
      })
      .inClaudeSession({ sessionId: `order-${letter}` })
      .launchedAt(new Date(now - minutesAgo * 60_000).toISOString())
      .please();
  };
  const working08 = story("A", 50);
  const blocked09 = story("B", 40);
  const failed10 = story("C", 30);
  const working11 = story("D", 20);
  const working12 = story("E", 10);
  const launchTitle = (record: LaunchRecord) => record.request.title;
  const withStates = (
    blocked: SessionState,
    failed: SessionState,
    later: SessionState,
  ) =>
    observe([
      {
        record: working08,
        state: makeMe.aSessionState.loaded("working").please(),
      },
      { record: blocked09, state: blocked },
      { record: failed10, state: failed },
      { record: working11, state: later },
      {
        record: working12,
        state: makeMe.aSessionState.loaded("working").please(),
      },
    ]);

  const initial = withStates(
    makeMe.aSessionState.loaded("waiting").please(),
    makeMe.aSessionState.loaded("failed").please(),
    makeMe.aSessionState.loaded("working").please(),
  );
  const mounted = await mountOpenSessions(initial);

  await expect
    .poll(() => titles())
    .toEqual([
      launchTitle(blocked09),
      launchTitle(failed10),
      launchTitle(working12),
      launchTitle(working11),
      launchTitle(working08),
    ]);
  await expect.poll(() => attentionBadge()?.textContent).toBe("2");

  mounted.supplySessions(
    withStates(
      makeMe.aSessionState.loaded("waiting").please(),
      makeMe.aSessionState.loaded("failed").please(),
      makeMe.aSessionState.loaded("waiting").please(),
    ),
  );

  await expect.poll(() => attentionBadge()?.textContent).toBe("3");
  await expect
    .poll(() => titles())
    .toEqual([
      launchTitle(blocked09),
      launchTitle(failed10),
      launchTitle(working11),
      launchTitle(working12),
      launchTitle(working08),
    ]);
  const moved = present(entries()[2], "attention row at index 2");
  expect(hiddenStateLabelOf(moved).textContent).toBe("Needs input");
  expect(moved.className).toMatch(/tone-needs-input/);
  expect(openControlOf(moved).getAttribute("title")?.split("\n")[0]).toBe(
    "Needs input",
  );
});
