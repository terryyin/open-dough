// The service's bounded launch wait. A start's answer comes after a real
// Take publication (push, workspace, formatter) and the native exchange, which
// under machine load can take several seconds, so a page waiting on that
// answer waits as long as the start itself may.
export const launchWaitMs = 30_000;
