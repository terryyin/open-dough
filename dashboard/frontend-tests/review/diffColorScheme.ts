import { emulateMedia } from "./browser-session.ts";

export function diffColorScheme() {
  return async (scheme: "dark" | "light") => {
    await emulateMedia([{ name: "prefers-color-scheme", value: scheme }]);
  };
}
