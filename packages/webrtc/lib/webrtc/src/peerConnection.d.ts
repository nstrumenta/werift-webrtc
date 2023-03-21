import Event from "rx.mini";
import { Message } from "../../ice/src/stun/message";
import { Protocol } from "../../ice/src/types/model";
import { Address, InterfaceAddresses } from ".";
import { DtlsKeys } from ".";
import { RTCDataChannel } from "./dataChannel";
import { EventTarget } from "./helper";
import { RTCRtpCodecParameters, RTCRtpHeaderExtensionParameters } from "./media/parameters";
import { RTCRtpReceiver } from "./media/rtpReceiver";
import { RTCRtpSender } from "./media/rtpSender";
import { Direction, RTCRtpTransceiver, TransceiverOptions } from "./media/rtpTransceiver";
import { MediaStream, MediaStreamTrack } from "./media/track";
import { GroupDescription, MediaDescription, SessionDescription } from "./sdp";
import { RTCDtlsTransport } from "./transport/dtls";
import { IceGathererState, RTCIceCandidate, RTCIceConnectionState, RTCIceTransport } from "./transport/ice";
import { RTCSctpTransport } from "./transport/sctp";
import { ConnectionState, Kind, RTCSignalingState } from "./types/domain";
import { Callback, CallbackWithValue } from "./types/util";
export declare class RTCPeerConnection extends EventTarget {
    readonly cname: string;
    sctpTransport?: RTCSctpTransport;
    transportEstablished: boolean;
    config: Required<PeerConfig>;
    connectionState: ConnectionState;
    iceConnectionState: RTCIceConnectionState;
    iceGatheringState: IceGathererState;
    signalingState: RTCSignalingState;
    negotiationneeded: boolean;
    private readonly transceivers;
    private pushTransceiver;
    private replaceTransceiver;
    candidatesSent: Set<string>;
    readonly iceGatheringStateChange: Event<["new" | "complete" | "gathering"]>;
    readonly iceConnectionStateChange: Event<["disconnected" | "closed" | "completed" | "new" | "connected" | "failed" | "checking"]>;
    readonly signalingStateChange: Event<["closed" | "stable" | "have-local-offer" | "have-remote-offer" | "have-local-pranswer" | "have-remote-pranswer"]>;
    readonly connectionStateChange: Event<["disconnected" | "closed" | "new" | "connected" | "connecting" | "failed"]>;
    readonly onDataChannel: Event<[RTCDataChannel]>;
    readonly onRemoteTransceiverAdded: Event<[RTCRtpTransceiver]>;
    readonly onTransceiverAdded: Event<[RTCRtpTransceiver]>;
    readonly onIceCandidate: Event<[RTCIceCandidate]>;
    readonly onNegotiationneeded: Event<[]>;
    readonly onTrack: Event<[MediaStreamTrack]>;
    ondatachannel?: CallbackWithValue<RTCDataChannelEvent>;
    onicecandidate?: CallbackWithValue<RTCPeerConnectionIceEvent>;
    onnegotiationneeded?: CallbackWithValue<any>;
    onsignalingstatechange?: CallbackWithValue<any>;
    ontrack?: CallbackWithValue<RTCTrackEvent>;
    onconnectionstatechange?: Callback;
    private readonly router;
    private readonly certificates;
    sctpRemotePort?: number;
    private seenMid;
    private currentLocalDescription?;
    private currentRemoteDescription?;
    private pendingLocalDescription?;
    private pendingRemoteDescription?;
    private isClosed;
    private shouldNegotiationneeded;
    get dtlsTransports(): RTCDtlsTransport[];
    get iceTransports(): RTCIceTransport[];
    constructor(config?: Partial<PeerConfig>);
    get localDescription(): import("./sdp").RTCSessionDescription | undefined;
    get remoteDescription(): import("./sdp").RTCSessionDescription | undefined;
    private get _localDescription();
    private get _remoteDescription();
    private getTransceiverByMid;
    private getTransceiverByMLineIndex;
    createOffer(): Promise<import("./sdp").RTCSessionDescription>;
    private assignTransceiverCodecs;
    buildOfferSdp(): SessionDescription;
    createDataChannel(label: string, options?: Partial<{
        maxPacketLifeTime?: number;
        protocol: string;
        maxRetransmits?: number;
        ordered: boolean;
        negotiated: boolean;
        id?: number;
    }>): RTCDataChannel;
    removeTrack(sender: RTCRtpSender): void;
    private needNegotiation;
    private createTransport;
    private createSctpTransport;
    setLocalDescription(sessionDescription: {
        type: "offer" | "answer";
        sdp: string;
    }): Promise<SessionDescription>;
    private setLocal;
    private getTransportByMid;
    private getTransportByMLineIndex;
    addIceCandidate(candidateMessage: RTCIceCandidate): Promise<void>;
    private connect;
    private getLocalRtpParams;
    private getRemoteRtpParams;
    get remoteIsBundled(): GroupDescription | undefined;
    setRemoteDescription(sessionDescription: {
        type: "offer" | "answer";
        sdp: string;
    }): Promise<void>;
    private setRemoteRTP;
    private setRemoteSCTP;
    private validateDescription;
    private fireOnTrack;
    addTransceiver(trackOrKind: Kind | MediaStreamTrack, options?: Partial<TransceiverOptions>): RTCRtpTransceiver;
    private _addTransceiver;
    getTransceivers(): RTCRtpTransceiver[];
    getSenders(): RTCRtpSender[];
    getReceivers(): RTCRtpReceiver[];
    addTrack(track: MediaStreamTrack, 
    /**todo impl */
    ms?: MediaStream): RTCRtpSender;
    private ensureCerts;
    createAnswer(): Promise<import("./sdp").RTCSessionDescription>;
    private buildAnswer;
    close(): Promise<void>;
    private assertNotClosed;
    private updateIceGatheringState;
    private updateIceConnectionState;
    private setSignalingState;
    private setConnectionState;
    private dispose;
}
export declare function createMediaDescriptionForTransceiver(transceiver: RTCRtpTransceiver, cname: string, direction: Direction): MediaDescription;
export declare function createMediaDescriptionForSctp(sctp: RTCSctpTransport): MediaDescription;
export declare function addTransportDescription(media: MediaDescription, dtlsTransport: RTCDtlsTransport): void;
export declare function allocateMid(mids: Set<string>, type: "dc" | "av"): string;
export type BundlePolicy = "max-compat" | "max-bundle" | "disable";
export interface PeerConfig {
    codecs: Partial<{
        /**
         * When specifying a codec with a fixed payloadType such as PCMU,
         * it is necessary to set the correct PayloadType in RTCRtpCodecParameters in advance.
         */
        audio: RTCRtpCodecParameters[];
        video: RTCRtpCodecParameters[];
    }>;
    headerExtensions: Partial<{
        audio: RTCRtpHeaderExtensionParameters[];
        video: RTCRtpHeaderExtensionParameters[];
    }>;
    iceTransportPolicy: "all" | "relay";
    iceServers: RTCIceServer[];
    /**Minimum port and Maximum port must not be the same value */
    icePortRange: [number, number] | undefined;
    iceInterfaceAddresses: InterfaceAddresses | undefined;
    /** Add additional host (local) addresses to use for candidate gathering.
     * Notably, you can include hosts that are normally excluded, such as loopback, tun interfaces, etc.
     */
    iceAdditionalHostAddresses: string[] | undefined;
    iceUseIpv4: boolean;
    iceUseIpv6: boolean;
    /** If provided, is called on each STUN request.
     * Return `true` if a STUN response should be sent, false if it should be skipped. */
    iceFilterStunResponse: ((message: Message, addr: Address, protocol: Protocol) => boolean) | undefined;
    dtls: Partial<{
        keys: DtlsKeys;
    }>;
    bundlePolicy: BundlePolicy;
    debug: Partial<{
        /**% */
        inboundPacketLoss: number;
        /**% */
        outboundPacketLoss: number;
        /**ms */
        receiverReportDelay: number;
        disableSendNack: boolean;
        disableRecvRetransmit: boolean;
    }>;
}
export declare const findCodecByMimeType: (codecs: RTCRtpCodecParameters[], target: RTCRtpCodecParameters) => RTCRtpCodecParameters | undefined;
export type RTCIceServer = {
    urls: string;
    username?: string;
    credential?: string;
};
export declare const defaultPeerConfig: PeerConfig;
export interface RTCTrackEvent {
    track: MediaStreamTrack;
    streams: MediaStream[];
    transceiver: RTCRtpTransceiver;
    receiver: RTCRtpReceiver;
}
export interface RTCDataChannelEvent {
    channel: RTCDataChannel;
}
export interface RTCPeerConnectionIceEvent {
    candidate: RTCIceCandidate;
}
