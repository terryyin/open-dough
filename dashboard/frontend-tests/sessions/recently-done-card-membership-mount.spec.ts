// A closed story follow-up joins only its listed same-project source Done
// card on the mounted Board, over typed machine answers and published done
// catalogs; another story's or project's and an unlisted source's stay apart,
// and a kept counterpart stands for its published record there.
import { expect, test } from "vitest";
import { page } from "vitest/browser";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import { minutesAgo } from "../../../Distribution/tests/support/testDataDefaults.mjs";
import { publishedSessionRecordSchema } from "../../src/publishedSessionRecord.ts";
import { mountBoardFrame } from "../navigation/board-frame-mount.ts";
import { boardWork } from "../navigation/board-work.ts";
import {
  catalogs,
  followUp,
  other,
  source,
} from "./recently-done-card-membership-mount-page.ts";
import {
  doneCard,
  heldSessions,
  standaloneEntry,
  standaloneName,
  topLevelEntries,
} from "./recently-done-column-page.ts";
import { mountSessions } from "./recently-done-sidebar-mount-page.ts";

test("card and file follow-ups of one story share its Done card, newest first, and are listed once", async () => {
  const cardTitle = "Card follow-up of the pause";
  const fileTitle = "File follow-up of the pause";
  await mountSessions(
    makeMe.aMachineAnswer
      .observingDone(
        followUp(cardTitle, "2026-11-16T13:00:00.000Z"),
        followUp(fileTitle, "2026-11-16T13:05:00.000Z", { file: true }),
      )
      .please(),
    catalogs({ "open-dough": [source] }),
  );

  await expect.poll(() => heldSessions(source.title).all()).toHaveLength(2);
  await expect
    .element(heldSessions(source.title).nth(0))
    .toHaveAccessibleName(standaloneName(fileTitle));
  await expect
    .element(heldSessions(source.title).nth(1))
    .toHaveAccessibleName(standaloneName(cardTitle));
  for (const title of [cardTitle, fileTitle])
    expect(standaloneEntry(title).all()).toHaveLength(1);
});

test("another story's and another project's closed follow-ups stay off the card", async () => {
  const ownTitle = "Own story follow-up";
  const otherTitle = "Other story follow-up";
  const otherProjectTitle = "Other project follow-up";
  await mountSessions(
    makeMe.aMachineAnswer
      .observingDone(
        followUp(ownTitle, "2026-11-16T13:20:00.000Z"),
        followUp(otherTitle, "2026-11-16T13:21:00.000Z", {
          identity: other.identity,
        }),
        followUp(otherProjectTitle, "2026-11-16T13:22:00.000Z", {
          project: "doughnut",
        }),
      )
      .please(),
    catalogs({ "open-dough": [source, other], doughnut: [source] }),
  );

  await expect
    .element(heldSessions(source.title))
    .toHaveAccessibleName(standaloneName(ownTitle));
  await expect
    .element(heldSessions(other.title))
    .toHaveAccessibleName(standaloneName(otherTitle));
  expect(standaloneEntry(otherProjectTitle).all()).toHaveLength(0);
});

test("a closed follow-up whose source card is not listed stays standalone", async () => {
  const title = "Follow-up of an unlisted source";
  await mountSessions(
    makeMe.aMachineAnswer
      .observingDone(
        followUp(title, "2026-11-16T13:30:00.000Z", {
          identity: "SEED-399#unlisted-source",
        }),
      )
      .please(),
    catalogs({ "open-dough": [source] }),
  );

  await expect.element(standaloneEntry(title)).toBeVisible();
  await expect.element(doneCard(source.title)).toBeVisible();
  expect(heldSessions(source.title).all()).toHaveLength(0);
});

test("a card holding a closed follow-up offers only the story's own sessions as attachments", async () => {
  const followTitle = "Nested follow-up must not enter context";
  const own = makeMe.aLaunchRecord
    .executing(source)
    .inClaudeSession({ sessionId: "source-own-session" })
    .launchedAt("2026-11-16T11:50:00.000Z")
    .completedWith({ message: "" })
    .markedDoneAt("2026-11-16T11:55:00.000Z")
    .please();
  await mountSessions(
    makeMe.aMachineAnswer
      .observingUnavailable(
        own,
        followUp(followTitle, "2026-11-16T13:40:00.000Z"),
      )
      .please(),
    catalogs({ "open-dough": [source] }),
  );

  await expect.poll(() => heldSessions(source.title).all()).toHaveLength(2);
  // The open Sessions sidebar leaves Recently done beyond the Board's room.
  await page.getByRole("button", { name: /^Sessions/ }).click();
  const card = doneCard(source.title);
  const nested = card.getByRole("article", {
    name: standaloneName(followTitle),
  });
  await expect.element(nested).toBeVisible();
  const launcher = card.getByRole("button", {
    name: `Follow up ${source.identity} — ${source.title}`,
    exact: true,
  });
  await launcher.click();
  const dialog = page.getByRole("dialog");
  const context = dialog.getByRole("list", { name: "Follow-up context" });
  await expect.element(context).toBeVisible();
  const items = context
    .getByRole("listitem")
    .all()
    .map((item) => item.element().textContent);
  expect(items[0]).toMatch(/^Completed: /);
  expect(items.slice(1)).toEqual([
    `Status: Done. Its seed and plan may have been removed; its records remain in the project's history under ${source.identity}.`,
  ]);

  const chooser = dialog.getByRole("group", { name: "Attach sessions" });
  const choiceName = `${source.title} · Claude Code · ${own.session.sessionId}`;
  const choice = chooser.getByRole("checkbox", {
    name: choiceName,
    exact: true,
  });
  await expect.element(choice).toBeVisible();
  expect(chooser.getByRole("checkbox").all()).toHaveLength(1);
  await expect.element(choice).not.toBeChecked();
  await chooser.getByText(`Details for ${choiceName}`, { exact: true }).click();
  await expect.element(chooser.getByRole("definition").first()).toBeVisible();
  expect(
    chooser
      .getByRole("term")
      .all()
      .map((term) => [
        term.element().textContent,
        term.element().nextElementSibling?.textContent,
      ]),
  ).toEqual([
    ["Workflow", "Execution"],
    ["Story", source.identity],
    ["Original request", "No request text was given."],
    ["Final report", "No final report was submitted."],
  ]);
  await expect.element(choice).not.toBeChecked();

  await dialog.getByRole("button", { name: "Cancel", exact: true }).click();
  await expect.element(dialog).not.toBeInTheDocument();
  await expect.element(launcher).toHaveFocus();
  await expect.element(nested).toBeVisible();
});

test("a follow-up published from another machine while its kept counterpart is Done here shows one entry, on its source card", async () => {
  const record = publishedSessionRecordSchema.parse(
    makeMe.aSessionRecord.closedAt(minutesAgo(5)).please(),
  );
  const kept = makeMe.aLaunchRecord
    .adHoc({
      instruction: "Counterpart here",
      title: "Counterpart here",
      followUp: makeMe.aFollowUp.ofStory(source, "a".repeat(40)).please(),
    })
    .reportingThrough({
      origin: "https://dashboard.example",
      reference: record.sessionId,
      command: "node report.mjs",
    })
    .inClaudeSession({ sessionId: "counterpart-here" })
    .launchedAt(minutesAgo(20))
    .markedDoneAt(minutesAgo(6))
    .please();
  const { done, doneBodies } = catalogs({ "open-dough": [source] });
  const sourceCatalog = done["open-dough"];
  if (sourceCatalog === undefined) throw new Error("No source catalog.");
  const work = boardWork([], {
    done: { ...sourceCatalog, revision: "a".repeat(40) },
    publishedSessions: {
      status: "listed",
      revision: "a".repeat(40),
      sessions: [record],
    },
  });
  await mountBoardFrame(
    work,
    { width: 1280, height: 900 },
    "stories",
    { answer: makeMe.aMachineAnswer.observingDone(kept).please() },
    { done: doneBodies },
  );

  await expect
    .element(heldSessions(source.title))
    .toHaveAccessibleName(standaloneName("Counterpart here"));
  expect(topLevelEntries()).toHaveLength(1);
});
