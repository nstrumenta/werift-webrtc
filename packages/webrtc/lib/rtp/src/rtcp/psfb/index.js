"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RtcpPayloadSpecificFeedback = void 0;
const debug_1 = __importDefault(require("debug"));
const rtcp_1 = require("../rtcp");
const fullIntraRequest_1 = require("./fullIntraRequest");
const pictureLossIndication_1 = require("./pictureLossIndication");
const remb_1 = require("./remb");
const log = (0, debug_1.default)("werift/rtp/rtcp/psfb/index");
class RtcpPayloadSpecificFeedback {
    constructor(props = {}) {
        Object.defineProperty(this, "type", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: RtcpPayloadSpecificFeedback.type
        });
        Object.defineProperty(this, "feedback", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.assign(this, props);
    }
    serialize() {
        const payload = this.feedback.serialize();
        return rtcp_1.RtcpPacketConverter.serialize(this.type, this.feedback.count, payload, this.feedback.length);
    }
    static deSerialize(data, header) {
        let feedback;
        switch (header.count) {
            case fullIntraRequest_1.FullIntraRequest.count:
                feedback = fullIntraRequest_1.FullIntraRequest.deSerialize(data);
                break;
            case pictureLossIndication_1.PictureLossIndication.count:
                feedback = pictureLossIndication_1.PictureLossIndication.deSerialize(data);
                break;
            case remb_1.ReceiverEstimatedMaxBitrate.count:
                feedback = remb_1.ReceiverEstimatedMaxBitrate.deSerialize(data);
                break;
            default:
                log("unknown psfb packet", header.count);
                break;
        }
        return new RtcpPayloadSpecificFeedback({ feedback });
    }
}
exports.RtcpPayloadSpecificFeedback = RtcpPayloadSpecificFeedback;
Object.defineProperty(RtcpPayloadSpecificFeedback, "type", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: 206
});
//# sourceMappingURL=index.js.map