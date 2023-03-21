/// <reference types="node" />
import { RtpHeader, RtpPacket } from "..";
import { Processor } from "./interface";
export type DepacketizerInput = {
    rtp?: RtpPacket;
    /**ms */
    time?: number;
    eol?: boolean;
};
export interface DepacketizerOutput {
    frame?: CodecFrame;
    eol?: boolean;
}
export interface CodecFrame {
    data: Buffer;
    isKeyframe: boolean;
    /**ms */
    time: number;
    [key: string]: any;
}
export declare class DepacketizeBase implements Processor<DepacketizerInput, DepacketizerOutput> {
    private codec;
    private options;
    private buffering;
    private lastSeqNum?;
    private frameBroken;
    sequence: number;
    constructor(codec: string, options?: {
        isFinalPacketInSequence?: (header: RtpHeader) => boolean;
    });
    processInput(input: DepacketizerInput): DepacketizerOutput[];
    private clearBuffer;
    private checkFinalPacket;
}
