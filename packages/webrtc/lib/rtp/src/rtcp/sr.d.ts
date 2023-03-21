/// <reference types="node" />
import { RtcpReceiverInfo } from "./rr";
export declare class RtcpSrPacket {
    ssrc: number;
    senderInfo: RtcpSenderInfo;
    reports: RtcpReceiverInfo[];
    static readonly type = 200;
    readonly type = 200;
    constructor(props: Pick<RtcpSrPacket, "senderInfo"> & Partial<RtcpSrPacket>);
    serialize(): Buffer;
    static deSerialize(payload: Buffer, count: number): RtcpSrPacket;
}
export declare class RtcpSenderInfo {
    ntpTimestamp: bigint;
    rtpTimestamp: number;
    packetCount: number;
    octetCount: number;
    constructor(props?: Partial<RtcpSenderInfo>);
    serialize(): Buffer;
    static deSerialize(data: Buffer): RtcpSenderInfo;
}
