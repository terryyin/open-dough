// Hovering Yui's portrait, the first of the agent rotation, plays one short
// gesture in its enlarged view and then rests on the approved still; every
// other agent's enlarged portrait stays still, and so does Yui's when the
// browser asks for reduced motion. The roster shows every agent's portrait
// through the same component and rule as the cards (agentRosterRecords.ts).

import type { Locator } from "@playwright/test";
import { expect, test } from "./dashboardTest.ts";
import { expectMembership, rosterParts } from "./dashboardPage.ts";
import { enlargedView, expectServed } from "./agentPortrait.ts";
import {
  publishRosterOrigins,
  queuedStory,
  takenStory,
} from "./agentRosterRecords.ts";

// The CSS animations running on a portrait's enlarged view (its ::after):
// their timing and how far each has played.
function gestures(portrait: Locator) {
  return portrait.evaluate((element) =>
    element
      .getAnimations({ subtree: true })
      .filter(
        (animation): animation is CSSAnimation =>
          animation instanceof CSSAnimation &&
          (animation.effect as KeyframeEffect | null)?.pseudoElement ===
            "::after",
      )
      .map((animation) => {
        const timing = animation.effect?.getComputedTiming();
        return {
          playState: animation.playState,
          duration: Number(timing?.duration),
          iterations: timing?.iterations,
          currentTime: Number(animation.currentTime),
        };
      }),
  );
}

const fileNames = async (portrait: Locator) =>
  (await enlargedView(portrait)).layers.map((url) =>
    new URL(url).pathname.split("/").pop(),
  );

// The still enlargement: the high-resolution atlas over the small one.
const stillLayers = (atlas: number) => [
  `atlas-${atlas}-large.webp`,
  `atlas-${atlas}.webp`,
];

test("the first agent's enlarged portrait plays one portrait gesture on each hover and rests on the still, while other agents and reduced motion stay still", async ({
  page,
}) => {
  await publishRosterOrigins(page);
  await page.goto("/");
  await expectMembership(page, { taken: [takenStory], backlog: [queuedStory] });
  const { roster, member, opener } = rosterParts(page);
  await opener("Akiho-chan").click();
  await expect(roster).toBeVisible();
  const yui = member("Yui-chan").locator(".agent-portrait");
  const akiho = member("Akiho-chan").locator(".agent-portrait");
  const moveAway = () => page.mouse.move(0, 0);

  await test.step("hovering Yui plays one gesture of one to two seconds from a served strip, then shows the still", async () => {
    await yui.hover();
    const [played] = await gestures(yui);
    expect(played).toMatchObject({ playState: "running", iterations: 1 });
    expect(played?.duration).toBeGreaterThanOrEqual(1000);
    expect(played?.duration).toBeLessThanOrEqual(2000);
    const [strip] = (await enlargedView(yui)).layers;
    expect(strip).toMatch(/\/agent-avatars\/yui-gesture\.webp$/);
    await expectServed(yui, strip ?? "", "image/webp");
    await expect.poll(() => gestures(yui), { timeout: 4000 }).toEqual([]);
    expect(await fileNames(yui)).toEqual(stillLayers(1));
    expect((await enlargedView(yui)).shown).toBe(true);
  });

  await test.step("moving away and hovering again plays the gesture again from its start", async () => {
    await moveAway();
    await yui.hover();
    const [again] = await gestures(yui);
    expect(again?.playState).toBe("running");
    expect(again?.currentTime).toBeLessThan(500);
    await moveAway();
  });

  await test.step("hovering Akiho shows the still enlargement with no gesture", async () => {
    await akiho.hover();
    await expect.poll(async () => (await enlargedView(akiho)).shown).toBe(true);
    expect(await gestures(akiho)).toEqual([]);
    expect(await fileNames(akiho)).toEqual(stillLayers(1));
    await moveAway();
  });

  await test.step("with reduced motion, hovering Yui shows the still enlargement with no gesture", async () => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await yui.hover();
    await expect.poll(async () => (await enlargedView(yui)).shown).toBe(true);
    expect(await gestures(yui)).toEqual([]);
    expect(await fileNames(yui)).toEqual(stillLayers(1));
  });
});
