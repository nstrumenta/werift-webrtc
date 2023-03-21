"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RtcpSenderInfo = exports.RtcpSrPacket = void 0;
const range_1 = __importDefault(require("lodash/range"));
const src_1 = require("../../../common/src");
const rr_1 = require("./rr");
const rtcp_1 = require("./rtcp");
// https://datatracker.ietf.org/doc/html/rfc3550#section-6.4.1
//         0                   1                   2                   3
//         0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
//        +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
// header |V=2|P|    RC   |   PT=SR=200   |             length            |
//        +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
//        |                         SSRC of sender                        |
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
// report |                 SSRC_1 (SSRC of first source)                 |
// block  +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
//   1    | fraction lost |       cumulative number of packets lost       |
//        +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
//        |           extended highest sequence number received           |
//        +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
//        |                      interarrival jitter                      |
//        +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
//        |                         last SR (LSR)                         |
//        +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
//        |                   delay since last SR (DLSR)                  |
//        +=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+
// report |                 SSRC_2 (SSRC of second source)                |
// block  +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
//   2    :                               ...                             :
//        +=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+
//        |                  profile-specific extensions                  |
//        +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
class RtcpSrPacket {
    constructor(props) {
        Object.defineProperty(this, "ssrc", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "senderInfo", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "reports", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "type", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: RtcpSrPacket.type
        });
        Object.assign(this, props);
    }
    serialize() {
        let payload = Buffer.alloc(4);
        payload.writeUInt32BE(this.ssrc);
        payload = Buffer.concat([payload, this.senderInfo.serialize()]);
        payload = Buffer.concat([
            payload,
            ...this.reports.map((report) => report.serialize()),
        ]);
        return rtcp_1.RtcpPacketConverter.serialize(RtcpSrPacket.type, this.reports.length, payload, Math.floor(payload.length / 4));
    }
    static deSerialize(payload, count) {
        const ssrc = payload.readUInt32BE();
        const senderInfo = RtcpSenderInfo.deSerialize(payload.slice(4, 24));
        let pos = 24;
        const reports = [];
        for (const _ of (0, range_1.default)(count)) {
            reports.push(rr_1.RtcpReceiverInfo.deSerialize(payload.slice(pos, pos + 24)));
            pos += 24;
        }
        const packet = new RtcpSrPacket({ ssrc, senderInfo, reports });
        return packet;
    }
}
exports.RtcpSrPacket = RtcpSrPacket;
Object.defineProperty(RtcpSrPacket, "type", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: 200
});
class RtcpSenderInfo {
    constructor(props = {}) {
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
        Object.defineProperty(this, "packetCount", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "octetCount", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.assign(this, props);
    }
    serialize() {
        return (0, src_1.bufferWriter)([8, 4, 4, 4], [this.ntpTimestamp, this.rtpTimestamp, this.packetCount, this.octetCount]);
    }
    static deSerialize(data) {
        const [ntpTimestamp, rtpTimestamp, packetCount, octetCount] = (0, src_1.bufferReader)(data, [8, 4, 4, 4]);
        return new RtcpSenderInfo({
            ntpTimestamp,
            rtpTimestamp,
            packetCount,
            octetCount,
        });
    }
}
exports.RtcpSenderInfo = RtcpSenderInfo;
//# sourceMappingURL=sr.js.map