/// <reference types="node" />
import { RtcpHeader } from "../../rtcp/header";
import { RtpHeader } from "../../rtp/rtp";
import { CipherAesBase } from ".";
export declare class CipherAesCtr extends CipherAesBase {
    private srtpSessionAuthTag;
    private srtcpSessionAuthTag;
    readonly authTagLength = 10;
    constructor(srtpSessionKey: Buffer, srtpSessionSalt: Buffer, srtcpSessionKey: Buffer, srtcpSessionSalt: Buffer, srtpSessionAuthTag: Buffer, srtcpSessionAuthTag: Buffer);
    encryptRtp(header: RtpHeader, payload: Buffer, rolloverCounter: number): Buffer;
    decryptRtp(cipherText: Buffer, rolloverCounter: number): [Buffer, RtpHeader];
    encryptRTCP(rtcpPacket: Buffer, srtcpIndex: number): Buffer;
    decryptRTCP(encrypted: Buffer): [Buffer, RtcpHeader];
    generateSrtcpAuthTag(buf: Buffer): Buffer;
    generateCounter(sequenceNumber: number, rolloverCounter: number, ssrc: number, sessionSalt: Buffer): Buffer;
    generateSrtpAuthTag(roc: number, ...buffers: Buffer[]): Buffer;
}
