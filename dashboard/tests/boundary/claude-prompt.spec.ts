import { expect, test } from "../support/pageTest.ts";
import { claudePromptReady } from "../../server/hosts/claude/prompt.ts";
import { KeptClientScreen } from "../../server/keptClientScreen.ts";

test("the native composer needs a visible cursor and borders, not an attach banner or transcript prompt", async () => {
  const screen = new KeptClientScreen(80, 24);
  try {
    screen.write("\u001b[?25l\r\n  Attaching…\r\n");
    await screen.settled();
    expect(claudePromptReady(screen.text(), screen.cursorVisible())).toBe(
      false,
    );
    screen.write("❯ Earlier transcript input\r\n⏺ READY\r\n\u001b[?25h");
    await screen.settled();
    expect(claudePromptReady(screen.text(), screen.cursorVisible())).toBe(
      false,
    );
    screen.write(
      "──────────────────── Native session ─\r\n❯\u00a0draft input\r\n──────────────────────────────────\r\n  ← for agents\r\n",
    );
    await screen.settled();
    // The observed first ready native screen had no completed frame either.
    expect(screen.completedFrame()).toBe(false);
    expect(claudePromptReady(screen.text(), screen.cursorVisible())).toBe(true);
    screen.write("\u001b[?25l");
    await screen.settled();
    expect(claudePromptReady(screen.text(), screen.cursorVisible())).toBe(
      false,
    );
  } finally {
    screen.dispose();
  }
});

test("a composer whose top border starts with the session name is ready", async () => {
  const screen = new KeptClientScreen(80, 24);
  try {
    // Observed from an idle dashboard-launched session in an 80×24 attach.
    const rows = [
      "✻ Cogitated for 13m 46s · done 11:10 AM",
      "                                      ✘ Auto-update failed · Run claude doctor",
      " Open Dough · Refinement · Collapse redundant dashboard touch viewport matric… ─",
      "❯ ",
      "─".repeat(80),
      "  ⏵⏵ auto mode on (shift+tab to cycle) · ← 3 agents",
    ];
    screen.write(`${rows.join("\r\n")}\u001b[?25h`);
    await screen.settled();
    expect(claudePromptReady(screen.text(), screen.cursorVisible())).toBe(true);
  } finally {
    screen.dispose();
  }
});
