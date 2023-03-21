/// <reference types="node" />
import { RtpPacket } from "../../rtp/rtp";
export interface RtpOutput {
    rtp?: RtpPacket;
    eol?: boolean;
}
export declare class RtpSourceCallback {
    private options;
    private cb?;
    constructor(options?: {
        payloadType?: number;
        clearInvalidPTPacket?: boolean;
    });
    pipe(cb: (chunk: RtpOutput) => void): void;
    input: (packet: Buffer | RtpPacket) => void;
    stop(): void;
}
