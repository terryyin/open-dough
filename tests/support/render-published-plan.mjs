// Shell fixtures pipe arranged plan facts into the same builder and writer.
import { readFileSync } from "node:fs";
import { makeMe } from "./makeMe.mjs";
import { renderSlicePlan } from "./published-plan.mjs";

const { preamble, slices, completion } = JSON.parse(readFileSync(0, "utf8"));
const plan = makeMe.aSlicePlan
  .with({
    slices: slices.map((slice) => makeMe.aPlanSlice.with(slice).please()),
    completion,
  })
  .please();
process.stdout.write(renderSlicePlan(plan, { preamble }));
