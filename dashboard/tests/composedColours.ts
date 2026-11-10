// Parse computed CSS colours (rgb/rgba and color(srgb)), compose translucent
// layers into the colour a reader sees, and measure contrast independently of
// production tokens.

export type Rgba = { r: number; g: number; b: number; a: number };

function relativeLuminance(channel: {
  r: number;
  g: number;
  b: number;
}): number {
  const toLinear = (value: number) => {
    const s = value / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return (
    0.2126 * toLinear(channel.r) +
    0.7152 * toLinear(channel.g) +
    0.0722 * toLinear(channel.b)
  );
}

export function parseCssColor(color: string): Rgba {
  if (color === "transparent") return { r: 0, g: 0, b: 0, a: 0 };
  const rgb = color.match(
    /^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*([\d.]+))?\s*\)$/,
  );
  if (rgb) {
    return {
      r: Number(rgb[1]),
      g: Number(rgb[2]),
      b: Number(rgb[3]),
      a: rgb[4] === undefined ? 1 : Number(rgb[4]),
    };
  }
  const srgb = color.match(
    /^color\(srgb\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)(?:\s*\/\s*([\d.]+))?\)$/,
  );
  if (srgb) {
    return {
      r: Number(srgb[1]) * 255,
      g: Number(srgb[2]) * 255,
      b: Number(srgb[3]) * 255,
      a: srgb[4] === undefined ? 1 : Number(srgb[4]),
    };
  }
  throw new Error(`Unsupported computed color: ${color}`);
}

function compositeOver(foreground: Rgba, background: Rgba): Rgba {
  const a = foreground.a + background.a * (1 - foreground.a);
  if (a === 0) return { r: 0, g: 0, b: 0, a: 0 };
  return {
    r:
      (foreground.r * foreground.a +
        background.r * background.a * (1 - foreground.a)) /
      a,
    g:
      (foreground.g * foreground.a +
        background.g * background.a * (1 - foreground.a)) /
      a,
    b:
      (foreground.b * foreground.a +
        background.b * background.a * (1 - foreground.a)) /
      a,
    a,
  };
}

export function toCssRgb(color: Rgba): string {
  return `rgb(${Math.round(color.r)}, ${Math.round(color.g)}, ${Math.round(color.b)})`;
}

// Composite nearest-first background layers into the colour a reader sees.
export function composeBackgrounds(
  layersNearestFirst: readonly string[],
): string {
  const layers = layersNearestFirst.map(parseCssColor);
  let baseIndex = -1;
  for (let i = layers.length - 1; i >= 0; i -= 1) {
    const candidate = layers[i];
    if (candidate !== undefined && candidate.a >= 0.999) {
      baseIndex = i;
      break;
    }
  }
  const base = baseIndex >= 0 ? layers[baseIndex] : undefined;
  let composed: Rgba =
    base === undefined
      ? { r: 255, g: 255, b: 255, a: 1 }
      : { r: base.r, g: base.g, b: base.b, a: 1 };
  const start = baseIndex >= 0 ? baseIndex - 1 : layers.length - 1;
  for (let i = start; i >= 0; i -= 1) {
    const layer = layers[i];
    if (layer === undefined || layer.a === 0) continue;
    composed = compositeOver(layer, composed);
  }
  return toCssRgb(composed);
}

export function contrastRatio(foreground: string, background: string): number {
  const fg = relativeLuminance(parseCssColor(foreground));
  const bg = relativeLuminance(parseCssColor(background));
  const lighter = Math.max(fg, bg);
  const darker = Math.min(fg, bg);
  return (lighter + 0.05) / (darker + 0.05);
}

export function painted(color: string): boolean {
  try {
    return parseCssColor(color).a > 0;
  } catch {
    return false;
  }
}
