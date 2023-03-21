"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RtcpReceiverInfo = exports.RtcpRrPacket = void 0;
const range_1 = __importDefault(require("lodash/range"));
const src_1 = require("../../../common/src");
const rtcp_1 = require("./rtcp");
class RtcpRrPacket {
    constructor(props = {}) {
        Object.defineProperty(this, "ssrc", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
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
            value: RtcpRrPacket.type
        });
        Object.assign(this, props);
    }
    serialize() {
        let payload = (0, src_1.bufferWriter)([4], [this.ssrc]);
        payload = Buffer.concat([
            payload,
            ...this.reports.map((report) => report.serialize()),
        ]);
        return rtcp_1.RtcpPacketConverter.serialize(RtcpRrPacket.type, this.reports.length, payload, Math.floor(payload.length / 4));
    }
    static deSerialize(data, count) {
        const [ssrc] = (0, src_1.bufferReader)(data, [4]);
        let pos = 4;
        const reports = [];
        (0, range_1.default)(count).forEach(() => {
            reports.push(RtcpReceiverInfo.deSerialize(data.slice(pos, pos + 24)));
            pos += 24;
        });
        return new RtcpRrPacket({ ssrc, reports });
    }
}
exports.RtcpRrPacket = RtcpRrPacket;
Object.defineProperty(RtcpRrPacket, "type", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: 201
});
class RtcpReceiverInfo {
    constructor(props = {}) {
        Object.defineProperty(this, "ssrc", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "fractionLost", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "packetsLost", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "highestSequence", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "jitter", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        /**last SR */
        Object.defineProperty(this, "lsr", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        /**delay since last SR */
        Object.defineProperty(this, "dlsr", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.assign(this, props);
    }
    serialize() {
        return (0, src_1.bufferWriter)([4, 1, 3, 4, 4, 4, 4], [
            this.ssrc,
            this.fractionLost,
            this.packetsLost,
            this.highestSequence,
            this.jitter,
            this.lsr,
            this.dlsr,
        ]);
    }
    static deSerialize(data) {
        const [ssrc, fractionLost, packetsLost, highestSequence, jitter, lsr, dlsr,] = (0, src_1.bufferReader)(data, [4, 1, 3, 4, 4, 4, 4]);
        return new RtcpReceiverInfo({
            ssrc,
            fractionLost,
            packetsLost,
            highestSequence,
            jitter,
            lsr,
            dlsr,
        });
    }
}
exports.RtcpReceiverInfo = RtcpReceiverInfo;
//# sourceMappingURL=rr.js.map