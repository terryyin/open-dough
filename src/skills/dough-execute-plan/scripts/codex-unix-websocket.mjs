// The native daemon uses uncompressed WebSocket messages over a Unix socket.
// Keeping this transport here lets installed commands and the dashboard share it.
import { request } from "node:http";
import { createHash, randomBytes } from "node:crypto";
import { EventEmitter } from "node:events";

export class UnixWebSocket extends EventEmitter {
  constructor(endpoint) {
    super();
    if (!endpoint.startsWith("unix:///")) {
      throw new Error("Invalid native endpoint.");
    }
    this.buffer = Buffer.alloc(0);
    this.fragments = [];
    this.fragmenting = false;
    this.ended = false;
    const key = randomBytes(16).toString("base64");
    this.opening = request({
      socketPath: endpoint.slice("unix://".length),
      path: "/",
      headers: {
        Connection: "Upgrade",
        Upgrade: "websocket",
        "Sec-WebSocket-Key": key,
        "Sec-WebSocket-Version": "13",
      },
    });
    this.opening.once("upgrade", (response, socket, head) => {
      const expected = createHash("sha1")
        .update(`${key}258EAFA5-E914-47DA-95CA-C5AB0DC85B11`)
        .digest("base64");
      if (response.headers["sec-websocket-accept"] !== expected) {
        socket.destroy();
        this.fail(new Error("Invalid native WebSocket handshake."));
        return;
      }
      this.socket = socket;
      socket.on("data", (chunk) => this.receive(chunk));
      socket.on("error", (error) => this.fail(error));
      socket.on("close", () => this.finish());
      this.emit("open");
      if (head.length) this.receive(head);
    });
    this.opening.on("error", (error) => this.fail(error));
    this.opening.on("response", () => {
      this.fail(new Error("Native endpoint refused WebSocket upgrade."));
    });
    this.opening.end();
  }

  receive(chunk) {
    this.buffer = Buffer.concat([this.buffer, chunk]);
    try {
      while (this.buffer.length >= 2) {
        const first = this.buffer[0];
        const second = this.buffer[1];
        if (first & 0x70 || second & 0x80) {
          throw new Error("Unsupported native WebSocket frame.");
        }
        let size = second & 0x7f;
        let offset = 2;
        if (size === 126) {
          if (this.buffer.length < 4) return;
          size = this.buffer.readUInt16BE(2);
          offset = 4;
        } else if (size === 127) {
          if (this.buffer.length < 10) return;
          const wide = this.buffer.readBigUInt64BE(2);
          if (wide > BigInt(Number.MAX_SAFE_INTEGER)) {
            throw new Error("Native WebSocket frame cannot be represented.");
          }
          size = Number(wide);
          offset = 10;
        }
        if (this.buffer.length < offset + size) return;
        const data = this.buffer.subarray(offset, offset + size);
        this.buffer = this.buffer.subarray(offset + size);
        const opcode = first & 0x0f;
        if (opcode >= 8 && (!(first & 0x80) || size > 125)) {
          throw new Error("Invalid native control frame.");
        }
        if (opcode === 8) {
          this.close();
          return;
        }
        if (opcode === 9) {
          this.frame(10, data);
        } else if (opcode === 0 || opcode === 1) {
          if (
            (opcode === 0 && !this.fragmenting) ||
            (opcode === 1 && this.fragmenting)
          ) {
            throw new Error("Invalid native message fragmentation.");
          }
          this.fragments.push(data);
          this.fragmenting = true;
          if (first & 0x80) {
            this.emit(
              "message",
              new TextDecoder("utf-8", { fatal: true }).decode(
                Buffer.concat(this.fragments),
              ),
            );
            this.fragments = [];
            this.fragmenting = false;
          }
        } else if (opcode !== 10) {
          throw new Error("Unsupported native WebSocket message.");
        }
      }
    } catch (error) {
      this.fail(error);
    }
  }

  frame(opcode, data) {
    if (this.ended || !this.socket) {
      throw new Error("Codex connection closed.");
    }
    const extended = data.length < 126 ? 0 : data.length <= 65535 ? 2 : 8;
    const header = Buffer.alloc(2 + extended + 4);
    header[0] = 0x80 | opcode;
    header[1] =
      0x80 | (extended === 0 ? data.length : extended === 2 ? 126 : 127);
    if (extended === 2) header.writeUInt16BE(data.length, 2);
    if (extended === 8) header.writeBigUInt64BE(BigInt(data.length), 2);
    const mask = randomBytes(4);
    mask.copy(header, 2 + extended);
    const masked = Buffer.from(data);
    for (let index = 0; index < masked.length; index++) {
      masked[index] ^= mask[index % 4];
    }
    this.socket.write(Buffer.concat([header, masked]));
  }

  send(text) {
    this.frame(1, Buffer.from(text));
  }

  fail(error) {
    if (this.ended) return;
    this.emit("fault", error);
    this.close();
  }

  finish() {
    if (this.ended) return;
    this.ended = true;
    this.emit("close");
  }

  close() {
    this.opening.destroy();
    this.socket?.destroy();
    this.finish();
  }
}
