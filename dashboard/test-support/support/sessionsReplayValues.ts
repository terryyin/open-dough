// The Sessions replay's deterministic values (./sessionsReplayRecords.ts):
// each derives from its seed string alone, so every run makes the same ones.

import { createHash } from "node:crypto";

const digest = (seed: string) =>
  createHash("sha256").update(seed).digest("hex");
export const indices = (count: number) => [...Array(count).keys()];
export const uuidOf = (seed: string) => {
  const hex = digest(seed);
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-4${hex.slice(13, 16)}-8${hex.slice(17, 20)}-${hex.slice(20, 32)}`;
};
export const commitOf = (seed: string) => digest(seed).slice(0, 40);
// Deterministic prose of `length` characters.
export const prose = (seed: string, length: number) => {
  const words = digest(seed).match(/.{1,6}/g) ?? [];
  let text = "";
  for (let at = 0; text.length < length; at += 1)
    text += `${words[at % words.length] ?? "x"} `;
  return text.slice(0, length);
};
