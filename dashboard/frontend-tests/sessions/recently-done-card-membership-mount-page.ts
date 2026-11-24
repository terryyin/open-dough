// Closed story follow-ups and their source stories' published done catalogs
// for the mounted Board's Recently done membership cases.
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";

export const source = {
  identity: "SEED-390#probe-follow-up-source",
  title: "Explain the CI pause",
};
export const other = {
  identity: "SEED-391#other-follow-up-source",
  title: "Keep the scroll position",
};
const sha = (n: number) => n.toString(16).padStart(2, "0").repeat(20);

// A follow-up of `identity`; open while `doneAt` is undefined.
export function followUp(
  title: string,
  doneAt: string | undefined,
  {
    identity = source.identity,
    project = "open-dough",
    file = false,
  }: { identity?: string; project?: string; file?: boolean } = {},
) {
  const story = makeMe.aFollowUp.ofStory(identity, sha(9));
  if (file)
    story.anchoredAt({
      path: "dashboard/src/ciPause.ts",
      baseline: sha(1),
      tree: sha(2),
      completion: sha(3),
      line: 12,
      side: "new",
    });
  const record = makeMe.aLaunchRecord
    .adHoc({
      instruction: title,
      title,
      source: project,
      followUp: story.please(),
    })
    .inClaudeSession({ sessionId: title.replaceAll(" ", "-") })
    .launchedAt("2026-11-16T12:30:00.000Z");
  if (doneAt !== undefined) record.markedDoneAt(doneAt);
  return record.please();
}

// Each project's published done catalog of `stories`, completed newest first,
// with the page's read answering every listed record's body.
export function catalogs(listed: Record<string, (typeof source)[]>) {
  const record = (story: typeof source, index: number) =>
    makeMe.aDoneRecord
      .completed({
        ...story,
        completedAt: `2026-11-16T1${String(2 - index)}:00:00.000Z`,
      })
      .please();
  const done = Object.fromEntries(
    Object.entries(listed).map(([project, stories]) => [
      project,
      makeMe.aDoneCatalog.holding(stories.map(record)).please().done,
    ]),
  );
  const doneBodies = makeMe.aDoneCatalog
    .holding([source, other].map(record))
    .please().doneReads;
  return { done, doneBodies };
}
