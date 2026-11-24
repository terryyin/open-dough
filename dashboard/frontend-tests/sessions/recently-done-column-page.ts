// The mounted Board's Recently done column as the done-session cases read it:
// a done story's card, the sessions that card holds, a standalone session's
// entry, and the column's top-level entries.
import { boardReading } from "../navigation/board-reading-page.ts";

export const recentlyDone = () => boardReading.column("Recently done");
export const doneCard = (title: string) =>
  recentlyDone().getByRole("article", { name: title, exact: true });
export const heldSessions = (title: string) =>
  doneCard(title).getByRole("list", { name: "Sessions" }).getByRole("article");
export const standaloneName = (title: string) => `Ad hoc session for ${title}`;
export const standaloneEntry = (title: string) =>
  recentlyDone().getByRole("article", {
    name: standaloneName(title),
    exact: true,
  });
export const topLevelEntries = () => [
  ...recentlyDone().element().querySelectorAll("article:not(article article)"),
];
