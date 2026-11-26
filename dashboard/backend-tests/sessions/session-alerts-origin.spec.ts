// Listening-address selection has to name a destination the local admission
// will accept. The notification journey (e2e/sessions/session-alerts.spec.ts)
// clicks through the real dashboard listener.
import { expect, test } from "vitest";
import { dashboardOrigin } from "../../server/dashboardOrigin.ts";
import { verifySameOrigin } from "../../server/localOrigin.ts";

const serverOf = (address: ReturnType<typeof listening> | string | null) => ({
  address: () => address,
});

function listening(address: string, port = 49152) {
  return { address, port, family: address.includes(":") ? "IPv6" : "IPv4" };
}

test.each([
  ["127.0.0.1", "http://127.0.0.1:49152"],
  ["0.0.0.0", "http://127.0.0.1:49152"],
  ["::1", "http://localhost:49152"],
  ["::", "http://localhost:49152"],
])("a %s listener yields the admitted origin %s", (address, origin) => {
  expect(dashboardOrigin(serverOf(listening(address)))).toBe(origin);
  const { host } = new URL(origin);
  expect(() => {
    verifySameOrigin(origin, host);
    verifySameOrigin(null, host, "same-origin");
  }).not.toThrow();
});

test.each([
  { name: "no server", server: null },
  { name: "no address", server: serverOf(null) },
  { name: "a pipe", server: serverOf("/tmp/dashboard.sock") },
  { name: "a non-loopback host", server: serverOf(listening("192.0.2.1")) },
  { name: "another loopback host", server: serverOf(listening("127.0.0.2")) },
  { name: "port 0", server: serverOf(listening("127.0.0.1", 0)) },
  {
    name: "a port above 65535",
    server: serverOf(listening("127.0.0.1", 65_536)),
  },
])("$name yields no destination", ({ server }) => {
  expect(dashboardOrigin(server)).toBeUndefined();
});
