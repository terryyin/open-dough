// Open Sessions list attention order from typed observations: oldest needing
// the developer first, then other open sessions newest first, with the
// Sessions button's attention badge.
import { expect, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import type { LaunchRecord, SessionState } from "../../src/launchRecord.ts";
import { mountComponent } from "../../test-support/component-mount/mountComponent.ts";
import {
  observe,
  openReading,
  present,
} from "./sessions-sidebar-open-mount.ts";

function titles() {
  return [
    ...document.querySelectorAll<HTMLElement>(
      ".sessions-sidebar-sessions li.sessions-sidebar-session-entry h3",
    ),
  ].map((heading) => heading.textContent);
}

function attentionBadge() {
  return document.querySelector<HTMLElement>(
    ".sessions-toggle-group .sessions-toggle-attention",
  );
}

function entryAt(index: number) {
  return document.querySelectorAll<HTMLElement>(
    ".sessions-sidebar-sessions li.sessions-sidebar-session-entry",
  )[index];
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
  const titleOf = (record: LaunchRecord) => record.request.title;
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
  const mounted = await mountComponent(
    openReading(initial, { withAttentionBadge: true }),
    {
      viewport: { width: 1280, height: 800 },
    },
  );

  await expect
    .poll(() => titles())
    .toEqual([
      titleOf(blocked09),
      titleOf(failed10),
      titleOf(working12),
      titleOf(working11),
      titleOf(working08),
    ]);
  await expect.poll(() => attentionBadge()?.textContent).toBe("2");

  mounted.rerender(
    openReading(
      withStates(
        makeMe.aSessionState.loaded("waiting").please(),
        makeMe.aSessionState.loaded("failed").please(),
        makeMe.aSessionState.loaded("waiting").please(),
      ),
      { withAttentionBadge: true },
    ),
  );

  await expect.poll(() => attentionBadge()?.textContent).toBe("3");
  await expect
    .poll(() => titles())
    .toEqual([
      titleOf(blocked09),
      titleOf(failed10),
      titleOf(working11),
      titleOf(working12),
      titleOf(working08),
    ]);
  const moved = present(entryAt(2), "attention row at index 2");
  expect(moved.querySelector(".visually-hidden")?.textContent).toBe(
    "Needs input",
  );
  expect(moved.className).toMatch(/tone-needs-input/);
  expect(
    moved
      .querySelector("button.sessions-sidebar-session-entry-open")
      ?.getAttribute("title")
      ?.split("\n")[0],
  ).toBe("Needs input");
});
