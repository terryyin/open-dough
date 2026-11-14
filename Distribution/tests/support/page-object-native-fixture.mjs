// A described browser project with optional minimal candidate guidance.
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
  { enabled = true, guidance = true, files = {} } = {},
) {
  const browser = makeMe.anIntentLocation
    .at("browser")
    .ofKind("javascript", ["**/*.spec.mjs"])
    .withRules({ pageObjects: enabled })
    .please();
  const legacy = makeMe.anIntentLocation
    .at("legacy")
    .ofKind("javascript", ["**/*.spec.mjs"])
    .withRules({ pageObjects: false })
    .please();
  const settings = makeMe.intentSettings
    .withLocations(browser, legacy)
    .please();
  const description = makeMe.aRepository
    .withRevision("library project", {
      backlog: null,
      files: {
        ...projectFiles,
        ".planning/open-dough.json": JSON.stringify(settings, null, 2),
        ...files,
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
  if (!guidance) return { project: integration, installed, settings };
  cpSync(source, installed, { recursive: true });
  const execution = join(integration, layout, "skills", "dough-execute-plan");
  for (const path of [
    "references/test-entry-rules.md",
    "scripts/test-entry-rules.mjs",
    "scripts/test-entry-settings.mjs",
    "scripts/ci-direct-entry.mjs",
    "scripts/git-changes.mjs",
    "scripts/test-entry-rules-runtime.mjs",
    "scripts/test-entry-rules-LICENSE.txt",
  ]) {
    const target = join(execution, path);
    mkdirSync(join(target, ".."), { recursive: true });
    cpSync(
      new URL(`../../src/skills/dough-execute-plan/${path}`, import.meta.url),
      target,
    );
  }
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
