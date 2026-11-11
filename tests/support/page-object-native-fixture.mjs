// A described project and a minimal native candidate layout. Installation and
// final shared membership/runtime contracts are proved by later slices.
import { cpSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { makeMe } from "./makeMe.mjs";
import { materializeLocalCheckout } from "./repository-fixture.mjs";
import { projectFiles } from "./page-object-native-project-files.mjs";

const source = fileURLToPath(
  new URL("../../src/skills/dough-page-objects", import.meta.url),
);

export async function createPageObjectProject(
  directory,
  host,
  { enabled = true } = {},
) {
  const browser = makeMe.anIntentLocation
    .at("browser")
    .ofKind("javascript", ["**/*.spec.mjs"])
    .please();
  const legacy = makeMe.anIntentLocation
    .at("legacy")
    .ofKind("javascript", ["**/*.spec.mjs"])
    .please();
  const settings = makeMe.intentSettings
    .withLocations(browser, legacy)
    .please();
  // The exact proposed flag shape is input under proof, not a second parser.
  settings.intent.locations[0].pageObjects = enabled;
  settings.intent.locations[1].pageObjects = false;
  const description = makeMe.aRepository
    .withRevision("library project", {
      backlog: null,
      files: {
        ...projectFiles,
        ".planning/open-dough.json": JSON.stringify(settings, null, 2),
      },
    })
    .please();
  mkdirSync(directory, { recursive: true });
  const { integration } = await materializeLocalCheckout(
    undefined,
    description,
    { at: directory },
  );
  const layout = host === "claude" ? ".claude" : ".agents";
  const installed = join(integration, layout, "skills", "dough-page-objects");
  cpSync(source, installed, { recursive: true });
  return { project: integration, installed, settings };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const [directory, host, enabled] = process.argv.slice(2);
  console.log(
    JSON.stringify(
      await createPageObjectProject(directory, host, {
        enabled: enabled !== "off",
      }),
    ),
  );
}
