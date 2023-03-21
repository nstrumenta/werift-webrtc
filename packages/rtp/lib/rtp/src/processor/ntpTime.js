"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ntpTime2Time = exports.syncRtpBase = void 0;
const debug_1 = __importDefault(require("debug"));
const __1 = require("..");
const lipsync_1 = require("../processor_old/lipsync");
const log = (0, debug_1.default)("werift-rtp : packages/rtp/src/processor/ntpTime.ts");
class syncRtpBase {
    constructor(clockRate) {
        Object.defineProperty(this, "clockRate", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: clockRate
        });
        Object.defineProperty(this, "ntpTimestamp", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "rtpTimestamp", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "buffer", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
    }
    processInput({ rtcp, rtp, eol }) {
        if (eol) {
            return [{ eol: true }];
        }
        if (rtcp && rtcp instanceof __1.RtcpSrPacket && !this.ntpTimestamp) {
            const { ntpTimestamp, rtpTimestamp } = rtcp.senderInfo;
            this.ntpTimestamp = ntpTimestamp;
            this.rtpTimestamp = rtpTimestamp;
        }
        if (rtp) {
            this.buffer.push(rtp);
            const res = [];
            this.buffer = this.buffer
                .map((rtp) => {
                const ntp = this.calcNtp(rtp.header.timestamp);
                if (ntp) {
                    res.push({ rtp, time: ntp * 1000 });
                    return undefined;
                }
                return rtp;
            })
                .filter((r) => r != undefined);
            return res;
        }
        return [];
    }
    /**sec */
    calcNtp(rtpTimestamp) {
        if (this.rtpTimestamp == undefined || this.ntpTimestamp == undefined) {
            return;
        }
        // base rtpTimestamp is rollover
        if (rtpTimestamp - this.rtpTimestamp > lipsync_1.Max32bit - this.clockRate * 60) {
            this.rtpTimestamp += lipsync_1.Max32bit;
            log("base rtpTimestamp is rollover");
        }
        // target rtpTimestamp is rollover
        else if (rtpTimestamp + (lipsync_1.Max32bit - this.clockRate * 60) - this.rtpTimestamp <
            0) {
            rtpTimestamp += lipsync_1.Max32bit;
            log("target rtpTimestamp is rollover");
        }
        const elapsed = (rtpTimestamp - this.rtpTimestamp) / this.clockRate;
        const ntp = (0, exports.ntpTime2Time)(this.ntpTimestamp) + elapsed;
        return ntp;
    }
}
exports.syncRtpBase = syncRtpBase;
const ntpTime2Time = (ntp) => {
    const [ntpSec, ntpMsec] = (0, __1.bufferReader)((0, __1.bufferWriter)([8], [ntp]), [4, 4]);
    return Number(`${ntpSec}.${ntpMsec}`);
};
exports.ntpTime2Time = ntpTime2Time;
//# sourceMappingURL=ntpTime.js.map