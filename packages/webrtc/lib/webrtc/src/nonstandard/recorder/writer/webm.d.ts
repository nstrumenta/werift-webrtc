import { EventDisposer } from "rx.mini";
import { MediaStreamTrack, RtpSourceStream } from "../../..";
import { MediaWriter } from ".";
export declare class WebmFactory extends MediaWriter {
    rtpSources: RtpSourceStream[];
    unSubscribers: EventDisposer;
    start(tracks: MediaStreamTrack[]): Promise<void>;
    stop(): Promise<void>;
}
