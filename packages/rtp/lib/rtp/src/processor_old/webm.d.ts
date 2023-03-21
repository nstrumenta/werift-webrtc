/// <reference types="node" />
/// <reference types="node" />
import { BinaryLike } from "crypto";
import Event from "rx.mini";
import { RtpPacket } from "..";
import { SupportedCodec } from "../container/webm";
import { Output } from "./base";
export interface FileIO {
    writeFile: (path: string, bin: BinaryLike) => Promise<void>;
    appendFile: (path: string, bin: BinaryLike) => Promise<void>;
    readFile: (path: string) => Promise<Buffer>;
}
export declare class WebmOutput implements Output {
    private writer;
    path: string;
    tracks: {
        width?: number;
        height?: number;
        kind: "audio" | "video";
        codec: SupportedCodec;
        clockRate: number;
        payloadType: number;
        trackNumber: number;
    }[];
    private builder;
    private queue;
    private relativeTimestamp;
    private timestamps;
    private disposer?;
    private cuePoints;
    private position;
    stopped: boolean;
    constructor(writer: FileIO, path: string, tracks: {
        width?: number;
        height?: number;
        kind: "audio" | "video";
        codec: SupportedCodec;
        clockRate: number;
        payloadType: number;
        trackNumber: number;
    }[], streams?: {
        rtpStream?: Event<[RtpPacket]>;
    });
    private init;
    stop(insertDuration?: boolean): Promise<void>;
    pushRtpPackets(packets: RtpPacket[]): void;
    private onRtpPackets;
}
