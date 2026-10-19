// Read the current listening address, never a requested/configured port or a
// browser request's Host. A wildcard listener also serves its loopback address.
import type { HttpServer } from "vite";

export function dashboardOrigin(
  server: Pick<HttpServer, "address"> | null,
): string | undefined {
  const address = server?.address();
  if (
    address === undefined ||
    address === null ||
    typeof address === "string" ||
    !Number.isInteger(address.port) ||
    address.port < 1 ||
    address.port > 65_535
  )
    return undefined;
  // localhost is also admitted by the local boundaries and resolves to the
  // IPv6 loopback listener; a literal bracketed Host is not admitted there.
  const host =
    address.address === "::1" || address.address === "::"
      ? "localhost"
      : address.address === "0.0.0.0" || address.address === "127.0.0.1"
        ? "127.0.0.1"
        : undefined;
  return host === undefined
    ? undefined
    : `http://${host}:${String(address.port)}`;
}
