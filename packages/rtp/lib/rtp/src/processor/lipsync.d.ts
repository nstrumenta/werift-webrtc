import { CodecFrame } from "./depacketizer";
import { AVProcessor } from "./interface";
export type LipsyncInput = {
    frame?: CodecFrame;
    eol?: boolean;
};
export type LipsyncOutput = {
    frame?: CodecFrame;
    eol?: boolean;
};
export declare class LipsyncBase implements AVProcessor<LipsyncInput> {
    private audioOutput;
    private videoOutput;
    private options;
    bufferLength: number;
    /**ms */
    baseTime?: number;
    audioBuffer: (LipsyncInput & {
        elapsed: number;
        kind: string;
        [key: string]: any;
    })[][];
    videoBuffer: (LipsyncInput & {
        elapsed: number;
        kind: string;
        [key: string]: any;
    })[][];
    stopped: boolean;
    /**ms */
    private interval;
    private started;
    /**ms */
    lastCommited: number;
    constructor(audioOutput: (output: LipsyncOutput) => void, videoOutput: (output: LipsyncOutput) => void, options?: Partial<LipSyncOptions>);
    private start;
    processAudioInput: ({ frame, eol }: LipsyncInput) => void;
    processVideoInput: ({ frame, eol }: LipsyncInput) => void;
}
export interface LipSyncOptions {
    interval: number;
    bufferLength: number;
}
