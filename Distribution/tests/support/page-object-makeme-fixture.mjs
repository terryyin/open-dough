// Selected MakeMe application against the actual complete installed catalog.
import { fileURLToPath } from "node:url";
import { makeMe } from "./makeMe.mjs";
import { createPageObjectInstalledProject } from "./page-object-native-installed-fixture.mjs";
import { makeMeProjectFiles } from "./page-object-makeme-project-files.mjs";

export async function createPageObjectMakeMeProject(directory, host, mode) {
  if (!["both", "makeme-only", "neither"].includes(mode))
    throw new Error(`Unknown mode: ${mode}`);
  const settings = makeMe.intentSettings
    .withLocations(
      makeMe.anIntentLocation
        .at("browser")
        .ofKind("javascript", ["**/*.spec.mjs"])
        .withRules({ makeMe: mode === "both", pageObjects: mode === "both" })
        .please(),
      makeMe.anIntentLocation
        .at("legacy")
        .ofKind("javascript", ["**/*.spec.mjs"])
        .withRules({ makeMe: mode === "makeme-only", pageObjects: false })
        .please(),
    )
    .please();
  const fixture = await createPageObjectInstalledProject(directory, host, {
    files: {
      ...makeMeProjectFiles,
      ".planning/open-dough.json": JSON.stringify(settings, null, 2),
    },
  });
  return {
    ...fixture,
    settings,
    testEntry: mode === "both" ? "browser" : "legacy",
  };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const [directory, host, mode] = process.argv.slice(2);
  console.log(
    JSON.stringify(await createPageObjectMakeMeProject(directory, host, mode)),
  );
}
