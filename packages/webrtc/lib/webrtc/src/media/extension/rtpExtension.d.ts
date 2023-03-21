import { RTCRtpHeaderExtensionParameters } from "../parameters";
export declare const RTP_EXTENSION_URI: {
    readonly sdesMid: "urn:ietf:params:rtp-hdrext:sdes:mid";
    readonly sdesRTPStreamID: "urn:ietf:params:rtp-hdrext:sdes:rtp-stream-id";
    readonly repairedRtpStreamId: "urn:ietf:params:rtp-hdrext:sdes:repaired-rtp-stream-id";
    readonly transportWideCC: "http://www.ietf.org/id/draft-holmer-rmcat-transport-wide-cc-extensions-01";
    readonly absSendTime: "http://www.webrtc.org/experiments/rtp-hdrext/abs-send-time";
    readonly dependencyDescriptor: "https://aomediacodec.github.io/av1-rtp-spec/#dependency-descriptor-rtp-header-extension";
};
export declare function useSdesMid(): RTCRtpHeaderExtensionParameters;
export declare function useSdesRTPStreamId(): RTCRtpHeaderExtensionParameters;
export declare function useRepairedRtpStreamId(): RTCRtpHeaderExtensionParameters;
export declare function useTransportWideCC(): RTCRtpHeaderExtensionParameters;
export declare function useAbsSendTime(): RTCRtpHeaderExtensionParameters;
export declare function useDependencyDescriptor(): RTCRtpHeaderExtensionParameters;
