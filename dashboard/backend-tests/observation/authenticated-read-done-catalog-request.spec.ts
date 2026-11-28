import { expect, test } from "vitest";
import { doneCatalogFileName } from "../../../Distribution/src/skills/dough-product-backlog/scripts/product-backlog-done-catalog.mjs";
import { parseRequestedRead } from "../../server/requestedRead.ts";

const pinned = "9b".repeat(20);
const record = "SEED-001_x.json";
const path = ".planning/done/SEED-001_x.json";
const bodies =
  "A done record read names only a pinned revision and the catalogued record files.";
const catalog = "A done catalog read names only a pinned revision.";
const done =
  "A done read names the done catalog or the catalogued record files.";
const fullSha = "The pinned revision is not a commit sha.";

const tooMany = new URLSearchParams({ done: "bodies" });
for (let index = 0; index < 101; index++) {
  tooMany.append("file", `SEED-${String(index)}_x.json`);
}

test.each([
  [
    "a body read also naming a path",
    `done=bodies&file=${record}&path=${path}`,
    bodies,
  ],
  [
    "a filename that is no record",
    `done=bodies&file=${encodeURIComponent("../secrets.json")}`,
    bodies,
  ],
  ["the catalog as a body", `done=bodies&file=${doneCatalogFileName}`, bodies],
  ["a body read naming no record", "done=bodies", bodies],
  [
    "a body read naming too many records",
    tooMany.toString(),
    "A done record read names too many records.",
  ],
  ["a catalog read naming a record", `done=catalog&file=${record}`, catalog],
  ["a catalog read also naming a path", `done=catalog&path=${path}`, catalog],
  [
    "a catalog read combined with profiles",
    "done=catalog&agents=profiles",
    catalog,
  ],
  ["a read of every record at once", "done=records", done],
  [
    "an unsupported Done operation naming a record",
    `done=records&file=${record}`,
    done,
  ],
  ["a catalog read at a symbolic revision", "done=catalog", fullSha, "main"],
] as const)(
  "refuses %s before dispatch",
  (...[, query, message, revision = pinned]) => {
    const params = new URLSearchParams(query);
    params.set("source", "open-dough");
    params.set("revision", revision);
    expect(parseRequestedRead(params)).toEqual({
      kind: "refused",
      status: 400,
      message,
    });
  },
);
