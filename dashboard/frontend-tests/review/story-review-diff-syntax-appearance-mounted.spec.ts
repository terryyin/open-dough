import { expect, test } from "vitest";
import { mountComponent } from "../../test-support/component-mount/mountComponent.ts";
import {
  greetDiff,
  greetText,
} from "../../test-support/support/diffSyntaxFixtures.ts";
import { diffColorScheme } from "./diffColorScheme.ts";
import { styledDiffReading } from "./mountedFileDiff.ts";
import {
  mountedReviewDiff,
  tokenAppearance,
  tokenContrast,
} from "./mountedReviewDiffPage.ts";
import { limitAtPath } from "./wordEmphasisCases.ts";

async function mountLimitDiff() {
  const path = "limit.ts";
  await mountComponent(styledDiffReading({ path, ...limitAtPath(path) }));
  const diff = mountedReviewDiff();
  return { added: diff.newLine(25), removed: diff.removedLine(25) };
}

test("styled changed words keep token colours inside insertions and deletions", async () => {
  const setColorScheme = diffColorScheme();
  await setColorScheme("dark");
  const { added, removed } = await mountLimitDiff();
  const number = added.token(/^25$/);
  const keyword = added.token(/^const$/);
  const insertedTokens = added.tokensInInsertion();
  const deletedTokens = removed.tokensInDeletion();

  await expect.element(keyword).toBeVisible();
  await expect.element(insertedTokens.first()).toBeVisible();
  await expect.element(deletedTokens.first()).toBeVisible();
  expect(added.insertedWords()).toEqual(["25"]);
  expect(removed.deletedWords()).toEqual(["20"]);
  expect(insertedTokens.elements().map((token) => token.textContent)).toEqual([
    "25",
  ]);
  expect(deletedTokens.elements().map((token) => token.textContent)).toEqual([
    "20",
  ]);
  await expect.element(added.line).toHaveClass("story-review-added");
  await expect.element(removed.line).toHaveClass("story-review-removed");
  expect(added.text()).toBe("+const limit = 25;");
  expect(removed.text()).toBe("-const limit = 20;");

  expect(tokenAppearance(number).color).not.toBe(
    tokenAppearance(keyword).color,
  );
  await setColorScheme("light");
  expect(tokenAppearance(number).color).not.toBe(
    tokenAppearance(keyword).color,
  );
});

test("emphasized tokens and underlines stay readable in light and dark", async () => {
  const setColorScheme = diffColorScheme();
  await setColorScheme("dark");
  const { added, removed } = await mountLimitDiff();
  const insertion = added.tokensInInsertion().filter({ hasText: /^25$/ });
  const deletion = removed.tokensInDeletion().filter({ hasText: /^20$/ });
  await expect.element(insertion).toBeVisible();
  await expect.element(deletion).toBeVisible();

  function readMarkColours(scheme: "dark" | "light") {
    const insertedUnderline = added.insertionUnderline();
    const deletedUnderline = removed.deletionUnderline();
    expect(
      tokenContrast(insertion),
      `${scheme} insertion token contrast`,
    ).toBeGreaterThanOrEqual(4.5);
    expect(
      tokenContrast(deletion),
      `${scheme} deletion token contrast`,
    ).toBeGreaterThanOrEqual(4.5);
    expect(
      insertedUnderline.contrast,
      `${scheme} insertion underline contrast`,
    ).toBeGreaterThanOrEqual(3);
    expect(
      deletedUnderline.contrast,
      `${scheme} deletion underline contrast`,
    ).toBeGreaterThanOrEqual(3);
    return {
      insertedToken: tokenAppearance(insertion).color,
      deletedToken: tokenAppearance(deletion).color,
      insertedUnderline: insertedUnderline.color,
      deletedUnderline: deletedUnderline.color,
    };
  }

  const dark = readMarkColours("dark");
  await setColorScheme("light");
  const light = readMarkColours("light");
  expect(light.insertedToken).not.toBe(dark.insertedToken);
  expect(light.deletedToken).not.toBe(dark.deletedToken);
  expect(light.insertedUnderline).not.toBe(dark.insertedUnderline);
  expect(light.deletedUnderline).not.toBe(dark.deletedUnderline);
});

test("diff tokens on added, removed and unchanged lines read at 4.5:1 in both appearances", async () => {
  const setColorScheme = diffColorScheme();
  await setColorScheme("dark");
  const path = "dashboard/tests/greet.spec.ts";
  await mountComponent(
    styledDiffReading({
      path,
      printed: greetDiff(path).printed,
      text: greetText,
    }),
  );
  const diff = mountedReviewDiff();
  const lines = [
    { kind: "unchanged", line: diff.newLine(28), comment: diff.newLine(27) },
    { kind: "added", line: diff.newLine(29), comment: diff.newLine(29) },
    {
      kind: "removed",
      line: diff.removedLine(29),
      comment: diff.removedLine(29),
    },
  ];
  const tokens = lines.flatMap(({ kind, line, comment }) => [
    { role: `${kind} keyword`, token: line.token(/^const$/) },
    { role: `${kind} string`, token: line.token(/hello|later|bye/) },
    { role: `${kind} comment`, token: comment.token(/old|new|and close here/) },
  ]);
  for (const { token } of tokens) await expect.element(token).toBeVisible();
  for (const { role, token } of tokens)
    expect(
      tokenContrast(token),
      `dark ${role} contrast`,
    ).toBeGreaterThanOrEqual(4.5);

  const keyword = diff.newLine(28).token(/^const$/);
  const darkKeywordColour = tokenAppearance(keyword).color;
  await setColorScheme("light");
  for (const { role, token } of tokens)
    expect(
      tokenContrast(token),
      `light ${role} contrast`,
    ).toBeGreaterThanOrEqual(4.5);
  expect(tokenAppearance(keyword).color).not.toBe(darkKeywordColour);
});
