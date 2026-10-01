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
  Yua: { file: "yua-gesture.webp", duration: "2s", frames: 24 },
  Ai: { file: "ai-gesture.webp", duration: "2s", frames: 24 },
  Kirara: { file: "kirara-gesture.webp", duration: "2s", frames: 24 },
  Mana: { file: "mana-gesture.webp", duration: "2s", frames: 24 },
  Tsubomi: { file: "tsubomi-gesture.webp", duration: "2s", frames: 24 },
  Yumi: { file: "yumi-gesture.webp", duration: "2s", frames: 24 },
  Julia: { file: "julia-gesture.webp", duration: "2s", frames: 24 },
  Tsukasa: { file: "tsukasa-gesture.webp", duration: "2s", frames: 24 },
  Kaoru: { file: "kaoru-gesture.webp", duration: "2s", frames: 24 },
  Nao: { file: "nao-gesture.webp", duration: "2s", frames: 24 },
  Maria: { file: "maria-gesture.webp", duration: "2s", frames: 24 },
  Mihiro: { file: "mihiro-gesture.webp", duration: "2s", frames: 24 },
  Aino: { file: "aino-gesture.webp", duration: "2s", frames: 24 },
  Rio: { file: "rio-gesture.webp", duration: "2s", frames: 24 },
  Airi: { file: "airi-gesture.webp", duration: "2s", frames: 24 },
  Shunka: { file: "shunka-gesture.webp", duration: "2s", frames: 24 },
  Eimi: { file: "eimi-gesture.webp", duration: "2s", frames: 24 },
  Hitomi: { file: "hitomi-gesture.webp", duration: "2s", frames: 24 },
  Hibiki: { file: "hibiki-gesture.webp", duration: "2s", frames: 24 },
  Maki: { file: "maki-gesture.webp", duration: "2s", frames: 24 },
  Nana: { file: "nana-gesture.webp", duration: "2s", frames: 24 },
  Honoka: { file: "honoka-gesture.webp", duration: "2s", frames: 24 },
  Anri: { file: "anri-gesture.webp", duration: "2s", frames: 24 },
  Koharu: { file: "koharu-gesture.webp", duration: "2s", frames: 24 },
  Rina: { file: "rina-gesture.webp", duration: "2s", frames: 24 },
};

// The approved portrait for a recorded agent, by its rotation name. Portraits
// follow the shared agent rotation, six to an atlas in a three-column, two-row
// grid of taller cells; the square shown is each cell's center. The portrait
// is decorative where the agent name beside it carries the meaning; given a
// `label`, as where no name is shown beside it, it is an image named and
// titled by that label.
export function AgentPortrait({
  name,
  label,
}: {
  name: string;
  label?: string | undefined;
}) {
  if (nerdAgentNames.includes(name)) {
    return <NerdCartoonPortrait name={name} label={label} />;
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
      {...portraitMeaning(label)}
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
function NerdCartoonPortrait({
  name,
  label,
}: {
  name: string;
  label: string | undefined;
}) {
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
      {...portraitMeaning(label)}
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

// A labelled portrait is an image named and titled by its label; otherwise it
// is hidden from assistive technology.
function portraitMeaning(label: string | undefined) {
  return label === undefined
    ? ({ "aria-hidden": "true" } as const)
    : ({ role: "img", "aria-label": label, title: label } as const);
}
