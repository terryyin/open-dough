// The page's shared reads of fixed answers (../src/sharedRead.ts,
// ../src/repositoryFileReads.ts, ../src/answerMemo.ts): two readers of
// one file or answer at once ask once; a reader leaving stops only its own
// wait, and the read ends once nobody waits; a failed read, or an answer its
// reader does not call fixed, is asked again; kept answers stay within their
// byte budget, least recently used first out. The fetch substitute stands in
// for the local authenticated read boundary.
import { expect, test } from "../tests/support/pageTest.ts";
import {
  answerMemoBudgetBytes,
  forgetAnswers,
  memoizedAnswer,
  retainedAnswerBytes,
} from "../src/answerMemo.ts";
import { readIntentLocationsAt } from "../src/authenticatedIntentRead.ts";
import { forgetCachedFiles } from "../src/fileContentCache.ts";
import type { PublishedSource } from "../src/publishedSource.ts";
import { readCachedFile } from "../src/repositoryFileReads.ts";

const source: PublishedSource = {
  id: "shared-reads",
  label: "Shared reads",
  repository: "owner/shared-reads",
  ref: "main",
  backlogPath: ".planning/PRODUCT-BACKLOG.md",
};
const revision = "a1".repeat(20);
const path = "docs/seed.md";
const readFile = (file = path, signal = new AbortController().signal) =>
  readCachedFile(source, revision, file, signal);

type Asked = { readonly url: string; readonly signal: AbortSignal };

// Each request the page sends, answered when `answer` says, by default with
// the file's text at once.
function substituteFetch(
  answer: (asked: Asked) => Promise<Response> = () =>
    Promise.resolve(Response.json({ revision, path, text: "seed" })),
) {
  const asked: Asked[] = [];
  globalThis.fetch = (input, init) => {
    const each = {
      url:
        typeof input === "string"
          ? input
          : input instanceof URL
            ? input.href
            : input.url,
      signal: init?.signal ?? new AbortController().signal,
    };
    asked.push(each);
    return answer(each);
  };
  return asked;
}

// A response withheld until released.
function held() {
  let release: (response: Response) => void = () => undefined;
  const response = new Promise<Response>((resolve) => {
    release = resolve;
  });
  return { response, release };
}

const savedFetch = globalThis.fetch;
test.describe.configure({ mode: "serial" });
test.beforeEach(() => {
  forgetCachedFiles();
  forgetAnswers();
});
test.afterEach(() => {
  globalThis.fetch = savedFetch;
});

test("two readers of one file at once ask once, and a later reader asks nothing", async () => {
  const answer = held();
  const asked = substituteFetch(() => answer.response);
  const first = readFile();
  const second = readFile();
  expect(asked).toHaveLength(1);
  answer.release(Response.json({ revision, path, text: "seed" }));
  expect(await Promise.all([first, second])).toEqual(["seed", "seed"]);
  expect(await readFile()).toBe("seed");
  expect(asked).toHaveLength(1);
});

test("a failed file read is not kept and is asked again", async () => {
  let failing = true;
  const asked = substituteFetch(() =>
    Promise.resolve(
      failing
        ? Response.json({ error: "Not reachable." }, { status: 502 })
        : Response.json({ revision, path, text: "seed" }),
    ),
  );
  await expect(readFile()).rejects.toThrow("Not reachable.");
  failing = false;
  expect(await readFile()).toBe("seed");
  expect(asked).toHaveLength(2);
});

test("a departing reader stops waiting while the shared read continues, which ends once nobody waits", async () => {
  const answer = held();
  const asked = substituteFetch(() => answer.response);
  const leaving = new AbortController();
  const departed = readFile(path, leaving.signal);
  const staying = readFile();
  leaving.abort();
  await expect(departed).rejects.toMatchObject({ name: "AbortError" });
  await Promise.resolve();
  expect(asked[0]?.signal.aborted).toBe(false);
  answer.release(Response.json({ revision, path, text: "seed" }));
  expect(await staying).toBe("seed");
  expect(asked).toHaveLength(1);

  const other = "docs/other.md";
  const unanswered = held();
  const abandoned = substituteFetch(() => unanswered.response);
  const alone = new AbortController();
  const read = readFile(other, alone.signal);
  alone.abort();
  await expect(read).rejects.toMatchObject({ name: "AbortError" });
  await Promise.resolve();
  expect(abandoned).toHaveLength(1);
  expect(abandoned[0]?.signal.aborted).toBe(true);
  const reasked = substituteFetch(() =>
    Promise.resolve(Response.json({ revision, path: other, text: "other" })),
  );
  expect(await readFile(other)).toBe("other");
  expect(reasked).toHaveLength(1);
});

test("a reader leaving and another arriving in the same turn keep one read", async () => {
  const answer = held();
  const asked = substituteFetch(() => answer.response);
  const remounted = new AbortController();
  void readFile(path, remounted.signal).catch(() => undefined);
  remounted.abort();
  const again = readFile();
  await Promise.resolve();
  answer.release(Response.json({ revision, path, text: "seed" }));
  expect(await again).toBe("seed");
  expect(asked).toHaveLength(1);
  expect(asked[0]?.signal.aborted).toBe(false);
});

test("an answer is kept only when its reader calls it fixed; a failure is asked again", async () => {
  let asks = 0;
  const ask = (answer: string) => () => {
    asks += 1;
    return Promise.resolve(answer);
  };
  const isFixed = (answer: string) => answer === "fixed";
  const signal = new AbortController().signal;
  expect(await memoizedAnswer("moving", ask("moving"), signal, isFixed)).toBe(
    "moving",
  );
  expect(await memoizedAnswer("moving", ask("moving"), signal, isFixed)).toBe(
    "moving",
  );
  expect(asks).toBe(2);
  await expect(
    memoizedAnswer(
      "refused",
      () => {
        asks += 1;
        return Promise.reject(new Error("refused"));
      },
      signal,
      isFixed,
    ),
  ).rejects.toThrow("refused");
  expect(await memoizedAnswer("refused", ask("fixed"), signal, isFixed)).toBe(
    "fixed",
  );
  expect(await memoizedAnswer("refused", ask("fixed"), signal, isFixed)).toBe(
    "fixed",
  );
  expect(asks).toBe(4);
});

test("kept answers stay within the budget, the least recently used out first", async () => {
  const chunk = "X".repeat(64 * 1024);
  const signal = new AbortController().signal;
  const asked: string[] = [];
  const keep = (key: string) =>
    memoizedAnswer(
      key,
      () => {
        asked.push(key);
        return Promise.resolve(chunk);
      },
      signal,
      () => true,
    );
  await keep("first");
  await keep("recent");
  const entries = Math.floor(answerMemoBudgetBytes / chunk.length) + 8;
  for (let i = 0; i < entries; i++) {
    await keep("recent");
    await keep(`pressure-${i}`);
  }
  expect(retainedAnswerBytes()).toBeLessThanOrEqual(answerMemoBudgetBytes);
  await keep("recent");
  await keep("first");
  expect(asked.filter((key) => key === "recent")).toHaveLength(1);
  expect(asked.filter((key) => key === "first")).toHaveLength(2);
});

test("the locations of a revision are asked once, while unreadable settings are asked again", async () => {
  let settings: "configured" | "unreadable" = "unreadable";
  const asked = substituteFetch(() =>
    Promise.resolve(
      Response.json(
        settings === "configured"
          ? { revision, locations: [] }
          : {
              revision,
              locations: null,
              settingsProblem: "unreadable",
              recovery: "transient",
            },
      ),
    ),
  );
  const read = () =>
    readIntentLocationsAt(source, revision, new AbortController().signal);
  expect(await read()).toMatchObject({
    status: "settings-problem",
    problem: "unreadable",
  });
  settings = "configured";
  expect(await read()).toEqual({ status: "configured", locations: [] });
  expect(await read()).toEqual({ status: "configured", locations: [] });
  expect(asked).toHaveLength(2);
});
