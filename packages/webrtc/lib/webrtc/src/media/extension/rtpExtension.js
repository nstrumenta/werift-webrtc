"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useDependencyDescriptor = exports.useAbsSendTime = exports.useTransportWideCC = exports.useRepairedRtpStreamId = exports.useSdesRTPStreamId = exports.useSdesMid = exports.RTP_EXTENSION_URI = void 0;
const parameters_1 = require("../parameters");
exports.RTP_EXTENSION_URI = {
    sdesMid: "urn:ietf:params:rtp-hdrext:sdes:mid",
    sdesRTPStreamID: "urn:ietf:params:rtp-hdrext:sdes:rtp-stream-id",
    repairedRtpStreamId: "urn:ietf:params:rtp-hdrext:sdes:repaired-rtp-stream-id",
    transportWideCC: "http://www.ietf.org/id/draft-holmer-rmcat-transport-wide-cc-extensions-01",
    absSendTime: "http://www.webrtc.org/experiments/rtp-hdrext/abs-send-time",
    dependencyDescriptor: "https://aomediacodec.github.io/av1-rtp-spec/#dependency-descriptor-rtp-header-extension",
};
function useSdesMid() {
    return new parameters_1.RTCRtpHeaderExtensionParameters({
        uri: exports.RTP_EXTENSION_URI.sdesMid,
    });
}
exports.useSdesMid = useSdesMid;
function useSdesRTPStreamId() {
    return new parameters_1.RTCRtpHeaderExtensionParameters({
        uri: exports.RTP_EXTENSION_URI.sdesRTPStreamID,
    });
}
exports.useSdesRTPStreamId = useSdesRTPStreamId;
function useRepairedRtpStreamId() {
    return new parameters_1.RTCRtpHeaderExtensionParameters({
        uri: exports.RTP_EXTENSION_URI.repairedRtpStreamId,
    });
}
exports.useRepairedRtpStreamId = useRepairedRtpStreamId;
function useTransportWideCC() {
    return new parameters_1.RTCRtpHeaderExtensionParameters({
        uri: exports.RTP_EXTENSION_URI.transportWideCC,
    });
}
exports.useTransportWideCC = useTransportWideCC;
function useAbsSendTime() {
    return new parameters_1.RTCRtpHeaderExtensionParameters({
        uri: exports.RTP_EXTENSION_URI.absSendTime,
    });
}
exports.useAbsSendTime = useAbsSendTime;
function useDependencyDescriptor() {
    return new parameters_1.RTCRtpHeaderExtensionParameters({
        uri: exports.RTP_EXTENSION_URI.dependencyDescriptor,
    });
}
exports.useDependencyDescriptor = useDependencyDescriptor;
//# sourceMappingURL=rtpExtension.js.map