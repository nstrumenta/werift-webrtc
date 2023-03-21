"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SampleBuilder = void 0;
const helper_1 = require("../helper");
const base_1 = require("./base");
class SampleBuilder extends base_1.Pipeline {
    constructor(isFinalPacketInSequence, streams) {
        super(streams);
        Object.defineProperty(this, "isFinalPacketInSequence", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: isFinalPacketInSequence
        });
        Object.defineProperty(this, "buffering", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
    }
    pushRtpPackets(incoming) {
        this.buffering = [...this.buffering, ...incoming];
        let tail;
        for (const [i, p] of (0, helper_1.enumerate)(this.buffering)) {
            if (this.isFinalPacketInSequence(p.header)) {
                tail = i;
                break;
            }
        }
        if (tail == undefined) {
            return;
        }
        const packets = this.buffering.slice(0, tail + 1);
        this.buffering = this.buffering.slice(tail + 1);
        this.children?.pushRtpPackets?.(packets);
    }
    pushRtcpPackets(packets) {
        this.children?.pushRtcpPackets?.(packets);
    }
}
exports.SampleBuilder = SampleBuilder;
//# sourceMappingURL=sampleBuilder.js.map