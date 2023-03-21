/// <reference types="node" />
import Event from "rx.mini";
import { DtlsSocket } from "../../../dtls/src";
import { SignatureHash } from "../../../dtls/src/cipher/const";
import { Profile } from "../../../dtls/src/context/srtp";
import { RtcpPacket, RtpHeader, SrtcpSession, SrtpSession } from "../../../rtp/src";
import { RtpRouter } from "../media/router";
import { PeerConfig } from "../peerConnection";
import { RTCIceTransport } from "./ice";
export declare class RTCDtlsTransport {
    readonly config: PeerConfig;
    readonly iceTransport: RTCIceTransport;
    readonly router: RtpRouter;
    readonly certificates: RTCCertificate[];
    private readonly srtpProfiles;
    id: string;
    state: DtlsState;
    role: DtlsRole;
    srtpStarted: boolean;
    transportSequenceNumber: number;
    dataReceiver: (buf: Buffer) => void;
    dtls?: DtlsSocket;
    srtp: SrtpSession;
    srtcp: SrtcpSession;
    readonly onStateChange: Event<["closed" | "new" | "connected" | "connecting" | "failed"]>;
    localCertificate?: RTCCertificate;
    private remoteParameters?;
    constructor(config: PeerConfig, iceTransport: RTCIceTransport, router: RtpRouter, certificates: RTCCertificate[], srtpProfiles?: Profile[]);
    get localParameters(): RTCDtlsParameters;
    setupCertificate(): Promise<RTCCertificate>;
    setRemoteParams(remoteParameters: RTCDtlsParameters): void;
    start(): Promise<void>;
    updateSrtpSession(): void;
    startSrtp(): void;
    readonly sendData: (data: Buffer) => Promise<void>;
    sendRtp(payload: Buffer, header: RtpHeader): Promise<number>;
    sendRtcp(packets: RtcpPacket[]): Promise<number | undefined>;
    private setState;
    stop(): Promise<void>;
}
export declare const DtlsStates: readonly ["new", "connecting", "connected", "closed", "failed"];
export type DtlsState = (typeof DtlsStates)[number];
export type DtlsRole = "auto" | "server" | "client";
export declare class RTCCertificate {
    certPem: string;
    signatureHash: SignatureHash;
    publicKey: string;
    privateKey: string;
    constructor(privateKeyPem: string, certPem: string, signatureHash: SignatureHash);
    getFingerprints(): RTCDtlsFingerprint[];
}
export type DtlsKeys = {
    certPem: string;
    keyPem: string;
    signatureHash: SignatureHash;
};
export declare class RTCDtlsFingerprint {
    algorithm: string;
    value: string;
    constructor(algorithm: string, value: string);
}
export declare class RTCDtlsParameters {
    fingerprints: RTCDtlsFingerprint[];
    role: "auto" | "client" | "server";
    constructor(fingerprints: RTCDtlsFingerprint[], role: "auto" | "client" | "server");
}
