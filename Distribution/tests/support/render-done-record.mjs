// Shell fixtures pipe done facts through the same builder and encoder.
import { readFileSync } from "node:fs";
import { renderDoneRecord } from "../../src/skills/dough-product-backlog/scripts/product-backlog-done-record.mjs";
import { makeMe } from "./makeMe.mjs";

const facts = JSON.parse(readFileSync(0, "utf8"));
process.stdout.write(renderDoneRecord(makeMe.aDoneRecord.with(facts).please()));
