"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RtpSourceCallback = void 0;
const rtp_1 = require("../../rtp/rtp");
class RtpSourceCallback {
    constructor(options = {}) {
        Object.defineProperty(this, "options", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: options
        });
        Object.defineProperty(this, "cb", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "input", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (packet) => {
                const rtp = packet instanceof rtp_1.RtpPacket ? packet : rtp_1.RtpPacket.deSerialize(packet);
                if (this.options.payloadType != undefined &&
                    this.options.payloadType !== rtp.header.payloadType) {
                    if (this.options.clearInvalidPTPacket) {
                        rtp.clear();
                    }
                    return;
                }
                if (this.cb) {
                    this.cb({ rtp });
                }
            }
        });
        options.clearInvalidPTPacket = options.clearInvalidPTPacket ?? true;
    }
    pipe(cb) {
        this.cb = cb;
    }
    stop() {
        if (this.cb) {
            this.cb({ eol: true });
        }
    }
}
exports.RtpSourceCallback = RtpSourceCallback;
//# sourceMappingURL=rtpCallback.js.map