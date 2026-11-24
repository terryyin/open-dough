// In both appearances a review diff's tokens look as the Intent source viewer
// (../../src/IntentSourceLines.tsx) shows the same code: keyword, identifier,
// string and comment on unchanged, added and removed lines.
import { createElement } from "react";
import { expect, test } from "vitest";
import { page, type Locator } from "vitest/browser";
import { IntentSourceLines } from "../../src/IntentSourceLines.tsx";
import { PageReadsOnPage } from "../../src/pageReads.tsx";
import { StyledFileDiff } from "../../src/StyledFileDiff.tsx";
import { pageReadsSupplying } from "../../test-support/component-mount/unreadPageReads.ts";
import { mountComponent } from "../../test-support/component-mount/mountComponent.ts";
import {
  greetDiff,
  greetText,
} from "../../test-support/support/diffSyntaxFixtures.ts";
import { diffColorScheme } from "./diffColorScheme.ts";
import { reviewDiffPage, tokenAppearance } from "./reviewDiffPage.ts";

const path = "dashboard/tests/greet.spec.ts";
const schemes = ["dark", "light"] as const;
const roles = {
  keyword: /^const$/,
  identifier: /^ ?(greeting|farewell)$/,
  string: /hello|later|bye/,
  comment: /old|new|and close here|greeting's notes/,
};

const sourceToken = (text: RegExp): HTMLElement | undefined =>
  Array.from(
    page
      .getByLabelText(`${path} source`)
      .element()
      .querySelectorAll<HTMLElement>(".source-line-text span"),
  ).find((span) => text.test(span.textContent));

test("diff tokens match Intent's source reading of the same code in both appearances", async () => {
  const setColorScheme = diffColorScheme();
  await setColorScheme("dark");
  await mountComponent(
    createElement(
      PageReadsOnPage,
      { reads: pageReadsSupplying({}) },
      createElement(StyledFileDiff, {
        path,
        printed: greetDiff(path).printed,
        text: greetText,
        contextReading: false,
        onRetryText: () => {},
      }),
      createElement(IntentSourceLines, {
        text: greetText.tree,
        revision: "1111111111111111111111111111111111111111",
        path,
        syntaxHint: "typescript",
      }),
    ),
  );
  const diff = reviewDiffPage();
  const lines = {
    unchanged: diff.newLine(28),
    added: diff.newLine(29),
    removed: diff.removedLine(29),
  };
  await expect.element(lines.removed.token(roles.comment)).toBeVisible();
  await expect.poll(() => sourceToken(roles.comment)).toBeDefined();

  const diffTokens: Record<string, Locator> = {
    ...Object.fromEntries(
      Object.entries(lines).flatMap(([kind, line]) => [
        [`${kind} keyword`, line.token(roles.keyword)],
        [`${kind} identifier`, line.token(roles.identifier)],
        [`${kind} string`, line.token(roles.string)],
      ]),
    ),
    "added comment": lines.added.token(roles.comment),
    "removed comment": lines.removed.token(roles.comment),
    "unchanged comment": diff.newLine(27).token(roles.comment),
  };
  const shown: Record<string, { diff: object; source: object }> = {};
  for (const scheme of schemes) {
    await setColorScheme(scheme);
    const inSource = Object.fromEntries(
      Object.entries(roles).map(([role, text]) => {
        const token = sourceToken(text);
        if (!token) throw new Error(`No ${role} in the source.`);
        return [role, tokenAppearance({ element: () => token } as Locator)];
      }),
    );
    const inDiff = Object.fromEntries(
      Object.entries(diffTokens).map(([name, token]) => [
        name,
        tokenAppearance(token),
      ]),
    );
    expect(inDiff, `${scheme} diff tokens equal Intent's`).toEqual(
      Object.fromEntries(
        Object.keys(diffTokens).map((name) => [
          name,
          inSource[name.split(" ")[1] ?? ""],
        ]),
      ),
    );
    shown[scheme] = { diff: inDiff, source: inSource };
  }
  const source = (scheme: (typeof schemes)[number]) =>
    shown[scheme]?.source as Record<string, unknown>;
  expect(source("dark").keyword).not.toEqual(source("light").keyword);
  expect(source("dark").keyword).not.toEqual(source("dark").string);
  expect(source("dark").comment).not.toEqual(source("dark").identifier);
});
