import Event from "rx.mini";
import { RtcpPacket, RtpPacket } from "../../../rtp/src";
import { PeerConfig } from "..";
import { RTCDtlsTransport } from "../transport/dtls";
import { Kind } from "../types/domain";
import { RTCRtpReceiveParameters } from "./parameters";
import { ReceiverTWCC } from "./receiver/receiverTwcc";
import { Extensions } from "./router";
import { MediaStreamTrack } from "./track";
export declare class RTCRtpReceiver {
    readonly config: PeerConfig;
    kind: Kind;
    rtcpSsrc: number;
    private readonly codecs;
    private get codecArray();
    private readonly ssrcByRtx;
    private readonly nack;
    private readonly audioRedHandler;
    readonly type = "receiver";
    readonly uuid: string;
    readonly tracks: MediaStreamTrack[];
    readonly trackBySSRC: {
        [ssrc: string]: MediaStreamTrack;
    };
    readonly trackByRID: {
        [rid: string]: MediaStreamTrack;
    };
    /**last sender Report Timestamp
     * compactNtp
     */
    readonly lastSRtimestamp: {
        [ssrc: number]: number;
    };
    /**seconds */
    readonly receiveLastSRTimestamp: {
        [ssrc: number]: number;
    };
    readonly onPacketLost: Event<[import("..").GenericNack]>;
    readonly onRtcp: Event<[RtcpPacket]>;
    dtlsTransport: RTCDtlsTransport;
    sdesMid?: string;
    latestRid?: string;
    latestRepairedRid?: string;
    receiverTWCC?: ReceiverTWCC;
    stopped: boolean;
    remoteStreamId?: string;
    remoteTrackId?: string;
    rtcpRunning: boolean;
    private rtcpCancel;
    private remoteStreams;
    constructor(config: PeerConfig, kind: Kind, rtcpSsrc: number);
    setDtlsTransport(dtls: RTCDtlsTransport): void;
    get track(): MediaStreamTrack;
    get nackEnabled(): import("./parameters").RTCPFB | undefined;
    get twccEnabled(): import("./parameters").RTCPFB | undefined;
    get pliEnabled(): import("./parameters").RTCPFB | undefined;
    prepareReceive(params: RTCRtpReceiveParameters): void;
    /**
     * setup TWCC if supported
     */
    setupTWCC(mediaSourceSsrc: number): void;
    addTrack(track: MediaStreamTrack): boolean;
    stop(): void;
    runRtcp(): Promise<void>;
    /**todo impl */
    getStats(): void;
    sendRtcpPLI(mediaSsrc: number): Promise<void>;
    handleRtcpPacket(packet: RtcpPacket): void;
    handleRtpBySsrc: (packet: RtpPacket, extensions: Extensions) => void;
    handleRtpByRid: (packet: RtpPacket, rid: string, extensions: Extensions) => void;
    private handleRTP;
}
export declare function unwrapRtx(rtx: RtpPacket, payloadType: number, ssrc: number): RtpPacket;
