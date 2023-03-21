import Event from "rx.mini";
import { GenericNack, RtpPacket } from "../../../../rtp/src";
import { RTCRtpReceiver } from "../rtpReceiver";
export declare class NackHandler {
    private receiver;
    private newEstSeqNum;
    private _lost;
    private nackLoop;
    readonly onPacketLost: Event<[GenericNack]>;
    mediaSourceSsrc?: number;
    retryCount: number;
    closed: boolean;
    constructor(receiver: RTCRtpReceiver);
    get lostSeqNumbers(): number[];
    getLost(seq: number): number;
    setLost(seq: number, count: number): void;
    removeLost(sequenceNumber: number): void;
    addPacket(packet: RtpPacket): void;
    private pruneLost;
    close(): void;
    private updateRetryCount;
    private sendNack;
}
