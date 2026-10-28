// Raw PTY text retained only to explain an early exit while keep is unsettled.
// A successful keep releases it; reconnection uses the modeled screen.
export const diagnosticCaptureBudgetBytes = 256 * 1024;

export class TerminalDiagnosticCapture {
  private text = "";
  private capturing = true;

  // Append output while capture is active, keeping only a UTF-8-safe tail
  // when the retained string exceeds the budget.
  retain(output: string): void {
    if (!this.capturing) return;
    this.text += output;
    const bytes = Buffer.byteLength(this.text, "utf8");
    if (bytes <= diagnosticCaptureBudgetBytes) return;
    const encoded = Buffer.from(this.text, "utf8");
    let start = encoded.length - diagnosticCaptureBudgetBytes;
    while (start < encoded.length) {
      const byte = encoded[start];
      if (byte === undefined || (byte & 0xc0) !== 0x80) break;
      start++;
    }
    this.text = encoded.subarray(start).toString("utf8");
  }

  // Bytes currently held. Zero after release.
  byteLength(): number {
    return Buffer.byteLength(this.text, "utf8");
  }

  // Current retained text, used when the process exits while capture is active.
  snapshot(): string {
    return this.text;
  }

  // Drop the raw string once keep has settled successfully so later redraw
  // traffic does not accumulate a lifetime buffer.
  release(): void {
    this.capturing = false;
    this.text = "";
  }
}
