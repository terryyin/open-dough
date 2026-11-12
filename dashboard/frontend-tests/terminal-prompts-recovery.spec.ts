// Explicit terminal transport substitutes exercise attachment acceptance before
// readiness: a held opening and an open socket with a carried refusal.
import {
  expect,
  openFrontendTakenBacklog,
  test,
} from "../tests/support/frontendApp.ts";
import { putFrontendMachine } from "../tests/support/frontendServiceState.ts";
import { installAttachedTerminalSubstitute } from "../tests/support/frontendServiceSubstitutes.ts";
import { sessionsSidebarParts } from "../tests/sessionsSidebarPage.ts";
import { agentTerminalEndpoint } from "../src/agentTerminal.ts";
import { makeMe } from "../../tests/support/makeMe.mjs";
import {
  chooseTerminalPrompt,
  expectTerminalInputFocused,
  expectTerminalText,
  reconnectTerminal,
  terminalPanel,
  terminalStatus,
} from "../tests/terminalScreenPage.ts";

for (const unavailable of ["connecting", "refused"] as const) {
  test(`${unavailable} input refuses presets, names recovery and requires a new choice`, async ({
    page,
    frontendServices,
  }) => {
    const title = `${unavailable} prompt input`;
    putFrontendMachine(
      frontendServices,
      makeMe.aMachineAnswer
        .observing(
          makeMe.anObservedLaunch
            .of(
              makeMe.aLaunchRecord
                .executing({ identity: "SEED-901#prompt-input", title })
                .onStoryBranch({
                  workspace: "/work/prompt-input",
                  branch: "codex/prompt-input",
                })
                .inClaudeSession({ sessionId: "prompt-1", shortId: "prompt1" })
                .please(),
            )
            .withSessionState(makeMe.aSessionState.loaded("working").please())
            .please(),
        )
        .please(),
    );
    let open = () => {};
    const opens = new Promise<void>((resolve) => {
      open = resolve;
    });
    let sent: string[];
    if (unavailable === "connecting") {
      ({ sent } = await installAttachedTerminalSubstitute(page, { opens }));
    } else {
      sent = [];
      let attachments = 0;
      await page.routeWebSocket(`**${agentTerminalEndpoint}**`, (socket) => {
        socket.onMessage((message) => {
          if (typeof message !== "string") return;
          const { input } = JSON.parse(message) as { input?: string };
          if (input !== undefined) {
            sent.push(input);
            socket.send(input);
          }
        });
        if (++attachments === 1) {
          socket.send(
            Buffer.from(
              JSON.stringify({
                attachRefusal: {
                  explanation: "The session refused this attachment.",
                },
              }),
            ),
          );
        } else {
          socket.send(Buffer.from(JSON.stringify({ readiness: "attached" })));
          socket.send("Claude Code\r\n");
        }
      });
    }
    await openFrontendTakenBacklog(page);
    const sidebar = sessionsSidebarParts(page);
    await sidebar.button.click();
    await sidebar.entry(title).click();
    const panel = terminalPanel(page);
    const status = terminalStatus(panel);
    if (unavailable === "refused")
      await expect(status).toContainText(
        "The session refused this attachment.",
      );
    await chooseTerminalPrompt(panel, "OK");
    await expect(status).toContainText(
      unavailable === "connecting"
        ? "The terminal is still connecting. Open Prompts again once it connects."
        : "Choose Reconnect, then open Prompts again.",
    );
    expect(sent).toEqual([]);
    if (unavailable === "connecting") open();
    else await reconnectTerminal(panel);
    await expectTerminalText(panel, "Claude Code");
    await chooseTerminalPrompt(panel, "as recommended");
    await expect.poll(() => sent).toEqual(["as recommended"]);
    await expect(status).toBeEmpty();
    await expectTerminalInputFocused(panel);
  });
}
