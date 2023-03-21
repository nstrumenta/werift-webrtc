/// <reference types="node" />
import { SupportedCodec } from "../container/webm";
export type WebmInput = {
    frame?: {
        data: Buffer;
        isKeyframe: boolean;
        /**ms */
        time: number;
    };
    eol?: boolean;
};
export type WebmOutput = {
    saveToFile?: Buffer;
    kind?: "initial" | "cluster" | "block" | "cuePoints";
    previousDuration?: number;
    eol?: {
        /**ms */
        duration: number;
        durationElement: Uint8Array;
    };
};
export interface WebmOption {
    /**ms */
    duration?: number;
    encryptionKey?: Buffer;
    strictTimestamp?: boolean;
}
export declare class WebmBase {
    tracks: {
        width?: number;
        height?: number;
        kind: "audio" | "video";
        codec: SupportedCodec;
        clockRate: number;
        trackNumber: number;
    }[];
    private output;
    private options;
    private builder;
    private relativeTimestamp;
    private timestamps;
    private cuePoints;
    private position;
    private clusterCounts;
    stopped: boolean;
    elapsed?: number;
    constructor(tracks: {
        width?: number;
        height?: number;
        kind: "audio" | "video";
        codec: SupportedCodec;
        clockRate: number;
        trackNumber: number;
    }[], output: (output: WebmOutput) => void, options?: WebmOption);
    private processInput;
    processAudioInput: (input: WebmInput) => void;
    processVideoInput: (input: WebmInput) => void;
    protected start(): void;
    private onFrameReceived;
    private createCluster;
    private createSimpleBlock;
    private stop;
}
/**4294967295 */
export declare const Max32Uint: number;
/**32767 */
export declare const MaxSinged16Int: number;
export declare const DurationPosition = 131;
export declare const SegmentSizePosition = 64;
export declare function replaceSegmentSize(totalFileSize: number): Buffer;
