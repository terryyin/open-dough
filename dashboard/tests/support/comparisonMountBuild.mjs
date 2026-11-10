import { build } from "vite";
import { fileURLToPath } from "node:url";

const outDir = process.argv[2];
if (!outDir) {
  throw new Error("The comparison bundle needs an output directory");
}
await build({
  configFile: fileURLToPath(new URL("../../vite.config.mts", import.meta.url)),
  root: fileURLToPath(new URL("../comparison-mount/", import.meta.url)),
  logLevel: "silent",
  build: { outDir, emptyOutDir: true },
});
