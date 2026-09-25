// Each Taken card shows who holds the work, from the agent profiles
// published beside the backlog at the snapshot's revision. The fake GitHub
// only publishes the files -- the backlog and the profile texts, spelled by
// the shared profile renderer -- and lists the profile directory as GitHub's
// contents listing would; the local read boundary, the shared profile reader,
// and the page decide everything shown.

import { expect, test } from "./dashboardTest.ts";
import { expectMembership, parts } from "./dashboardPage.ts";
import { publishFiles } from "./publishedOrigin.ts";
import { renderAgentProfile } from "../../src/skills/dough-product-backlog/scripts/product-backlog-agent-profile.mjs";

const repository = "terryyin/open-dough";
const backlogPath = ".planning/PRODUCT-BACKLOG.md";
const agents = ".planning/agents";
const revisionA = "a1".repeat(20);
const revisionB = "b2".repeat(20);

const trunkStory = "See who owns Taken work";
const branchStory = "Queue trunk integration on one machine";
const modelless = "Name the model when it is known";
const older = "Repair the installer's update report";
const queued = "Prepare stories in a clear workspace";

const backlog = `# Product backlog

## Taken

- [${trunkStory}](seeds/SEED-021-observe-published-story-progress.md#identify-taken-work-owner) — SEED-021#identify-taken-work-owner
- [${branchStory}](seeds/SEED-008-worktree-branch-trunk-sync.md#same-machine-merge-queue) — SEED-008#same-machine-merge-queue
- [${modelless}](seeds/SEED-030-models.md#known-model) — SEED-030#known-model
- [${older}](quick/059-installer-update-report/PLAN.md)

## Backlog list

- [${queued}](seeds/SEED-008-worktree-branch-trunk-sync.md#planning-workspace-procedure) — SEED-008#planning-workspace-procedure
`;

const akiho = renderAgentProfile({
  name: "Akiho",
  identity: "SEED-021#identify-taken-work-owner",
  mode: "trunk",
  branch: "origin/main",
  host: "claude",
  model: "claude-opus-5-5",
});
const yuma = renderAgentProfile({
  name: "Yuma",
  identity: "SEED-008#same-machine-merge-queue",
  mode: "story-branch",
  branch: "codex/same-machine-merge-queue",
  host: "codex",
  model: "gpt-5-codex",
});
const sola = renderAgentProfile({
  name: "Sola",
  identity: "SEED-030#known-model",
  mode: "trunk",
  branch: "origin/main",
  host: "cursor",
  // Unrecorded: the renderer leaves an undefined fact out of the profile.
  model: undefined,
});

test("each Taken card shows its published agent profile, or says plainly that none is recorded or readable", async ({
  page,
}) => {
  const requests = await publishFiles(page, {
    repository,
    revision: revisionA,
    files: {
      [backlogPath]: backlog,
      [`${agents}/akiho-chan.json`]: akiho,
      [`${agents}/yuma-chan.json`]: yuma,
      [`${agents}/sola-chan.json`]: sola,
      [`${agents}/mana-chan.json`]: '{ "agent": "Mana-chan", ',
      [`${agents}/README.md`]: "Not an agent profile.\n",
    },
  });

  await page.goto("/");

  const { taken, backlog: queue } = parts(page);
  await expectMembership(page, {
    taken: [trunkStory, branchStory, modelless, older],
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
  });

  await test.step("a malformed profile is shown as unreadable and matched to no entry", async () => {
    await expect(
      taken.getByRole("list", { name: "Unreadable agent profiles" }),
    ).toHaveText([
      "Agent profile mana-chan.json is unreadable: profile is not JSON. It is not matched to any Taken entry.",
    ]);
    await expect(
      taken.getByRole("article").filter({ hasText: "Mana-chan" }),
    ).toHaveCount(0);
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
      "mana-chan.json",
      "sola-chan.json",
      "yuma-chan.json",
    ]) {
      expect(asked).toContain(`content ${agents}/${file}?ref=${revisionA}`);
    }
    expect(asked).not.toContain(`content ${agents}/README.md?ref=${revisionA}`);
  });
});

test("a project without agent profiles still loads, and a refresh shows a profile published since", async ({
  page,
}) => {
  const onlyBacklog = `# Product backlog

## Taken

- [${trunkStory}](seeds/SEED-021-observe-published-story-progress.md#identify-taken-work-owner) — SEED-021#identify-taken-work-owner

## Backlog list
`;
  await publishFiles(page, {
    repository,
    revision: revisionA,
    files: { [backlogPath]: onlyBacklog },
  });

  await page.goto("/");

  const { taken, source, refresh, problem } = parts(page);
  const card = taken.getByRole("article", { name: trunkStory });

  await test.step("with no profile directory at the revision, the owner is not recorded and nothing fails", async () => {
    await expect(source).toContainText(revisionA);
    await expect(card).toContainText("Owner not recorded");
    await expect(problem).toHaveCount(0);
  });

  await test.step("after a refresh, the profile published at the new revision is shown", async () => {
    await publishFiles(page, {
      repository,
      revision: revisionB,
      files: {
        [backlogPath]: onlyBacklog,
        [`${agents}/akiho-chan.json`]: renderAgentProfile({
          name: "Akiho",
          identity: "SEED-021#identify-taken-work-owner",
          mode: "trunk",
          branch: "origin/main",
          host: undefined,
          model: undefined,
        }),
      },
    });
    await refresh.click();
    await expect(source).toContainText(revisionB);
    await expect(card).toContainText(
      "Akiho-chan · Trunk Mode · host not recorded · model not recorded",
    );
    await expect(card).not.toContainText("Owner not recorded");
  });
});
