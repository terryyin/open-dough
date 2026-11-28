// The waits a journey's first card checks rest on, over the read states a
// page notes (../../test-support/pageRequestNotes.ts and
// ../../test-support/pageRequestNoting.ts): the page scripts run in this
// process, on a window whose reads the case answers itself. The comparison
// after a terminal read failure runs synchronously over the shown titles.

import { afterEach, expect, test, vi } from "vitest";
import { authenticatedReadEndpoint } from "../../src/authenticatedReadRules.ts";
import { projectListEndpoint } from "../../src/projectConfiguration.ts";
import { heldPathsReached } from "../../test-support/heldReadsReached.ts";
import {
  untilPageReadsAnswered,
  untilPublishedWorkRead,
} from "../../test-support/pageRequestNotes.ts";
import {
  expectMembershipAfterReadFailure,
  noteRequestsInOpenPage,
  type PageScripts,
} from "../../test-support/pageRequestNoting.ts";
import { parseRequest } from "../../test-support/support/ghRequest.ts";

// A page whose scripts run here, on a window that has shown its first
// content and whose every read stays unanswered until the case settles it.
function openedPage() {
  const held = new Map<
    string,
    { resolve: (answer: Response) => void; reject: (error: Error) => void }
  >();
  vi.stubGlobal("window", {
    location: { href: "http://127.0.0.1/" },
    fetch: (input: string) => {
      return new Promise<Response>((resolve, reject) => {
        held.set(input, { resolve, reject });
      });
    },
  });
  vi.stubGlobal("document", {
    getElementById: () => ({ hasChildNodes: () => true }),
  });
  const page: PageScripts = {
    evaluate: (script: (arg: unknown) => unknown, arg?: unknown) =>
      Promise.resolve(script(arg)),
  };
  const read = (address: string) => {
    void (window.fetch as (input: string) => Promise<Response>)(address);
    const answer = held.get(address);
    if (answer === undefined) throw new Error(`${address} was not sent`);
    return {
      answer: () => {
        answer.resolve(new Response("{}"));
      },
      fail: () => {
        answer.reject(new Error("read failed"));
      },
    };
  };
  return { page, read };
}

const publishedWork = `${authenticatedReadEndpoint}?source=main`;
const preparation = `${authenticatedReadEndpoint}?source=main&path=.planning/seeds/SEED-021-progress.md`;

// A wait under observation: whether it has returned once the page's message
// turns and this process's timers have run, which finish a wait with nothing
// to wait for.
async function pendingAfterTurns(
  wait: (page: PageScripts) => Promise<void>,
  page: PageScripts,
) {
  const state = { returned: false };
  const done = wait(page).then(() => {
    state.returned = true;
  });
  await new Promise((turned) => setTimeout(turned, 5));
  return { returned: state.returned, done };
}

afterEach(() => {
  vi.unstubAllGlobals();
});

test.each([
  { outcome: "answers", settle: "answer" },
  { outcome: "fails for good", settle: "fail" },
] as const)(
  "the first-open wait holds a slower published-work read until it $outcome",
  async ({ settle }) => {
    const { page, read } = openedPage();
    await noteRequestsInOpenPage(page);
    read(projectListEndpoint).answer();
    const work = read(publishedWork);

    const wait = await pendingAfterTurns(untilPublishedWorkRead, page);
    expect(wait.returned).toBe(false);

    work[settle]();
    await wait.done;
  },
);

test("a membership check after a terminal read failure throws immediately and names both missing titles", () => {
  const shown = { taken: [], backlog: [] };
  const expected = { taken: ["A taken story"], backlog: ["A queued story"] };

  expect(() => {
    expectMembershipAfterReadFailure(shown, expected);
  }).toThrow(/(?=.*A taken story)(?=.*A queued story)/s);
});

test("a held detail read holds the settled page's read wait but not the first-open wait", async () => {
  const { page, read } = openedPage();
  await noteRequestsInOpenPage(page);
  read(publishedWork).answer();
  const detail = read(preparation);

  await untilPublishedWorkRead(page);
  const settled = await pendingAfterTurns(untilPageReadsAnswered, page);
  expect(settled.returned).toBe(false);

  detail.answer();
  await settled.done;
});

test("a held group has reached its raw handlers only after every listed profile arrives", () => {
  const held = {
    repository: "terryyin/open-dough",
    revision: "a".repeat(40),
    paths: [".agents/profiles/owner.md", ".agents/profiles/preparer.md"],
  };
  const rawRead = (path: string) => {
    const argv = [
      "api",
      "--include",
      "-H",
      "Accept: application/vnd.github.raw",
      `repos/${held.repository}/contents/${path}?ref=${held.revision}`,
    ];
    return { argv, request: parseRequest(argv) };
  };
  const onlyOwner = [rawRead(".agents/profiles/owner.md")];

  expect(heldPathsReached(onlyOwner, held)).toEqual([
    ".agents/profiles/owner.md",
  ]);
  expect(
    heldPathsReached(
      [...onlyOwner, rawRead(".agents/profiles/preparer.md")],
      held,
    ),
  ).toEqual(held.paths);
});
