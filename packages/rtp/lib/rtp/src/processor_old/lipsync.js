"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Max32bit = exports.ntpTime2Time = exports.LipSync = void 0;
const src_1 = require("../../../common/src");
const __1 = require("..");
const base_1 = require("./base");
// #### リップシンク
// ```
//         0                   1                   2                   3
//         0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
//        +=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+
// sender |              NTP timestamp, most significant word             |
// info   +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
//        |             NTP timestamp, least significant word             |
//        +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
//        |                         RTP timestamp                         |
//        +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
//        |                     sender's packet count                     |
//        +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
//        |                      sender's octet count                     |
//        +=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+
// ```
// - RTCP-SRにはNTP timestampとRTCP-SRを送った時点で最後に送ったRTPパケットのtimestampが載っている
// - RTP timestampは開始時点の値がランダムなので、Audio,VideoのRTPパケットの同期にはそのままでは使えない
//     - ある時点のRTP timestampのNTP timestampがRTCP-SRでわかるので、任意のRTP timestampに対応するNTP timestampを計算できる
// - Audio,VideoのRTPパケットの同期にはRTP timestampをNTP timestampに変換して行えば良い
// WIP
// todo impl
class LipSync extends base_1.Pipeline {
    constructor(clockRate, mismatch, streams) {
        super(streams);
        Object.defineProperty(this, "clockRate", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: clockRate
        });
        Object.defineProperty(this, "mismatch", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: mismatch
        });
        Object.defineProperty(this, "baseNtpTimestamp", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "baseRtpTimestamp", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "rtpPackets", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: {}
        });
    }
    pushRtcpPackets(packets) {
        packets.forEach((sr) => {
            if (sr instanceof __1.RtcpSrPacket) {
                this.srReceived(sr);
            }
        });
        this.children?.pushRtcpPackets?.(packets);
    }
    srReceived(sr) {
        const { ntpTimestamp, rtpTimestamp } = sr.senderInfo;
        this.baseNtpTimestamp = ntpTimestamp;
        this.baseRtpTimestamp = rtpTimestamp;
    }
    pushRtpPackets(packets) {
        packets.forEach((p) => {
            this.rtpPackets[p.header.payloadType] =
                this.rtpPackets[p.header.payloadType] ?? [];
            this.rtpPackets[p.header.payloadType].push(p);
        });
        if (Object.keys(this.rtpPackets).length === 2) {
            const [a, b] = Object.values(this.rtpPackets);
            const lastA = this.calcNtpTime(a.at(-1).header.timestamp);
            const lastB = this.calcNtpTime(b.at(-1).header.timestamp);
            if (lastA == undefined || lastB == undefined) {
                this.children?.pushRtpPackets?.(packets);
            }
            else {
                //
            }
        }
    }
    calcNtpTime(rtpTimestamp) {
        if (!this.baseRtpTimestamp || !this.baseNtpTimestamp) {
            return;
        }
        // base rtpTimestamp is rollover
        if (rtpTimestamp - this.baseRtpTimestamp > exports.Max32bit - this.clockRate * 60) {
            this.baseRtpTimestamp += exports.Max32bit;
        }
        // target rtpTimestamp is rollover
        else if (rtpTimestamp + (exports.Max32bit - this.clockRate * 60) - this.baseRtpTimestamp <
            0) {
            rtpTimestamp += exports.Max32bit;
        }
        const elapsed = (rtpTimestamp - this.baseRtpTimestamp) / this.clockRate;
        return (0, exports.ntpTime2Time)(this.baseNtpTimestamp) + elapsed;
    }
}
exports.LipSync = LipSync;
const ntpTime2Time = (ntp) => {
    const [ntpSec, ntpMsec] = (0, src_1.bufferReader)((0, src_1.bufferWriter)([8], [ntp]), [4, 4]);
    return Number(`${ntpSec}.${ntpMsec}`);
};
exports.ntpTime2Time = ntpTime2Time;
/**4294967295 */
exports.Max32bit = Number((0x01n << 32n) - 1n);
//# sourceMappingURL=lipsync.js.map