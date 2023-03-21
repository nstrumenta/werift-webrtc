import Event from "rx.mini";
import { RTCDtlsTransport } from "..";
import { Kind } from "../types/domain";
import { RTCRtpCodecParameters, RTCRtpHeaderExtensionParameters } from "./parameters";
import { RTCRtpReceiver } from "./rtpReceiver";
import { RTCRtpSender } from "./rtpSender";
import { MediaStreamTrack } from "./track";
export declare class RTCRtpTransceiver {
    readonly kind: Kind;
    receiver: RTCRtpReceiver;
    sender: RTCRtpSender;
    /**RFC 8829 4.2.4.  direction the transceiver was initialized with */
    private _direction;
    readonly id: string;
    readonly onTrack: Event<[MediaStreamTrack, RTCRtpTransceiver]>;
    mid?: string;
    mLineIndex?: number;
    /**should not be reused because it has been used for sending before. */
    usedForSender: boolean;
    private _currentDirection?;
    offerDirection: Direction;
    _codecs: RTCRtpCodecParameters[];
    set codecs(codecs: RTCRtpCodecParameters[]);
    get codecs(): RTCRtpCodecParameters[];
    headerExtensions: RTCRtpHeaderExtensionParameters[];
    options: Partial<TransceiverOptions>;
    stopping: boolean;
    stopped: boolean;
    constructor(kind: Kind, dtlsTransport: RTCDtlsTransport, receiver: RTCRtpReceiver, sender: RTCRtpSender, 
    /**RFC 8829 4.2.4.  direction the transceiver was initialized with */
    _direction: Direction);
    get dtlsTransport(): RTCDtlsTransport;
    /**RFC 8829 4.2.4. setDirectionに渡された最後の値を示します */
    get direction(): "inactive" | "sendonly" | "recvonly" | "sendrecv";
    setDirection(direction: Direction): void;
    /**RFC 8829 4.2.5. last negotiated direction */
    get currentDirection(): Direction | undefined;
    setCurrentDirection(direction: Direction | undefined): void;
    setDtlsTransport(dtls: RTCDtlsTransport): void;
    get msid(): string;
    addTrack(track: MediaStreamTrack): void;
    stop(): void;
    getPayloadType(mimeType: string): number | undefined;
}
export declare const Inactive = "inactive";
export declare const Sendonly = "sendonly";
export declare const Recvonly = "recvonly";
export declare const Sendrecv = "sendrecv";
export declare const Directions: readonly ["inactive", "sendonly", "recvonly", "sendrecv"];
export type Direction = (typeof Directions)[number];
type SimulcastDirection = "send" | "recv";
export interface TransceiverOptions {
    direction: Direction;
    simulcast: {
        direction: SimulcastDirection;
        rid: string;
    }[];
}
export {};
