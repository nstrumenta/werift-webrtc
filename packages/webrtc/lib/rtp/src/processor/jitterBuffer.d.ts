import { Processor } from "./interface";
import { RtpOutput } from "./source";
export type JitterBufferInput = RtpOutput;
export interface JitterBufferOutput extends RtpOutput {
    isPacketLost?: {
        from: number;
        to: number;
    };
}
export declare class JitterBufferBase implements Processor<JitterBufferInput, JitterBufferOutput> {
    clockRate: number;
    private options;
    /**uint16 */
    private presentSeqNum?;
    private rtpBuffer;
    private get expectNextSeqNum();
    constructor(clockRate: number, options?: Partial<JitterBufferOptions>);
    processInput(input: JitterBufferInput): JitterBufferOutput[];
    private processRtp;
    private pushRtpBuffer;
    private resolveBuffer;
    private sortAndClearBuffer;
    private disposeTimeoutPackets;
}
export interface JitterBufferOptions {
    /**milliseconds */
    latency: number;
    bufferSize: number;
}
