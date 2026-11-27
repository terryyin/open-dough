import {
  afterEach,
  beforeEach,
  expect,
  onTestFinished,
  test,
  vi,
} from "vitest";
import { makeMe } from "../../../Distribution/tests/support/makeMe.mjs";
import { AvatarImages } from "../../server/avatarImages.ts";
import { parseAvatarRead, performAvatarAt } from "../../server/avatarRead.ts";
import { runGh } from "../../server/ghRead.ts";
import { PinnedTexts } from "../../server/pinnedTexts.ts";
import { RetainedAnswers } from "../../server/retainedAnswers.ts";
import { RevisionMemo } from "../../server/revisionMemo.ts";
import {
  agents,
  avatarHost,
  laterRevision,
  newerAvatar,
  publishedRevisions,
  revision,
} from "../../test-support/authenticatedAvatarRecords.ts";
import { avatarPng } from "../../test-support/avatarAnswers.ts";
import type { AvatarAnswer } from "../../test-support/support/fakeGitHub.ts";
import { parseRequest } from "../../test-support/support/ghRequest.ts";
import { heldResponse } from "../support/ciReadingTransport.ts";

vi.mock(import("../../server/ghRead.ts"), async (original) => ({
  ...(await original()),
  runGh: vi.fn(),
}));

const source = makeMe.aPublishedSource.openDough.please();
const upstream = vi.mocked(runGh);
const fetchAvatar = vi.fn<typeof fetch>();
const png = avatarPng(4);
const matchedProfileFile = "yui-chan.json";
const avatarOrigin = "https://avatars.githubusercontent.com";
const yuiAvatar = (version: number) =>
  `${avatarOrigin}/u/301?v=${version}&s=64`;
let boundary: Parameters<typeof performAvatarAt>[0];

function imageReply({ status, body, contentType }: AvatarAnswer): Response {
  return new Response(new Uint8Array(body), {
    status,
    headers: { "content-type": contentType },
  });
}

beforeEach(() => {
  boundary = {
    pinned: new PinnedTexts(new RevisionMemo(new RetainedAnswers())),
    avatars: new AvatarImages(),
    tracked: new Set(),
  };
  const origin = publishedRevisions();
  upstream.mockReset().mockImplementation(async (argv) => {
    const request = parseRequest(argv);
    if (request.kind === "unknown" || request.repository !== source.repository)
      throw new Error(`Unexpected avatar provider request ${argv.join(" ")}`);
    const response = await origin({ argv, request });
    if (!("body" in response) || response.status !== 200)
      throw new Error(
        `Unexpected avatar provider response for ${argv.join(" ")}`,
      );
    return response.body;
  });
  fetchAvatar.mockReset().mockImplementation(async (url) => {
    if (typeof url !== "string" || !url.startsWith(avatarOrigin))
      throw new Error("Unexpected avatar host");
    return imageReply(await avatarHost(url.slice(avatarOrigin.length)));
  });
  vi.stubGlobal("fetch", fetchAvatar);
  vi.stubEnv("DOUGH_AVATAR_ORIGIN", avatarOrigin);
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

function profileParams(file: string, at = revision) {
  return new URLSearchParams({
    source: source.id,
    revision: at,
    path: `${agents}/${file}`,
  });
}

function readAvatar(params: URLSearchParams) {
  const read = parseAvatarRead(params);
  if (read.kind === "refused") return Promise.resolve(read);
  return performAvatarAt(boundary, source, read, (lookup) =>
    lookup(new AbortController().signal),
  );
}

const image = (answer: AvatarAnswer) => ({
  kind: "image",
  image: { bytes: answer.body, contentType: answer.contentType },
});

test("keeps the exact image fetched for the matched account", async () => {
  const params = profileParams(matchedProfileFile);
  await expect(readAvatar(params)).resolves.toEqual(image(png));
  upstream.mockClear();
  await expect(readAvatar(params)).resolves.toEqual(image(png));
  expect(upstream).not.toHaveBeenCalled();
  const signal = fetchAvatar.mock.calls[0]?.[1]?.signal;
  expect(signal).toBeInstanceOf(AbortSignal);
  expect(fetchAvatar).toHaveBeenCalledExactlyOnceWith(yuiAvatar(4), {
    signal,
    redirect: "error",
  });
});

test("shares a held image between concurrent readers", async () => {
  const held = heldResponse();
  const entered = vi.spyOn(boundary.avatars, "image");
  const heldPng = avatarPng(6);
  onTestFinished(() => {
    held.release(imageReply(heldPng));
  });
  fetchAvatar.mockReturnValue(held.response);
  const params = profileParams("airi-chan.json");

  const first = readAvatar(params);
  await expect.poll(() => fetchAvatar.mock.calls.length).toBe(1);
  const second = readAvatar(params);
  await expect.poll(() => entered.mock.calls.length).toBe(2);
  expect(fetchAvatar).toHaveBeenCalledTimes(1);
  held.release(imageReply(heldPng));
  await expect(Promise.all([first, second])).resolves.toEqual([
    image(heldPng),
    image(heldPng),
  ]);
});

test("fetches a newer source for the same account and keeps each pin's image", async () => {
  const original = profileParams(matchedProfileFile);
  const newer = profileParams(matchedProfileFile, laterRevision);
  await expect(readAvatar(original)).resolves.toEqual(image(png));
  await expect(readAvatar(newer)).resolves.toEqual(image(newerAvatar));
  await expect(readAvatar(original)).resolves.toEqual(image(png));
  await expect(readAvatar(newer)).resolves.toEqual(image(newerAvatar));
  expect(fetchAvatar.mock.calls.map(([url]) => url)).toEqual([
    yuiAvatar(4),
    yuiAvatar(5),
  ]);
});

test.each([
  {
    file: "akiho-chan.json",
    reason: "an unmatched committer",
    message:
      "No GitHub account is matched to the human who added this agent profile.",
  },
  { file: "yuma-chan.json", reason: "another host", login: "rae" },
  { file: "sola-chan.json", reason: "a non-HTTPS address", login: "hugh" },
  {
    file: "kirara-chan.json",
    reason: "an extra source parameter",
    login: "quinn",
  },
])(
  "refuses $reason without fetching an image",
  async ({ file, login, message }) => {
    await expect(readAvatar(profileParams(file))).resolves.toEqual({
      kind: "refused",
      status: 404,
      message:
        message ??
        `GitHub named no usable avatar for ${login}, the account matched to the human who added this agent profile.`,
    });
    expect(fetchAvatar).not.toHaveBeenCalled();
  },
);

test.each([
  ["a failing response", "mana-chan.json", "fay", 305],
  ["an unsupported image type", "rina-chan.json", "svg", 306],
  ["an oversized body", "nana-chan.json", "big", 307],
  ["a redirect", "maki-chan.json", "moved", 308],
] as const)(
  "reports %s as unavailable and retries the same source",
  async (...[, file, login, id]) => {
    const params = profileParams(file);
    await expect(readAvatar(params)).resolves.toEqual({
      kind: "failed",
      message: `The GitHub avatar of ${login} could not be fetched as a small image.`,
      retryAfterSeconds: undefined,
      recovery: undefined,
    });

    fetchAvatar.mockResolvedValueOnce(imageReply(png));
    await expect(readAvatar(params)).resolves.toEqual(image(png));
    const url = `${avatarOrigin}/u/${id}?v=4&s=64`;
    expect(fetchAvatar.mock.calls.map(([address]) => address)).toEqual([
      url,
      url,
    ]);
  },
);

test.each([
  {
    name: "an image address",
    key: "url",
    value: "https://outside.example/x.png",
  },
  { name: "a login", key: "login", value: "some-account" },
])("refuses a request naming $name at parsing", ({ key, value }) => {
  const params = profileParams(matchedProfileFile);
  params.set(key, value);
  expect(parseAvatarRead(params)).toMatchObject({
    kind: "refused",
    status: 400,
  });
});

test("refuses an unlisted profile before reading its attribution or image", async () => {
  await expect(
    readAvatar(profileParams("honoka-chan.json")),
  ).resolves.toMatchObject({
    kind: "refused",
    status: 404,
  });
  expect(upstream.mock.calls.map(([argv]) => parseRequest(argv))).toEqual([
    {
      kind: "listing",
      repository: source.repository,
      path: agents,
      revision,
    },
  ]);
  expect(fetchAvatar).not.toHaveBeenCalled();
});
