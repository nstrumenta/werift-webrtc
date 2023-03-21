/// <reference types="node" />
import { RtpPacket } from "../../rtp/src";
import { Direction } from "./media/rtpTransceiver";
import { RTCIceServer } from "./peerConnection";
export declare function fingerprint(file: Buffer, hashName: string): any;
export declare function isDtls(buf: Buffer): boolean;
export declare function isMedia(buf: Buffer): boolean;
export declare function isRtcp(buf: Buffer): boolean;
export declare function reverseSimulcastDirection(dir: "recv" | "send"): "recv" | "send";
export declare const andDirection: (a: Direction, b: Direction) => "inactive" | "sendonly" | "recvonly" | "sendrecv";
export declare function reverseDirection(dir: Direction): Direction;
export declare const microTime: () => number;
export declare const milliTime: () => number;
export declare const timestampSeconds: () => number;
/**https://datatracker.ietf.org/doc/html/rfc3550#section-4 */
export declare const ntpTime: () => bigint;
/**
 * https://datatracker.ietf.org/doc/html/rfc3550#section-4
 * @param ntp
 * @returns 32bit
 */
export declare const compactNtp: (ntp: bigint) => number;
export declare function parseIceServers(iceServers: RTCIceServer[]): {
    stunServer: readonly [string, number] | undefined;
    turnServer: readonly [string, number] | undefined;
    turnUsername: string | undefined;
    turnPassword: string | undefined;
};
export declare class RtpBuilder {
    sequenceNumber: number;
    timestamp: number;
    create(payload: Buffer): RtpPacket;
}
/**
 *
 * @param signatureHash
 * @param namedCurveAlgorithm necessary when use ecdsa
 */
export declare const createSelfSignedCertificate: (signatureHash: import(".").SignatureHash, namedCurveAlgorithm?: import(".").NamedCurveAlgorithms | undefined) => Promise<{
    certPem: string;
    keyPem: string;
    signatureHash: import(".").SignatureHash;
}>;
