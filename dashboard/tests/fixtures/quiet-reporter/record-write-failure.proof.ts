import { test } from "@playwright/test";
import { readFileSync, writeFileSync } from "node:fs";

test("passes while its next snapshot cannot be written", () => {
  const file = process.env["PROOF_WRITE_FAILURE_PATH"];
  if (!file) throw new Error("missing controlled recording-failure path");
  const record = JSON.parse(readFileSync(file, "utf8")) as {
    run: { id: string };
  };
  // An exclusive temporary-file collision forces a real storage error at
  // the next reporter event, after a valid running snapshot already exists.
  writeFileSync(`${file}.${record.run.id}.tmp`, "reserved by the fixture", {
    flag: "wx",
  });
});
