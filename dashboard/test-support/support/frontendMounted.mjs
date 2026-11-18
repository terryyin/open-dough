import path from "node:path";
import { mountedProject } from "./frontendProof.mjs";
import { matchesMountedCase } from "./frontendSelection.mjs";

function caseTitles(test) {
  const parts = [test.name];
  for (
    let parent = test.parent;
    parent.type === "suite";
    parent = parent.parent
  )
    parts.unshift(parent.name);
  return parts;
}

export async function prepareMounted({
  config,
  files,
  args,
  workers,
  report,
  signal,
}) {
  const { createVitest } = await import("vitest/node");
  const vitest = await createVitest({
    config,
    // Browser commands use the same test-support modules as Playwright.
    // The module runner preserves their top-level awaits.
    configLoader: "runner",
    run: true,
    watch: false,
    maxWorkers: workers,
    allowOnly: !process.env.CI,
    attachmentsDir: path.join(path.dirname(report), "attachments"),
    reporters: ["verbose", ["json", { outputFile: report }]],
  });
  try {
    signal.throwIfAborted();
    const entries = new Map(files.map((file) => [file.file, file]));
    const specs = (await vitest.globTestSpecifications()).filter((spec) =>
      entries.has(spec.moduleId),
    );
    if (specs.length !== entries.size) {
      const missing = [...entries.keys()].filter(
        (file) => !specs.some((spec) => spec.moduleId === file),
      );
      throw new Error(`Vitest did not discover: ${missing.join(", ")}`);
    }
    const filtersCases = Boolean(
      args.grep ||
      args.grepInvert ||
      args.files.some((filter) => filter.line !== undefined),
    );
    const modules = await vitest.parseSpecifications(specs, {
      concurrency: workers,
    });
    const selected = new Map();
    const listings = [];
    const runSpecs = [];
    for (const [index, module] of modules.entries()) {
      const spec = specs[index];
      const entry = entries.get(spec.moduleId);
      const tests = [...module.children.allTests()]
        .map((test) => ({
          test,
          parts: caseTitles(test),
        }))
        .filter(({ test, parts }) =>
          matchesMountedCase(entry, args, parts.join(" "), test.location),
        );
      // A broken file must reach the runner and leave a failed collection,
      // even when its cases cannot be read during title discovery.
      if (args.list && module.errors().length)
        throw new Error(
          `${entry.label}: ${module
            .errors()
            .map((error) => error.message)
            .join(", ")}`,
        );
      if (filtersCases && tests.length === 0 && module.errors().length === 0)
        continue;
      selected.set(
        spec.moduleId,
        new Set(tests.map(({ parts }) => parts.join(" "))),
      );
      if (filtersCases && tests.length)
        spec.testNames = tests.map(({ test }) => test.fullName);
      runSpecs.push(spec);
      listings.push({
        name: spec.moduleId,
        status: "passed",
        message: "",
        assertionResults: tests.map(({ test, parts }) => ({
          ancestorTitles: parts.slice(0, -1),
          title: test.name,
          fullName: parts.join(" "),
          status: "skipped",
          location: test.location,
        })),
      });
    }
    return {
      close: () => vitest.close(),
      selected: filtersCases ? selected : undefined,
      files: listings,
      async run() {
        signal.throwIfAborted();
        await vitest.standalone();
        signal.throwIfAborted();
        const cancel = () => {
          void Promise.allSettled([
            vitest.cancelCurrentRun("keyboard-input"),
            ...vitest.projects.map((project) =>
              project.browser?.closeBrowserProvider(),
            ),
          ]);
        };
        signal.addEventListener("abort", cancel, { once: true });
        try {
          const result = await vitest.runTestSpecifications(runSpecs);
          const failed =
            result.unhandledErrors.length > 0 ||
            result.testModules.some((module) => module.state() === "failed");
          return failed || signal.aborted ? 1 : 0;
        } catch (error) {
          if (signal.aborted) return 1;
          throw error;
        } finally {
          signal.removeEventListener("abort", cancel);
        }
      },
    };
  } catch (error) {
    await vitest.close();
    throw error;
  }
}

export function printMountedListing(files, directory) {
  for (const file of files) {
    for (const test of file.assertionResults) {
      const at = test.location;
      const location = at ? `:${at.line}:${at.column}` : "";
      console.log(
        `  [${mountedProject}] › ${path.relative(directory, file.name)}${location} › ${[...test.ancestorTitles, test.title].join(" › ")}`,
      );
    }
  }
}
