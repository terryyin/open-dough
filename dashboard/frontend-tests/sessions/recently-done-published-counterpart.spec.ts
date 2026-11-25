import { expect, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import { publishedSessionRecordSchema } from "../../src/publishedSessionRecord.ts";
import { newestFirst } from "../../src/recentlyDoneListing.ts";

const source = {
  identity: "SEED-390#probe-follow-up-source",
  title: "Explain the CI pause",
};
const published = publishedSessionRecordSchema.parse(
  makeMe.aSessionRecord
    .forStory(source.identity)
    .closedAt("2026-11-16T13:00:00.000Z")
    .please(),
);
const card = makeMe.aDoneRecord
  .completed({ ...source, completedAt: "2026-11-16T12:00:00.000Z" })
  .please();
const catalogued = makeMe.aDoneCatalog.holding([card]).please().done.records;

test("only a publication naming the Done story belongs to its card", () => {
  const standalone = publishedSessionRecordSchema.parse(
    makeMe.aSessionRecord.please(),
  );
  const other = publishedSessionRecordSchema.parse(
    makeMe.aSessionRecord.forStory("SEED-391#another").please(),
  );
  const listed = newestFirst(catalogued, [], "open-dough", [
    published,
    standalone,
    other,
  ]);
  expect(
    listed.map(({ record, published: sessions }) => [
      record.identity,
      sessions.map(({ sessionId }) => sessionId),
    ]),
  ).toEqual([[source.identity, [published.sessionId]]]);
});
