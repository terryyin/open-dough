// A limit a test may lower through the environment, to observe it without
// waiting out or filling the production value, which stays whenever the
// environment says nothing usable.
export function configuredLimit(variable: string, production: number): number {
  const configured = Number(process.env[variable]);
  return Number.isFinite(configured) && configured > 0
    ? configured
    : production;
}
