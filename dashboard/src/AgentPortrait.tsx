import type { CSSProperties } from "react";
import { agentNames } from "../../src/skills/dough-product-backlog/scripts/product-backlog-agent-profile.mjs";
import "./agent-portrait.css";

const portraitsPerAtlas = 6;

// The agents whose enlarged portrait plays a short gesture on hover, by
// rotation name: a strip of frames beginning and ending on the approved tile.
const gestureStrips: Readonly<
  Record<string, { file: string; duration: string; blend?: boolean }>
> = {
  Yui: { file: "yui-gesture.webp", duration: "1.5s" },
  Akiho: { file: "akiho-gesture.webp", duration: "1.8s", blend: true },
};

// The approved portrait for a recorded agent, by its rotation name. Portraits
// follow the shared agent rotation, six to an atlas in a three-column, two-row
// grid of taller cells; the square shown is each cell's center. The portrait
// is decorative: the agent name beside it carries the meaning.
export function AgentPortrait({ name }: { name: string }) {
  const index = agentNames.indexOf(name);
  if (index < 0) {
    return null;
  }
  const atlas = Math.floor(index / portraitsPerAtlas) + 1;
  const tile = index % portraitsPerAtlas;
  const column = tile % 3;
  const row = Math.floor(tile / 3);
  const avatarUrl = (file: string) =>
    `url("${import.meta.env.BASE_URL}agent-avatars/${file}")`;
  const gesture = gestureStrips[name];
  return (
    <span
      className={
        gesture === undefined
          ? "agent-portrait"
          : `agent-portrait portrait-gesture${gesture.blend ? " portrait-gesture-blend" : ""}`
      }
      aria-hidden="true"
      style={
        {
          "--portrait": avatarUrl(`atlas-${atlas}.webp`),
          "--portrait-large": avatarUrl(`atlas-${atlas}-large.webp`),
          "--portrait-tile": `${column * 50}% ${row === 0 ? 12.5 : 87.5}%`,
          ...(gesture === undefined
            ? {}
            : {
                "--portrait-gesture": avatarUrl(gesture.file),
                "--portrait-gesture-duration": gesture.duration,
              }),
        } as CSSProperties
      }
    />
  );
}
