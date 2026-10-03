// The named palettes an embedded terminal can use, chosen once in System
// settings and kept on this machine (`./terminalThemeSetting.ts`). Ids are
// stable and saved; labels are what the developer sees.
import type { ITheme } from "@xterm/xterm";

export const terminalThemeIds = [
  "default",
  "light",
  "solarized-dark",
  "solarized-light",
] as const;
export type TerminalThemeId = (typeof terminalThemeIds)[number];

export function isTerminalThemeId(value: unknown): value is TerminalThemeId {
  return (
    typeof value === "string" &&
    (terminalThemeIds as readonly string[]).includes(value)
  );
}

// Published Solarized values (https://ethanschoonover.com/solarized/).
const solarized = {
  base03: "#002b36",
  base02: "#073642",
  base01: "#586e75",
  base00: "#657b83",
  base0: "#839496",
  base1: "#93a1a1",
  base2: "#eee8d5",
  base3: "#fdf6e3",
  yellow: "#b58900",
  orange: "#cb4b16",
  red: "#dc322f",
  magenta: "#d33682",
  violet: "#6c71c4",
  blue: "#268bd2",
  cyan: "#2aa198",
  green: "#859900",
};
// Solarized's own terminal mapping of its sixteen colours.
const solarizedAnsi = {
  black: solarized.base02,
  red: solarized.red,
  green: solarized.green,
  yellow: solarized.yellow,
  blue: solarized.blue,
  magenta: solarized.magenta,
  cyan: solarized.cyan,
  white: solarized.base2,
  brightBlack: solarized.base03,
  brightRed: solarized.orange,
  brightGreen: solarized.base01,
  brightYellow: solarized.base00,
  brightBlue: solarized.base0,
  brightMagenta: solarized.violet,
  brightCyan: solarized.base1,
  brightWhite: solarized.base3,
};

export const terminalThemes: Readonly<
  Record<TerminalThemeId, { readonly label: string; readonly theme: ITheme }>
> = {
  // Empty, so xterm keeps exactly its own palette.
  default: { label: "Default", theme: {} },
  light: {
    label: "Light",
    theme: {
      foreground: "#1f2328",
      background: "#ffffff",
      cursor: "#1f2328",
      cursorAccent: "#ffffff",
      selectionBackground: "#b6d7ff",
      black: "#24292f",
      red: "#cf222e",
      green: "#116329",
      yellow: "#4d2d00",
      blue: "#0969da",
      magenta: "#8250df",
      cyan: "#1b7c83",
      white: "#6e7781",
      brightBlack: "#57606a",
      brightRed: "#a40e26",
      brightGreen: "#1a7f37",
      brightYellow: "#633c01",
      brightBlue: "#218bff",
      brightMagenta: "#a475f9",
      brightCyan: "#3192aa",
      brightWhite: "#8c959f",
    },
  },
  "solarized-dark": {
    label: "Solarized Dark",
    theme: {
      foreground: solarized.base0,
      background: solarized.base03,
      cursor: solarized.base1,
      cursorAccent: solarized.base03,
      selectionBackground: solarized.base02,
      ...solarizedAnsi,
    },
  },
  "solarized-light": {
    label: "Solarized Light",
    theme: {
      foreground: solarized.base00,
      background: solarized.base3,
      cursor: solarized.base01,
      cursorAccent: solarized.base3,
      selectionBackground: solarized.base2,
      ...solarizedAnsi,
    },
  },
};

export const ansiColorNames = [
  "black",
  "red",
  "green",
  "yellow",
  "blue",
  "magenta",
  "cyan",
  "white",
  "brightBlack",
  "brightRed",
  "brightGreen",
  "brightYellow",
  "brightBlue",
  "brightMagenta",
  "brightCyan",
  "brightWhite",
] as const satisfies readonly (keyof ITheme)[];
export type AnsiColorName = (typeof ansiColorNames)[number];

// xterm 6's own palette, which Default leaves in place.
const xtermPalette: Required<
  Pick<ITheme, "foreground" | "background" | AnsiColorName>
> = {
  foreground: "#ffffff",
  background: "#000000",
  black: "#2e3436",
  red: "#cc0000",
  green: "#4e9a06",
  yellow: "#c4a000",
  blue: "#3465a4",
  magenta: "#75507b",
  cyan: "#06989a",
  white: "#d3d7cf",
  brightBlack: "#555753",
  brightRed: "#ef2929",
  brightGreen: "#8ae234",
  brightYellow: "#fce94f",
  brightBlue: "#729fcf",
  brightMagenta: "#ad7fa8",
  brightCyan: "#34e2e2",
  brightWhite: "#eeeeec",
};

// The colours a terminal shows with this theme, xterm's own where it gives none.
export function terminalPalette(id: TerminalThemeId): typeof xtermPalette {
  return { ...xtermPalette, ...terminalThemes[id].theme };
}
