import { Extension, RtcpPacket, RtpPacket } from "../../../rtp/src";
import { RTCRtpReceiveParameters, RTCRtpSimulcastParameters } from "./parameters";
import { RTCRtpReceiver } from "./rtpReceiver";
import { RTCRtpSender } from "./rtpSender";
import { RTCRtpTransceiver } from "./rtpTransceiver";
export type Extensions = {
    [uri: string]: number | string;
};
export declare class RtpRouter {
    ssrcTable: {
        [ssrc: number]: RTCRtpReceiver | RTCRtpSender;
    };
    ridTable: {
        [rid: string]: RTCRtpReceiver | RTCRtpSender;
    };
    extIdUriMap: {
        [id: number]: string;
    };
    constructor();
    registerRtpSender(sender: RTCRtpSender): void;
    private registerRtpReceiver;
    registerRtpReceiverBySsrc(transceiver: RTCRtpTransceiver, params: RTCRtpReceiveParameters): void;
    registerRtpReceiverByRid(transceiver: RTCRtpTransceiver, param: RTCRtpSimulcastParameters, params: RTCRtpReceiveParameters): void;
    static rtpHeaderExtensionsParser(extensions: Extension[], extIdUriMap: {
        [id: number]: string;
    }): Extensions;
    routeRtp: (packet: RtpPacket) => void;
    routeRtcp: (packet: RtcpPacket) => void;
}
