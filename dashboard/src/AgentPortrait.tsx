import type { CSSProperties } from "react";
import { agentNames } from "../../src/skills/dough-product-backlog/scripts/product-backlog-agent-profile.mjs";
import "./agent-portrait.css";

const portraitsPerAtlas = 6;

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
  const atlasUrl = (suffix: string) =>
    `url("${import.meta.env.BASE_URL}agent-avatars/atlas-${atlas}${suffix}.webp")`;
  return (
    <span
      className="agent-portrait"
      aria-hidden="true"
      style={
        {
          "--portrait": atlasUrl(""),
          "--portrait-large": atlasUrl("-large"),
          "--portrait-tile": `${column * 50}% ${row === 0 ? 12.5 : 87.5}%`,
        } as CSSProperties
      }
    />
  );
}
