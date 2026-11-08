// Let the first real Rolldown output complete, then hold the second entry.
import { mkdirSync } from "node:fs";
import { register } from "node:module";
import path from "node:path";
import { isMainThread } from "node:worker_threads";

// The preload installs this module's resolve hook in Node's loader thread.
if (isMainThread) register(import.meta.url);

export function resolve(specifier, context, nextResolve) {
  if (
    specifier === "rolldown" &&
    context.parentURL?.endsWith("/tests/support/serverBundle.ts")
  )
    return { shortCircuit: true, url: import.meta.url };
  return nextResolve(specifier, context);
}

export async function build(options) {
  const entry = options.output.file;
  const gate = process.env["OPEN_DOUGH_ARTIFACT_PROOF_GATE"];
  if (gate && path.basename(entry) === "boundaryServer.mjs") {
    const response = await fetch(gate, {
      method: "POST",
      body: JSON.stringify({ pid: process.pid, outDir: path.dirname(entry) }),
    });
    // An occupied output path makes Rolldown itself reject the write.
    if ((await response.text()) === "fail") mkdirSync(entry);
  }
  const { build: rolldownBuild } = await import("rolldown");
  return rolldownBuild(options);
}
