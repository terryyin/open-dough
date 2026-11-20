// Session and host title figures from typed inputs: unread disk or CPU, new
// samples, unread sessions, and a failed host read converted to unavailable.
import { createElement, type ReactElement } from "react";
import { expect, onTestFinished, test } from "vitest";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import {
  cpuShown,
  freeDiskShown,
  readHostStatus,
  type HostStatus,
} from "../../src/hostStatus.ts";
import {
  activeSessionsWords,
  attentionWords,
} from "../../src/sessionCounts.ts";
import { SessionsSidebarStatus } from "../../src/SessionsSidebarStatus.tsx";
import type { LaunchWithState } from "../../src/agentLaunch.ts";
import { mountComponent } from "../../test-support/component-mount/mountComponent.ts";
import { observe } from "./sessions-sidebar-open-mount.ts";

function statusReading(options: {
  readonly sessions: readonly LaunchWithState[] | undefined;
  readonly host: HostStatus | undefined;
}): ReactElement {
  return createElement(SessionsSidebarStatus, options);
}

function figures() {
  return [
    ...document.querySelectorAll<HTMLElement>(
      ".sessions-sidebar-status-figure",
    ),
  ];
}

function figureNamed(words: string) {
  return figures().find(
    (figure) => figure.getAttribute("aria-label") === words,
  );
}

function expectFigure(shown: string | number, words: string) {
  const figure = figureNamed(words);
  expect(figure, `figure ${words}`).toBeDefined();
  expect(figure?.getAttribute("title")).toBe(words);
  expect(figure?.textContent).toBe(String(shown));
  expect(figure?.querySelector("svg")).not.toBeNull();
  expect(figure?.querySelectorAll("button, a")).toHaveLength(0);
}

function expectHostFigure(host: HostStatus) {
  const cpu = cpuShown(host.cpuPercent);
  const disk = freeDiskShown(host.freeBytes);
  expectFigure(cpu.shown, cpu.words);
  expectFigure(disk.shown, disk.words);
}

function expectSessionFigures(active: number, waiting: number) {
  expectFigure(active, activeSessionsWords(active));
  expectFigure(waiting, attentionWords(waiting));
}

function waitingSession() {
  return observe([
    {
      record: makeMe.aLaunchRecord
        .adHoc({ instruction: "Status story", title: "Status story" })
        .inClaudeSession({
          sessionId: "status-session-7",
          shortId: "status7",
        })
        .please(),
      state: makeMe.aSessionState.loaded("waiting").please(),
    },
  ]);
}

function hostStatus(fields: {
  readonly cpuPercent: number | null;
  readonly freeBytes: number | null;
}): HostStatus {
  return makeMe.aHostStatus.with(fields).please();
}

test("an unread free-disk figure says unavailable while CPU and the counts still show", async () => {
  const sessions = waitingSession();
  const host = hostStatus({ cpuPercent: 24, freeBytes: null });
  await mountComponent(statusReading({ sessions, host }));
  await expect.poll(() => figures().length).toBe(4);
  expectHostFigure(host);
  expectSessionFigures(0, 1);
});

test("newer host samples replace both host figures", async () => {
  const sessions = waitingSession();
  const mounted = await mountComponent(
    statusReading({
      sessions,
      host: hostStatus({ cpuPercent: 24, freeBytes: null }),
    }),
  );
  await expect.poll(() => figures().length).toBe(4);
  const host = hostStatus({
    cpuPercent: 61.4,
    freeBytes: 1_234_000_000_000,
  });
  mounted.rerender(statusReading({ sessions, host }));
  const cpu = cpuShown(host.cpuPercent);
  await expect.poll(() => figureNamed(cpu.words) !== undefined).toBe(true);
  expectHostFigure(host);
});

test("an unread CPU figure says unavailable while free disk still shows", async () => {
  const sessions = waitingSession();
  const host = hostStatus({
    cpuPercent: null,
    freeBytes: 110_000_000_000,
  });
  await mountComponent(statusReading({ sessions, host }));
  await expect.poll(() => figures().length).toBe(4);
  expectHostFigure(host);
  expectSessionFigures(0, 1);
});

test("both unread host figures say unavailable while session counts remain", async () => {
  const sessions = waitingSession();
  const host = hostStatus({ cpuPercent: null, freeBytes: null });
  await mountComponent(statusReading({ sessions, host }));
  await expect.poll(() => figures().length).toBe(4);
  expectHostFigure(host);
  expectSessionFigures(0, 1);
});

test("with the machine's sessions unread, the host figures still show; sessions can join later", async () => {
  const host = hostStatus({
    cpuPercent: 37,
    freeBytes: 52_000_000_000,
  });
  const mounted = await mountComponent(
    statusReading({ sessions: undefined, host }),
  );
  await expect.poll(() => figures().length).toBe(2);
  expectHostFigure(host);
  expect(figureNamed(activeSessionsWords(0))).toBeUndefined();
  expect(figureNamed(attentionWords(0))).toBeUndefined();

  mounted.rerender(statusReading({ sessions: waitingSession(), host }));
  await expect.poll(() => figures().length).toBe(4);
  expectSessionFigures(0, 1);
  expectHostFigure(host);
});

test("a failed host response answers both figures unread", async () => {
  const previous = globalThis.fetch;
  onTestFinished(() => {
    globalThis.fetch = previous;
  });
  globalThis.fetch = () =>
    Promise.resolve(
      new Response(JSON.stringify({ error: "Ask again." }), { status: 503 }),
    );
  await expect(readHostStatus(new AbortController().signal)).resolves.toEqual({
    cpuPercent: null,
    freeBytes: null,
  });
});
