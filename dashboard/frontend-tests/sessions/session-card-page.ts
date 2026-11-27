import { expect } from "vitest";
import { page, userEvent, type Locator } from "vitest/browser";
import {
  sessionKey,
  type SessionReference,
} from "../../src/sessionReference.ts";
import { expandButton } from "../page-objects/activateButton.ts";
import "../page-objects/cssLocator.ts";
import { readyStory } from "./session-card-mount.ts";

const deleteQuestion =
  "Delete this session's dashboard record? The conversation stays in Claude Code; a running session keeps running.";

export const sidebar = page.getByRole("complementary", {
  name: "Sessions sidebar",
});
export const sidebarButton = page.getByRole("button", {
  name: "Sessions",
  exact: true,
});
export const sidebarSession = (title: string) =>
  sidebar.getByRole("button", { name: title, exact: true });
export const taken = page.getByRole("region", { name: "Taken", exact: true });
export const takenSession = (story: string, session: SessionReference) =>
  taken
    .getByRole("article", { name: story, exact: true })
    .getByRole("article", { name: "Ad hoc session", exact: true })
    .and(
      page.getByCSS(
        `[data-shows-session="${CSS.escape(sessionKey(session))}"]`,
      ),
    );
export const namedCard = (title: string) =>
  page.getByRole("article", { name: title, exact: true });
export const card = namedCard(readyStory.title);
export const recentExecution = page
  .getByRole("region", { name: "Recently done" })
  .getByRole("article", { name: `Execution session for ${readyStory.title}` });

export function sessionEntry(entry: Locator) {
  const actions = entry.getByRole("button", { name: "More session actions" });
  const details = entry.getByRole("button", { name: "Session details" });
  const done = entry.getByRole("button", { name: "Mark as done", exact: true });
  const remove = entry.getByRole("button", {
    name: "Delete record…",
    exact: true,
  });
  const question = entry.getByRole("group", { name: deleteQuestion });
  const keep = question.getByRole("button", { name: "Keep", exact: true });
  const confirm = question.getByRole("button", {
    name: "Delete record",
    exact: true,
  });

  const showActions = () => expandButton(actions);

  return {
    entry,
    actions,
    details,
    done,
    remove,
    question,
    keep,
    confirm,
    state: entry.getByText(
      /^(Working|Needs input|State unknown|Session unavailable|Done)\b/,
    ),
    status: entry.getByRole("status"),
    open: entry.getByRole("button", { name: "Open terminal" }),
    askToDelete: async () => {
      await showActions();
      await userEvent.click(remove);
      await expect.element(question).toHaveAccessibleName(deleteQuestion);
    },
    askToMarkDone: async () => {
      await showActions();
      await userEvent.click(done);
      const keepOpen = entry.getByRole("button", { name: "Keep open" });
      await expect.element(keepOpen).toHaveFocus();
      return entry
        .getByRole("group", { name: /Mark it done anyway/ })
        .getByRole("button", { name: "Mark as done" });
    },
  };
}

export const cardSession = (storyCard = card, name = "Execution session") =>
  sessionEntry(storyCard.getByRole("article", { name, exact: true }));

export async function expectDeletedSession() {
  await expect.element(cardSession().entry).not.toBeInTheDocument();
  await expect.element(recentExecution).not.toBeInTheDocument();
  await expect
    .element(sidebar.getByRole("heading", { name: readyStory.title }))
    .not.toBeInTheDocument();
  await expect
    .element(page.getByText("Session record deleted", { exact: true }))
    .not.toBeInTheDocument();
}
