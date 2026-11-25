// Listening-address selection has to name a destination the local admission
// will accept. Typed address values drive dashboardOrigin; the real socket
// reachability probe lives in e2e/sessions/session-alerts-origin.spec.ts.
import { expect, test } from "vitest";
import { dashboardOrigin } from "../../server/dashboardOrigin.ts";
import { verifySameOrigin } from "../../server/localOrigin.ts";

type AddressValue =
  null | string | { address: string; port: number; family: string };

const serverOf = (value: AddressValue) => ({
  address: () => value,
});

const usable: ReadonlyArray<{
  address: string;
  port: number;
  family: string;
  origin: string;
}> = [
  {
    address: "127.0.0.1",
    port: 49152,
    family: "IPv4",
    origin: "http://127.0.0.1:49152",
  },
  {
    address: "0.0.0.0",
    port: 49153,
    family: "IPv4",
    origin: "http://127.0.0.1:49153",
  },
  {
    address: "::1",
    port: 49154,
    family: "IPv6",
    origin: "http://localhost:49154",
  },
  {
    address: "::",
    port: 49155,
    family: "IPv6",
    origin: "http://localhost:49155",
  },
];

for (const { address, port, family, origin } of usable) {
  test(`a ${address} listener address yields ${origin} and admits that host and origin`, () => {
    expect(dashboardOrigin(serverOf({ address, port, family }))).toBe(origin);
    const host = new URL(origin).host;
    expect(() => {
      verifySameOrigin(origin, host);
    }).not.toThrow();
    expect(() => {
      verifySameOrigin(null, host, "same-origin");
    }).not.toThrow();
  });
}

test("null, non-TCP, unusable explicit addresses, and invalid ports have no invented destination", () => {
  expect(dashboardOrigin(null)).toBeUndefined();
  for (const address of [
    null,
    "/tmp/dashboard.sock",
    ...[
      ["192.0.2.1", 1234],
      ["127.0.0.2", 1234],
      ["127.0.0.1", 0],
      ["127.0.0.1", -1],
      ["127.0.0.1", 65_536],
    ].map(([host, port]) => ({
      address: String(host),
      port: Number(port),
      family: "IPv4",
    })),
  ] as const) {
    expect(dashboardOrigin(serverOf(address))).toBeUndefined();
  }
});
