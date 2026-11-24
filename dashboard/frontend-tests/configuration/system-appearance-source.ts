import { expect } from "vitest";
import { page, type Locator } from "vitest/browser";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import type { IntentReadSource } from "../../src/intentReadSource.ts";
import { expandLocationAndFolders } from "../intent/intent-ci-homepage-page.ts";
import { textContrast } from "../navigation/board-accessibility.ts";

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

export function highlightedSourceReading(
  source: Locator,
  text: { readonly keyword: RegExp; readonly comment: RegExp },
) {
  const tokenMatching = (pattern: RegExp) =>
    [...source.element().querySelectorAll(".source-token")].find((span) =>
      pattern.test(span.textContent),
    );
  const keyword = () => tokenMatching(text.keyword);

  return {
    keyword,
    async expectText(expected: string) {
      await expect.poll(() => source.query()?.textContent).toContain(expected);
    },
    async visibleTokens() {
      await expect.poll(() => keyword()?.checkVisibility()).toBe(true);
      const keywordToken = keyword();
      const commentToken = tokenMatching(text.comment);
      if (!keywordToken || !commentToken)
        throw new Error("The highlighted source is missing its tokens.");
      return { keyword: keywordToken, comment: commentToken };
    },
    expectReadableLineNumber() {
      const lineNumber = source.element().querySelector(".source-line-number");
      if (!lineNumber)
        throw new Error("The highlighted source is missing its line numbers.");
      textContrast(lineNumber);
    },
  };
}

export function expectReadablePlainSource(source: Locator, expected: string) {
  const element = source.element();
  const lines = [...element.querySelectorAll(".source-line-text")];
  expect(lines.map((line) => line.textContent)).toEqual(expected.split("\n"));
  expect(element.querySelectorAll(".source-line-text span")).toHaveLength(0);
  const first = lines[0];
  if (!first) throw new Error("The plain source has no line to read.");
  textContrast(first);
}
