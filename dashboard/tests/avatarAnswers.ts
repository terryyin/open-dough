// GitHub's avatar host's answers, as the fake GitHub
// (./support/fakeGitHub.ts) gives them to the dashboard server's avatar
// reads: small PNG images told apart by their width, so a page can show which
// account's avatar it displays, and a failure.

import { crc32, deflateSync } from "node:zlib";
import type { AvatarAnswer, AvatarAnswerer } from "./support/fakeGitHub.ts";
import { holding } from "./support/heldGitHubAnswer.ts";

function chunk(type: string, data: Buffer): Buffer {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const typed = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(typed));
  return Buffer.concat([length, typed, crc]);
}

// A one-pixel-high grey PNG `width` pixels wide.
export function avatarPng(width: number): AvatarAnswer {
  const header = Buffer.alloc(13);
  header.writeUInt32BE(width, 0);
  header.writeUInt32BE(1, 4);
  header.writeUInt8(8, 8); // bit depth
  header.writeUInt8(0, 9); // greyscale
  const row = Buffer.concat([Buffer.from([0]), Buffer.alloc(width, 0x80)]);
  return {
    status: 200,
    contentType: "image/png",
    body: Buffer.concat([
      Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
      chunk("IHDR", header),
      chunk("IDAT", deflateSync(row)),
      chunk("IEND", Buffer.alloc(0)),
    ]),
  };
}

export const avatarServerError: AvatarAnswer = {
  status: 500,
  contentType: "text/plain",
  body: Buffer.from("Internal Server Error"),
};

// Answers each avatar path (its query ignored) from `images`; any other is
// not found.
export function avatarsAt(
  images: Readonly<Record<string, AvatarAnswer>>,
): AvatarAnswerer {
  return (requested) => {
    const path = avatarPathOf(requested);
    return (
      (Object.hasOwn(images, path) ? images[path] : undefined) ?? {
        status: 404,
        contentType: "text/plain",
        body: Buffer.from("Not Found"),
      }
    );
  };
}

// The address GitHub names for the avatar at `path` on its avatar host, at
// avatar `version`.
export function onAvatarHost(path: string, version = 4): string {
  return `https://avatars.githubusercontent.com${path}?v=${String(version)}`;
}

// Only the avatar paths among `reads`, their queries left out.
export function avatarPathsRead(reads: readonly string[]): string[] {
  return reads.map(avatarPathOf);
}

// The avatar path an avatar read asked for, its query ignored.
function avatarPathOf(requested: string): string {
  return requested.split("?")[0] ?? "";
}

// Answers as `answerer` does, except that the image at `path` (its query
// ignored) is answered only once `release` is called.
export function holdingAvatar(
  answerer: AvatarAnswerer,
  path: string,
): { readonly answer: AvatarAnswerer; readonly release: () => void } {
  return holding(answerer, (requested) => avatarPathOf(requested) === path);
}
