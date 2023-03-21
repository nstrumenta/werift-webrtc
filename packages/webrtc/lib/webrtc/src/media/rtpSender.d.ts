/**
   [10 Nov 1995 11:33:25.125 UTC]       [10 Nov 1995 11:33:36.5 UTC]
   n                 SR(n)              A=b710:8000 (46864.500 s)
   ---------------------------------------------------------------->
                      v                 ^
   ntp_sec =0xb44db705 v               ^ dlsr=0x0005:4000 (    5.250s)
   ntp_frac=0x20000000  v             ^  lsr =0xb705:2000 (46853.125s)
     (3024992005.125 s)  v           ^
   r                      v         ^ RR(n)
   ---------------------------------------------------------------->
                          |<-DLSR->|
                           (5.250 s)
        
   A     0xb710:8000 (46864.500 s)
   DLSR -0x0005:4000 (    5.250 s)
   LSR  -0xb705:2000 (46853.125 s)
   -------------------------------
   delay 0x0006:2000 (    6.125 s)
        
Figure 2: Example for round-trip time computation
 */
/// <reference types="node" />
import Event from "rx.mini";
import { GenericNack, RedEncoder, RtcpPacket, RtpHeader, RtpPacket } from "../../../rtp/src";
import { RTCDtlsTransport } from "../transport/dtls";
import { Kind } from "../types/domain";
import { RTCRtpCodecParameters, RTCRtpSendParameters } from "./parameters";
import { SenderBandwidthEstimator } from "./sender/senderBWE";
import { MediaStreamTrack } from "./track";
export declare class RTCRtpSender {
    trackOrKind: Kind | MediaStreamTrack;
    readonly type = "sender";
    readonly kind: Kind;
    readonly ssrc: number;
    readonly rtxSsrc: number;
    streamId: string;
    readonly trackId: string;
    readonly onReady: Event<any[]>;
    readonly onRtcp: Event<[RtcpPacket]>;
    readonly onPictureLossIndication: Event<[]>;
    readonly onGenericNack: Event<[GenericNack]>;
    readonly senderBWE: SenderBandwidthEstimator;
    private cname?;
    private mid?;
    private rtpStreamId?;
    private repairedRtpStreamId?;
    private rtxPayloadType?;
    private rtxSequenceNumber;
    redRedundantPayloadType?: number;
    private _redDistance;
    redEncoder: RedEncoder;
    private headerExtensions;
    private disposeTrack?;
    private lastSRtimestamp?;
    private lastSentSRTimestamp?;
    private ntpTimestamp;
    private rtpTimestamp;
    private octetCount;
    private packetCount;
    private rtt?;
    receiverEstimatedMaxBitrate: bigint;
    private sequenceNumber?;
    private timestamp?;
    private timestampOffset;
    private seqOffset;
    private rtpCache;
    codec?: RTCRtpCodecParameters;
    dtlsTransport: RTCDtlsTransport;
    private dtlsDisposer;
    track?: MediaStreamTrack;
    stopped: boolean;
    rtcpRunning: boolean;
    private rtcpCancel;
    constructor(trackOrKind: Kind | MediaStreamTrack);
    setDtlsTransport(dtlsTransport: RTCDtlsTransport): void;
    get redDistance(): number;
    set redDistance(n: number);
    prepareSend(params: RTCRtpSendParameters): void;
    registerTrack(track: MediaStreamTrack): void;
    replaceTrack(track: MediaStreamTrack | null): Promise<void>;
    stop(): void;
    runRtcp(): Promise<void>;
    replaceRTP({ sequenceNumber, timestamp, }: Pick<RtpHeader, "sequenceNumber" | "timestamp">, discontinuity?: boolean): void;
    sendRtp(rtp: Buffer | RtpPacket): Promise<void>;
    handleRtcpPacket(rtcpPacket: RtcpPacket): void;
}
export declare function wrapRtx(packet: RtpPacket, payloadType: number, sequenceNumber: number, ssrc: number): RtpPacket;
