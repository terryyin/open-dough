// Each Taken card shows who holds the work, from the agent profiles
// published beside the backlog at the snapshot's revision. The fake GitHub
// only publishes the files (takenAgentProfileRecords.ts) and lists the
// profile directory as GitHub's contents listing would; the local read
// boundary, the shared profile reader, and the page decide everything shown.

import { expect, test } from "./dashboardTest.ts";
import { expectMembership, parts } from "./dashboardPage.ts";
import { publishFiles } from "./publishedOrigin.ts";
import { expectMark, expectPortrait } from "./agentPortrait.ts";
import {
  agents,
  branchStory,
  files,
  lastInRotation,
  modelless,
  older,
  queued,
  repository,
  revisionA,
  trunkStory,
} from "./takenAgentProfileRecords.ts";

test("each Taken card shows its published agent profile, or says plainly that none is recorded or readable", async ({
  page,
}) => {
  const requests = await publishFiles(page, {
    repository,
    revision: revisionA,
    files,
  });

  await page.goto("/");

  const { taken, backlog: queue } = parts(page);
  await expectMembership(page, {
    taken: [trunkStory, branchStory, modelless, older, lastInRotation],
    backlog: [queued],
  });
  const card = (title: string) => taken.getByRole("article", { name: title });
  await expect(page.getByText("Reading agent profile…")).toHaveCount(0);

  await test.step("a Trunk Mode profile shows its agent, mode, host, and model on one line", async () => {
    await expect(card(trunkStory)).toContainText(
      "Akiho-chan · Trunk Mode · Claude Code · claude-opus-5-5",
    );
    await expect(card(trunkStory)).toContainText("Trunk: origin/main");
  });

  await test.step("each recorded agent has its own approved portrait beside its name, and the owner text is unchanged", async () => {
    await expectPortrait(card(trunkStory), "Akiho-chan", {
      atlas: 1,
      position: "50% 12.5%",
    });
    await expectPortrait(card(branchStory), "Yuma-chan", {
      atlas: 1,
      position: "100% 12.5%",
    });
    await expectPortrait(card(modelless), "Sola-chan", {
      atlas: 1,
      position: "0% 87.5%",
    });
    await expectPortrait(card(lastInRotation), "Rina-chan", {
      atlas: 5,
      position: "50% 87.5%",
    });
    await expect(card(lastInRotation)).toContainText(
      "Rina-chan · Story Branch Mode · Claude Code · claude-opus-5-5",
    );
    // The portrait is decorative: the card's accessible text is the owner
    // text alone, with no presence status.
    for (const title of [trunkStory, branchStory, modelless, lastInRotation]) {
      await expect(card(title)).not.toContainText(
        /online|active|offline|away/i,
      );
    }
  });

  await test.step("hovering a portrait shows it larger from where it stands", async () => {
    const portrait = card(trunkStory).locator(".agent-portrait");
    const resting = await portrait.boundingBox();
    expect(resting).not.toBeNull();
    if (resting === null) return;
    await portrait.hover();
    await expect
      .poll(async () => (await portrait.boundingBox())?.width)
      .toBeCloseTo(resting.width * 3, 0);
    expect((await portrait.boundingBox())?.x).toBeCloseTo(resting.x, 0);
    await page.mouse.move(0, 0);
    await expect
      .poll(async () => (await portrait.boundingBox())?.width)
      .toBeCloseTo(resting.width, 0);
  });

  await test.step("each recorded mode and host has its own mark beside its label, clear of the portrait, at desktop and narrow widths", async () => {
    const marked = [
      [trunkStory, "Trunk Mode", "trunk.svg", "Claude Code", "claude.png"],
      [
        branchStory,
        "Story Branch Mode",
        "story-branch.svg",
        "Codex",
        "codex.png",
      ],
      [modelless, "Trunk Mode", "trunk.svg", "Cursor", "cursor.png"],
      [
        lastInRotation,
        "Story Branch Mode",
        "story-branch.svg",
        "Claude Code",
        "claude.png",
      ],
    ] as const;
    for (const width of [1280, 360]) {
      await page.setViewportSize({ width, height: 900 });
      for (const [title, mode, modeFile, host, hostFile] of marked) {
        await expectMark(card(title), "mode", mode, `mode-icons/${modeFile}`);
        await expectMark(card(title), "host", host, `tool-avatars/${hostFile}`);
        // The model has no mark, and the owner text is unchanged.
        await expect(card(title).locator(".owner-model img")).toHaveCount(0);
      }
    }
    await expect(card(trunkStory)).toContainText(
      "Akiho-chan · Trunk Mode · Claude Code · claude-opus-5-5",
    );
  });

  await test.step("a Story Branch Mode profile shows its branch as context, never as work on trunk", async () => {
    const branch = card(branchStory);
    await expect(branch).toContainText(
      "Yuma-chan · Story Branch Mode · Codex · gpt-5-codex",
    );
    await expect(branch).toContainText(
      "Branch context: codex/same-machine-merge-queue (story branch work; not on trunk)",
    );
    await expect(branch).not.toContainText("Trunk Mode");
    await expect(branch).not.toContainText("Trunk:");
  });

  await test.step("a profile that does not record the model says so", async () => {
    await expect(card(modelless)).toContainText(
      "Sola-chan · Trunk Mode · Cursor · model not recorded",
    );
  });

  await test.step("a Taken entry without a profile shows that its owner is not recorded", async () => {
    await expect(card(older)).toContainText("Owner not recorded");
    await expect(card(older)).not.toContainText("-chan");
    await expect(card(older).locator(".agent-portrait")).toHaveCount(0);
    await expect(card(older).locator("img")).toHaveCount(0);
  });

  await test.step("a malformed profile is shown as unreadable and matched to no entry, while a preparation assignment is neither", async () => {
    await expect(
      taken.getByRole("list", { name: "Unreadable agent profiles" }),
    ).toHaveText([
      "Agent profile mana-chan.json is unreadable: profile is not JSON. It is not matched to any Taken entry.",
    ]);
    for (const agent of ["Mana-chan", "Kirara-chan"])
      await expect(
        taken.getByRole("article").filter({ hasText: agent }),
      ).toHaveCount(0);
    await expect(taken.locator(".agent-portrait")).toHaveCount(4);
    await expect(taken.locator(".owner-mark")).toHaveCount(8);
  });

  await test.step("Backlog entries claim no owner", async () => {
    await expect(queue).not.toContainText("-chan");
    await expect(queue).not.toContainText("Owner");
  });

  await test.step("the profile directory is listed at the revision, and only profile files are read", () => {
    const asked = requests.flatMap(({ request }) =>
      request.kind === "content" || request.kind === "listing"
        ? [`${request.kind} ${request.path}?ref=${request.revision}`]
        : [],
    );
    expect(asked).toContain(`listing ${agents}?ref=${revisionA}`);
    for (const file of [
      "akiho-chan.json",
      "kirara-chan.json",
      "mana-chan.json",
      "rina-chan.json",
      "sola-chan.json",
      "yuma-chan.json",
    ]) {
      expect(asked).toContain(`content ${agents}/${file}?ref=${revisionA}`);
    }
    expect(asked).not.toContain(`content ${agents}/README.md?ref=${revisionA}`);
  });
});
