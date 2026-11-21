import { expect, test } from "vitest";
import { page } from "vitest/browser";
import { agentNames } from "../../../Distribution/src/skills/dough-product-backlog/scripts/product-backlog-agent-profile.mjs";
import {
  controlContrast,
  decorativeIcon,
  expectDocumentStill,
  narrowViewport,
  readsWhole,
  textContrast,
  visibleParts,
  zoomedViewport,
} from "./board-accessibility.ts";
import { mountBoardFrame } from "./board-frame-mount.ts";
import { boardWork, story } from "./board-work.ts";

const wideViewport = { width: 1440, height: 900 };

test("the agent roster's heading and Back read clearly and fit a narrow and a zoomed window", async () => {
  const assigned = story("Keep the published roster readable", 413);
  const work = boardWork([assigned], {
    id: "doughnut",
    label: "Doughnut",
    roster: {
      status: "read",
      members: agentNames.map((name, index) => ({
        name,
        profile:
          index === 0
            ? {
                activity: "preparation",
                identity: assigned.identity,
                title: assigned.title,
                name,
                agent: name,
                profilePath: ".planning/agents/example.md",
                host: undefined,
                model: undefined,
                human: { status: "no-addition" },
              }
            : undefined,
      })),
    },
  });
  await mountBoardFrame(work, wideViewport, "roster");
  const roster = page.getByRole("region", { name: "Agent roster" });
  const heading = roster.getByRole("heading", { name: "Agent roster" });
  const back = roster.getByRole("button", { name: "Back to stories" });
  const source = roster.getByText(
    /Doughnut: agent profiles published at revision aaaaaaa/,
  );
  await expect.element(heading).toHaveFocus();
  const firstMember = roster.getByRole("listitem").first();
  await expect
    .element(firstMember.getByText("Preparing", { exact: true }))
    .toBeVisible();
  await expect
    .element(firstMember.getByText(assigned.title, { exact: true }))
    .toBeVisible();
  await expect.element(source).toBeVisible();
  await expect.element(back).toHaveTextContent("Back to stories");
  decorativeIcon(back.element());
  controlContrast(back.element());
  for (const part of [back, heading, source]) textContrast(part.element());

  for (const { width, height } of [narrowViewport, zoomedViewport]) {
    await page.viewport(width, height);
    await expect.element(back).toBeVisible();
    expectDocumentStill();
    expect(roster.element().scrollWidth).toBeLessThanOrEqual(
      roster.element().clientWidth + 1,
    );
    for (const words of visibleParts(roster.element(), "button, h2, h3, p"))
      expect(readsWhole(words)).toBe(true);
  }
});
