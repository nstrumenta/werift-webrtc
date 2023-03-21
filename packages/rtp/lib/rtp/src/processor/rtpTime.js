"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RtpTimeBase = void 0;
const __1 = require("..");
class RtpTimeBase {
    constructor(clockRate) {
        Object.defineProperty(this, "clockRate", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: clockRate
        });
        Object.defineProperty(this, "baseTimestamp", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        /**ms */
        Object.defineProperty(this, "elapsed", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
    }
    processInput({ rtp, eol }) {
        if (eol) {
            return [{ eol: true }];
        }
        if (rtp) {
            const elapsed = this.update(rtp.header.timestamp);
            return [{ rtp, time: elapsed }];
        }
        return [];
    }
    update(timestamp) {
        if (this.baseTimestamp == undefined) {
            this.baseTimestamp = timestamp;
        }
        const rotate = Math.abs(timestamp - this.baseTimestamp) > (__1.Max32Uint / 4) * 3;
        const elapsed = rotate
            ? timestamp + __1.Max32Uint - this.baseTimestamp
            : timestamp - this.baseTimestamp;
        this.elapsed = (0, __1.int)((elapsed / this.clockRate) * 1000);
        return this.elapsed;
    }
}
exports.RtpTimeBase = RtpTimeBase;
//# sourceMappingURL=rtpTime.js.map