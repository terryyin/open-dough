// The PageFrame's open Sessions sidebar shows each typed host figure even
// while its machine listing is unread, and reads new status when reopened.
import { expect, onTestFinished, test } from "vitest";
import { page, userEvent } from "vitest/browser";
import { makeMe } from "../../../Distribution/tests/support/pageMakeMe.mjs";
import { readHostStatus, type HostStatus } from "../../src/hostStatus.ts";
import { mountOpenSessions, observe } from "./sessions-sidebar-open-mount.ts";

const sidebar = page.getByRole("complementary", { name: "Sessions sidebar" });
const sessions = page.getByRole("button", { name: "Sessions", exact: true });

function figures() {
  return sidebar.element().querySelectorAll(".sessions-sidebar-status-figure");
}

async function expectFigure(shown: string, words: string) {
  const figure = sidebar.getByRole("img", { name: words, exact: true });
  await expect.element(figure).toBeVisible();
  const rendered = figure.element();
  expect(rendered.textContent).toBe(shown);
  expect(rendered.getAttribute("title")).toBe(words);
  expect(rendered.querySelector("svg")).not.toBeNull();
  expect(rendered.querySelectorAll("button, a")).toHaveLength(0);
}

async function expectWaitingCounts() {
  await expectFigure("0", "0 active sessions");
  await expectFigure("1", "1 session needs attention");
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

async function showWaitingSession(host: HostStatus) {
  await mountOpenSessions(waitingSession(), () => Promise.resolve(host));
}

test("an unread free-disk figure says unavailable while CPU and the counts still show", async () => {
  await showWaitingSession(hostStatus({ cpuPercent: 24, freeBytes: null }));
  await expectFigure("24%", "CPU 24%");
  await expectFigure("—", "Free disk unavailable");
  await expectWaitingCounts();
});

test("newer host samples replace both host figures", async () => {
  let sample = hostStatus({ cpuPercent: 24, freeBytes: null });
  await mountOpenSessions(waitingSession(), () => Promise.resolve(sample));
  await expectFigure("24%", "CPU 24%");
  await expectFigure("—", "Free disk unavailable");

  await userEvent.click(sessions);
  await expect.element(sessions).toHaveAttribute("aria-expanded", "false");
  sample = hostStatus({ cpuPercent: 61.4, freeBytes: 1_234_000_000_000 });
  await userEvent.click(sessions);

  await expectFigure("61%", "CPU 61%");
  await expectFigure("1.2 TB", "1.2 TB free");
  await expect
    .element(sidebar.getByRole("img", { name: "CPU 24%", exact: true }))
    .not.toBeInTheDocument();
  await expect
    .element(
      sidebar.getByRole("img", { name: "Free disk unavailable", exact: true }),
    )
    .not.toBeInTheDocument();
});

test("an unread CPU figure says unavailable while free disk still shows", async () => {
  await showWaitingSession(
    hostStatus({ cpuPercent: null, freeBytes: 110_000_000_000 }),
  );
  await expectFigure("—", "CPU unavailable");
  await expectFigure("110 GB", "110 GB free");
  await expectWaitingCounts();
});

test("both unread host figures say unavailable while session counts remain", async () => {
  await showWaitingSession(hostStatus({ cpuPercent: null, freeBytes: null }));
  await expectFigure("—", "CPU unavailable");
  await expectFigure("—", "Free disk unavailable");
  await expectWaitingCounts();
});

test("with the machine's sessions unread, the host figures still show; sessions can join later", async () => {
  const host = hostStatus({ cpuPercent: 37, freeBytes: 52_000_000_000 });
  const mounted = await mountOpenSessions(undefined, () =>
    Promise.resolve(host),
  );
  await expectFigure("37%", "CPU 37%");
  await expectFigure("52 GB", "52 GB free");
  expect(figures()).toHaveLength(2);

  mounted.supplySessions(waitingSession());
  await expectWaitingCounts();
  await expectFigure("37%", "CPU 37%");
  await expectFigure("52 GB", "52 GB free");
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
