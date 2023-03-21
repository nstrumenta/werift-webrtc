"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JitterBuffer = void 0;
const debug_1 = require("debug");
const src_1 = require("../../../common/src");
const base_1 = require("./base");
const log = (0, debug_1.debug)("werift : packages/rtp/src/processor/jitterBuffer.ts");
class JitterBuffer extends base_1.Pipeline {
    constructor() {
        super(...arguments);
        Object.defineProperty(this, "retry", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "head", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "buffer", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: {}
        });
        Object.defineProperty(this, "maxRetry", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 100
        });
        Object.defineProperty(this, "onRtp", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (p) => {
                this.buffer[p.header.sequenceNumber] = p;
                if (this.head == undefined) {
                    this.head = p.header.sequenceNumber;
                }
                else if (p.header.sequenceNumber != (0, src_1.uint16Add)(this.head, 1)) {
                    if (this.retry++ >= this.maxRetry) {
                        this.head = (0, src_1.uint16Add)(this.head, 2);
                    }
                    else {
                        return;
                    }
                }
                else {
                    this.head = (0, src_1.uint16Add)(this.head, 1);
                }
                const packets = [];
                let tail = this.head;
                for (;; tail = (0, src_1.uint16Add)(tail, 1)) {
                    const p = this.buffer[tail];
                    if (p) {
                        packets.push(p);
                        delete this.buffer[tail];
                    }
                    else {
                        break;
                    }
                }
                this.head = (0, src_1.uint16Add)(tail, -1);
                this.children?.pushRtpPackets?.(packets);
            }
        });
    }
    pushRtpPackets(packets) {
        packets.forEach(this.onRtp);
    }
    pushRtcpPackets(packets) {
        this.children?.pushRtcpPackets?.(packets);
    }
}
exports.JitterBuffer = JitterBuffer;
//# sourceMappingURL=jitterBuffer.js.map