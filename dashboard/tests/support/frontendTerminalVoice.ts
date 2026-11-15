// One or two working sessions for frontend terminal dictation and prompts,
// with an attached-terminal substitute and optional transcription answers.

import type { Locator, Page } from "@playwright/test";
import { expect } from "@playwright/test";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { openFrontendTakenBacklog } from "./frontendApp.ts";
import {
  putFrontendMachine,
  type FrontendServiceState,
} from "./frontendServiceState.ts";
import { installAttachedTerminalSubstitute } from "./frontendServiceSubstitutes.ts";
import {
  installFrontendTranscription,
  type FrontendTranscription,
} from "./frontendTranscriptionSubstitutes.ts";
import {
  directedApplication,
  echoingApplication,
  type TerminalApplication,
} from "./terminalSubstituteApplication.ts";
import { sessionsSidebarParts } from "../sessionsSidebarPage.ts";
import { expectTerminalText, terminalPanel } from "../terminalScreenPage.ts";
import type { LaunchRecord } from "../../src/agentLaunch.ts";

type Substitute = Parameters<typeof installAttachedTerminalSubstitute>[1];

function voiceRecord(title: string, shortId: string): LaunchRecord {
  return makeMe.aLaunchRecord
    .adHoc({ instruction: "voice", title })
    .inClaudeSession({
      sessionId: `${shortId}-session`,
      shortId,
    })
    .please();
}

async function openEntry(
  page: Page,
  title: string,
  press: (control: Locator) => Promise<void>,
) {
  const sidebar = sessionsSidebarParts(page);
  await press(sidebar.button);
  await expect(sidebar.sidebar).toBeVisible();
  await press(sidebar.entry(title));
  const panel = terminalPanel(page);
  await expect(panel).toBeVisible();
  await expectTerminalText(panel, "Claude Code");
  return panel;
}

// Opens Voice session A (and B when `twoSessions`), with transcription ready
// and an attached terminal. `open(title)` switches the sidebar entry.
export async function openFrontendTerminalVoice(
  page: Page,
  frontendServices: FrontendServiceState,
  options: {
    readonly application?: TerminalApplication;
    readonly substitute?: Substitute;
    readonly twoSessions?: boolean;
    readonly press?: (control: Locator) => Promise<void>;
    readonly withTranscription?: boolean;
  } = {},
): Promise<{
  readonly panel: ReturnType<typeof terminalPanel>;
  readonly sent: string[];
  readonly sizes: { readonly cols: number; readonly rows: number }[];
  readonly open: (title?: string) => Promise<void>;
  readonly transcription: FrontendTranscription | undefined;
  readonly program: ReturnType<typeof directedApplication> | undefined;
}> {
  const first = voiceRecord("Voice session A", "voicea01");
  const second = voiceRecord("Voice session B", "voiceb01");
  const records = options.twoSessions !== false ? [first, second] : [first];
  putFrontendMachine(
    frontendServices,
    makeMe.aMachineAnswer
      .observing(
        ...records.map((record) =>
          makeMe.anObservedLaunch
            .of(record)
            .withSessionState(makeMe.aSessionState.loaded("working").please())
            .please(),
        ),
      )
      .please(),
  );
  const program =
    options.application === undefined
      ? directedApplication("attached voicea01\r\nClaude Code\r\n")
      : undefined;
  const application =
    options.application ?? program?.application ?? echoingApplication("");
  const traffic = await installAttachedTerminalSubstitute(page, {
    application,
    ...options.substitute,
  });
  const transcription =
    options.withTranscription === false
      ? undefined
      : await installFrontendTranscription(page, frontendServices);
  const press = options.press ?? ((control) => control.click());
  await openFrontendTakenBacklog(page);
  const panel = await openEntry(page, "Voice session A", press);
  return {
    panel,
    ...traffic,
    transcription,
    program,
    open: async (title = "Voice session A") => {
      await openEntry(page, title, press);
    },
  };
}
