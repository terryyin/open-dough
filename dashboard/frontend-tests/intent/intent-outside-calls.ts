// Every global fetch and WebSocket a mounted page opens outside its typed page
// reads, from the call on until the case finishes; each is recorded and still
// made.
import { onTestFinished } from "vitest";

export function recordOutsideCalls() {
  const opened: string[] = [];
  const { fetch, WebSocket } = globalThis;
  globalThis.fetch = (input, init) => {
    opened.push(
      `fetch ${input instanceof Request ? input.url : input.toString()}`,
    );
    return fetch(input, init);
  };
  globalThis.WebSocket = class extends WebSocket {
    constructor(url: string | URL, protocols?: string | string[]) {
      opened.push(`WebSocket ${String(url)}`);
      super(url, protocols);
    }
  };
  onTestFinished(() => {
    globalThis.fetch = fetch;
    globalThis.WebSocket = WebSocket;
  });
  return opened;
}
