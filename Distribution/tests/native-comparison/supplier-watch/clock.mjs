// Controlled checks advance this FIFO driver independently of model activity.
import { createReadStream, openSync, writeFileSync } from "node:fs";
const events = ["nonqualifying", "qualifying"];
const [directory] = process.argv.slice(2);
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
