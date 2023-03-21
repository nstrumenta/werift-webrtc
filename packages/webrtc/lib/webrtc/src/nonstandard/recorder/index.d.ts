import { MediaStreamTrack } from "../../media/track";
import { MediaWriter } from "./writer";
export declare class MediaRecorder {
    tracks: MediaStreamTrack[];
    path: string;
    options: Partial<MediaRecorderOptions>;
    writer: MediaWriter;
    ext: string;
    constructor(tracks: MediaStreamTrack[], path: string, options?: Partial<MediaRecorderOptions>);
    addTrack(track: MediaStreamTrack): void;
    start(): Promise<void>;
    stop(): Promise<void>;
}
export interface MediaRecorderOptions {
    width: number;
    height: number;
    jitterBufferLatency: number;
    jitterBufferSize: number;
    waitForKeyframe: boolean;
    defaultDuration: number;
}
