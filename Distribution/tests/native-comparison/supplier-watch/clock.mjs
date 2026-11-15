// This clock belongs only to the approved supplier-watch native experiment.
// Cheap checks advance a FIFO; they never wait for an observation interval.
import { createReadStream, openSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
const events = ["nonqualifying", "qualifying"];
export function schedulePublications(start, emit = console.log) {
  if (!Number.isSafeInteger(start))
    throw new Error("invalid watch-request start");
  for (const [index, event] of events.entries()) {
    setTimeout(
      () => emit(event),
      Math.max(0, start + (index + 1) * 180000 - Date.now()),
    );
  }
}
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const [mode, directory, started] = process.argv.slice(2);
  if (mode === "native") {
    schedulePublications(Number(started));
  } else if (mode === "controlled") {
    writeFileSync(`${directory}/clock-pid`, String(process.pid));
    const stream = createReadStream(null, {
      fd: openSync(`${directory}/advance`, "r+"),
      encoding: "utf8",
    });
    let buffer = "",
      index = 0;
    stream.on("data", (chunk) => {
      buffer += chunk;
      while (buffer.includes("\n")) {
        const end = buffer.indexOf("\n"),
          event = buffer.slice(0, end);
        buffer = buffer.slice(end + 1);
        if (event !== events[index]) process.exit(23);
        console.log(event);
        if (++index === events.length) stream.destroy();
      }
    });
    stream.on("error", () => process.exit(24));
  } else process.exit(22);
}
