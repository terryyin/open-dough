import { test, expect } from "../support/pageTest.ts";
import { terminalDictationText } from "../../src/terminalDictation.ts";

test("transcripts preserve words and punctuation while excluding terminal commands and line endings", () => {
  expect(
    terminalDictationText(
      "  Review the header\r\nthen the controls\rplease\nnow\u2028yes\u2029done!  ",
    ),
  ).toBe("Review the header then the controls please now yes done!");
  expect(
    terminalDictationText(
      "a\u0000\u0003\t\u0008\u001a\u007f\u0085b\u001b[31mc\u001b]0;title\u0007d\u009b2Je",
    ),
  ).toBe("abcde");
  expect(terminalDictationText("\u0003\r\n\u001b[2J")).toBe("");
  const long = "word ".repeat(1000).trim();
  expect(terminalDictationText(long)).toBe(long);
});
