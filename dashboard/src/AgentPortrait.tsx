import { useEffect, useState, type CSSProperties } from "react";
import {
  agentNames,
  nerdAgentNames,
} from "../../src/skills/dough-product-backlog/scripts/product-backlog-agent-profile.mjs";
import "./agent-portrait.css";

const portraitsPerAtlas = 6;

// The agents whose enlarged portrait plays a short gesture on hover, by
// rotation name: a strip of frames beginning and ending on the approved tile.
const gestureStrips: Readonly<
  Record<
    string,
    { file: string; duration: string; frames?: number; blend?: boolean }
  >
> = {
  Yui: { file: "yui-gesture.webp", duration: "1.5s" },
  Akiho: { file: "akiho-gesture.webp", duration: "1.8s", blend: true },
  Yuma: { file: "yuma-gesture.webp", duration: "2s", frames: 24 },
  Sola: { file: "sola-gesture.webp", duration: "2s", frames: 24 },
};

// The approved portrait for a recorded agent, by its rotation name. Portraits
// follow the shared agent rotation, six to an atlas in a three-column, two-row
// grid of taller cells; the square shown is each cell's center. The portrait
// is decorative: the agent name beside it carries the meaning.
export function AgentPortrait({ name }: { name: string }) {
  if (nerdAgentNames.includes(name)) {
    return <NerdCartoonPortrait name={name} />;
  }
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
                "--portrait-gesture-timing": `steps(${gesture.frames ?? 18}, jump-none)`,
                "--portrait-gesture-span": `${(gesture.frames ?? 18) * 100}% 100%`,
              }),
        } as CSSProperties
      }
    />
  );
}

// A member of the Odd-e nerds is shown by a local cartoon avatar that is not part of
// the repository. Until the avatar loads, and when it is absent, there is no
// portrait: the name beside it stands alone.
function NerdCartoonPortrait({ name }: { name: string }) {
  const photo = `${import.meta.env.BASE_URL}agent-avatars/odd-e-nerds/cartoon/${name.toLowerCase()}.webp`;
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    setLoaded(false);
    const image = new Image();
    image.onload = () => {
      setLoaded(true);
    };
    image.src = photo;
    return () => {
      image.onload = null;
    };
  }, [photo]);
  if (!loaded) {
    return null;
  }
  return (
    <span
      className="agent-portrait"
      aria-hidden="true"
      style={
        {
          "--portrait": `url("${photo}")`,
          "--portrait-large": `url("${photo}")`,
          "--portrait-tile": "center",
          "--portrait-atlas-size": "cover",
        } as CSSProperties
      }
    />
  );
}
