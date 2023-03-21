import { LipsyncBase, LipSyncOptions, LipsyncOutput } from "./lipsync";
export declare class LipsyncCallback extends LipsyncBase {
    private audioCb;
    private videoCb;
    constructor(options?: Partial<LipSyncOptions>);
    pipeAudio: (cb: (input: LipsyncOutput) => void) => void;
    pipeVideo: (cb: (input: LipsyncOutput) => void) => void;
    inputAudio: ({ frame, eol }: import("./lipsync").LipsyncInput) => void;
    inputVideo: ({ frame, eol }: import("./lipsync").LipsyncInput) => void;
}
