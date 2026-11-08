// Hold the actual Vite build process at a parent-controlled reply. Every
// other process that inherits the preload runs without the gate.
import { writeFileSync } from "node:fs";
import path from "node:path";

const [, entry, command, ...args] = process.argv;
const option = args.indexOf("--outDir");
const outDir = option < 0 ? undefined : args[option + 1];
const gate = process.env["OPEN_DOUGH_ARTIFACT_PROOF_GATE"];

if (
  gate &&
  entry &&
  path.basename(entry) === "vite" &&
  command === "build" &&
  outDir
) {
  writeFileSync(path.join(outDir, "partial"), "Vite build reached the gate");
  const response = await fetch(gate, {
    method: "POST",
    body: JSON.stringify({ pid: process.pid, outDir }),
  });
  if ((await response.text()) === "fail")
    throw new Error("Vite app build failed at the proof gate");
}
