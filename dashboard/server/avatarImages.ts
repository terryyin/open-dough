// GitHub avatar images for the local authenticated read boundary
// (`./authenticatedRead.ts`): which avatar source GitHub named for a matched
// committer account is usable, and the image itself, fetched once per usable
// source and kept in this server process. Only an account the boundary itself
// found matched to a profile's addition commit (`./avatarRead.ts`) is ever
// fetched; the browser never names an image source or reaches GitHub. The kept
// images are disposable display aids, never an assignment or identity
// authority.

// Where GitHub serves account avatars, as its commit answers name them.
const avatarHost = "avatars.githubusercontent.com";

// An account's avatar path as GitHub names one: a user (`/u/<id>`) or an app
// (`/in/<id>`).
const avatarPath = /^\/(?:u|in)\/[0-9]{1,20}$/;
const avatarVersion = /^[0-9]{1,10}$/;

// The image size asked for, in pixels: enough for the small avatar shown
// beside a name on a high-density screen.
const avatarPixels = 64;

// The image types shown; anything else, SVG included, is refused.
const imageTypes = new Set([
  "image/png",
  "image/jpeg",
  "image/gif",
  "image/webp",
]);

// Upper bounds on one avatar read and on what this process keeps.
const avatarByteLimit = 1024 * 1024;
const avatarWaitLimitMs = 10_000;
const keptAvatarLimit = 100;

// GitHub's avatar path and version for an account, when `url` is an https
// avatar address on GitHub's avatar host and nothing else: no credentials,
// port, fragment, other host, or query beyond a version. Anything else is a
// rejected image source.
export function usableAvatarSource(url: unknown): string | null {
  if (typeof url !== "string") {
    return null;
  }
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }
  const params = [...parsed.searchParams.keys()];
  const version = parsed.searchParams.get("v");
  const usable =
    parsed.protocol === "https:" &&
    parsed.hostname === avatarHost &&
    parsed.port === "" &&
    parsed.username === "" &&
    parsed.password === "" &&
    parsed.hash === "" &&
    avatarPath.test(parsed.pathname) &&
    params.every((key) => key === "v") &&
    params.length <= 1 &&
    (version === null || avatarVersion.test(version));
  if (!usable) {
    return null;
  }
  return version === null ? parsed.pathname : `${parsed.pathname}?v=${version}`;
}

// Where avatars are fetched from: GitHub's avatar host, unless the launching
// environment names another origin. Only the test harness does, pointing it
// at its fake GitHub; no request can.
function avatarOrigin(): string {
  return process.env["DOUGH_AVATAR_ORIGIN"] ?? `https://${avatarHost}`;
}

export type AvatarImage = {
  readonly contentType: string;
  readonly bytes: Buffer;
};

// An avatar that could not be fetched, or was not a bounded image.
class AvatarUnavailable extends Error {}

async function boundedBytes(response: Response): Promise<Buffer> {
  const declared = Number(response.headers.get("content-length"));
  if (Number.isFinite(declared) && declared > avatarByteLimit) {
    throw new AvatarUnavailable("too large");
  }
  const reader = response.body?.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  for (;;) {
    const chunk = await reader?.read();
    if (chunk === undefined || chunk.done) {
      break;
    }
    size += chunk.value.byteLength;
    if (size > avatarByteLimit) {
      await reader?.cancel();
      throw new AvatarUnavailable("too large");
    }
    chunks.push(chunk.value);
  }
  return Buffer.concat(chunks);
}

async function fetchAvatar(
  source: string,
  signal: AbortSignal,
): Promise<AvatarImage> {
  const separator = source.includes("?") ? "&" : "?";
  const response = await fetch(
    `${avatarOrigin()}${source}${separator}s=${String(avatarPixels)}`,
    { signal, redirect: "error" },
  );
  const contentType = (response.headers.get("content-type") ?? "")
    .split(";")[0]
    ?.trim()
    .toLowerCase();
  if (
    !response.ok ||
    contentType === undefined ||
    !imageTypes.has(contentType)
  ) {
    await response.body?.cancel();
    throw new AvatarUnavailable("not an image");
  }
  return { contentType, bytes: await boundedBytes(response) };
}

// Each usable avatar source's image, fetched at most once while this process
// keeps it: concurrent displays of one source share the same fetch. Kept by
// source rather than login, so a changed avatar version, or a login reused by
// another account, is fetched afresh instead of showing an earlier image. A
// failed fetch is not kept, so a later display may ask again.
export class AvatarImages {
  private readonly kept = new Map<string, Promise<AvatarImage>>();

  // `source` is a usable avatar source (`usableAvatarSource`); `tracked` lets
  // closing the boundary abort a fetch still in flight.
  image(source: string, tracked: Set<AbortController>): Promise<AvatarImage> {
    const known = this.kept.get(source);
    if (known !== undefined) {
      return known;
    }
    const controller = new AbortController();
    tracked.add(controller);
    const timer = setTimeout(() => {
      controller.abort();
    }, avatarWaitLimitMs);
    const fetched = fetchAvatar(source, controller.signal).finally(() => {
      clearTimeout(timer);
      tracked.delete(controller);
    });
    this.kept.set(source, fetched);
    fetched.catch(() => {
      if (this.kept.get(source) === fetched) {
        this.kept.delete(source);
      }
    });
    while (this.kept.size > keptAvatarLimit) {
      const oldest = this.kept.keys().next().value;
      if (oldest === undefined) {
        break;
      }
      this.kept.delete(oldest);
    }
    return fetched;
  }
}
