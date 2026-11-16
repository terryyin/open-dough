// @ts-check
// Retained Cursor transcript wire format, without invented usage or timestamps.
export class CursorTranscriptBuilder {
  /** @type {Record<string, unknown>[]} */
  #rows = [];

  /** @param {string} name @param {object} input @param {{ id?: string, dynamic?: boolean }} [options] */
  withToolCall(name, input, options = {}) {
    this.#rows.push({
      role: "assistant",
      message: {
        content: [
          {
            type: "tool_use",
            id: options.id ?? `call-${this.#rows.length}`,
            name: options.dynamic ? "CallDynamicTool" : name,
            input: options.dynamic
              ? { namespace: "functions", toolName: name, arguments: input }
              : input,
          },
        ],
      },
    });
    return this;
  }

  /** @param {string} id @param {string} content */
  withToolResult(id, content) {
    this.#rows.push({
      role: "user",
      message: { content: [{ type: "tool_result", tool_use_id: id, content }] },
    });
    return this;
  }

  /** @param {string} text */
  withUserInput(text) {
    this.#rows.push({
      role: "user",
      message: { content: [{ type: "text", text }] },
    });
    return this;
  }

  /** @param {Record<string, unknown>} row */
  withRow(row) {
    this.#rows.push(structuredClone(row));
    return this;
  }

  please() {
    return structuredClone(this.#rows);
  }
}
