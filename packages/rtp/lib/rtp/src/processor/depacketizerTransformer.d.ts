/// <reference types="node" />
import { TransformStream } from "stream/web";
import { RtpHeader } from "..";
import { DepacketizerInput, DepacketizerOutput } from "./depacketizer";
export declare const depacketizeTransformer: (codec: string, options?: {
    waitForKeyframe?: boolean | undefined;
    isFinalPacketInSequence?: ((header: RtpHeader) => boolean) | undefined;
} | undefined) => TransformStream<DepacketizerInput, DepacketizerOutput>;
