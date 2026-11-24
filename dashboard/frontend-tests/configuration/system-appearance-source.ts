import { expect } from "vitest";
import { page } from "vitest/browser";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import type { IntentReadSource } from "../../src/intentReadSource.ts";
import { expandLocationAndFolders } from "../intent/intent-ci-homepage-page.ts";

const highlighted = "dashboard/tests/example.spec.ts";
const plain = "dashboard/checks/notes.check";
const specText = '// greets the reader\nexport const message = "hello";\n';
export const plainText = "plain recovery note\n";
const files = new Map([
  [highlighted, specText],
  [plain, plainText],
]);
export function sourceReads(reads: string[]): IntentReadSource {
  return {
    readLocations: () =>
      Promise.resolve({
        status: "configured",
        locations: [
          makeMe.anIntentLocation
            .at("dashboard/tests")
            .ofKind("typescript", ["**/*.spec.ts"])
            .selecting(highlighted)
            .please(),
          makeMe.anIntentLocation
            .at("dashboard/checks")
            .withSources({ include: ["**/*.check"] })
            .selecting(plain)
            .please(),
        ],
      }),
    readFile: (...[, path]) => {
      reads.push(path);
      const source = files.get(path);
      return source === undefined
        ? Promise.reject(new Error(`Unexpected Intent file: ${path}`))
        : Promise.resolve(source);
    },
    readCandidates: () => Promise.resolve({ status: "absent" }),
  };
}

export const intent = page.getByRole("main", { name: "Intent", exact: true });

async function openFile(location: string, file: string) {
  await expandLocationAndFolders(location);
  await intent.getByRole("button", { name: file, exact: true }).click();
  const source = intent.getByLabelText(`${file} source`, { exact: true });
  await expect.element(source).toBeVisible();
  return source;
}

export const openHighlightedSource = () =>
  openFile("dashboard/tests", highlighted);
export const openPlainSource = () => openFile("dashboard/checks", plain);
