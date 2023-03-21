import Event from "rx.mini";
import { Candidate, Connection, IceOptions } from "../../../ice/src";
export declare class RTCIceTransport {
    private gather;
    readonly id: string;
    connection: Connection;
    state: RTCIceConnectionState;
    readonly onStateChange: Event<["disconnected" | "closed" | "completed" | "new" | "connected" | "failed" | "checking"]>;
    private waitStart?;
    constructor(gather: RTCIceGatherer);
    get iceGather(): RTCIceGatherer;
    get role(): "controlling" | "controlled";
    private setState;
    addRemoteCandidate: (candidate?: IceCandidate) => Promise<void> | undefined;
    setRemoteParams(remoteParameters: RTCIceParameters): void;
    start(): Promise<void>;
    stop(): Promise<void>;
}
export declare const IceTransportStates: readonly ["new", "checking", "connected", "completed", "disconnected", "failed", "closed"];
export type RTCIceConnectionState = (typeof IceTransportStates)[number];
export declare const IceGathererStates: readonly ["new", "gathering", "complete"];
export type IceGathererState = (typeof IceGathererStates)[number];
export declare class RTCIceGatherer {
    private options;
    onIceCandidate: (candidate: IceCandidate) => void;
    gatheringState: IceGathererState;
    readonly onGatheringStateChange: Event<["new" | "complete" | "gathering"]>;
    readonly connection: Connection;
    constructor(options?: Partial<IceOptions>);
    gather(): Promise<void>;
    get localCandidates(): IceCandidate[];
    get localParameters(): RTCIceParameters;
    private setState;
}
export declare function candidateFromIce(c: Candidate): IceCandidate;
export declare function candidateToIce(x: IceCandidate): Candidate;
export declare class RTCIceCandidate {
    candidate: string;
    sdpMid?: string;
    sdpMLineIndex?: number;
    constructor(props: Partial<RTCIceCandidate>);
    static isThis(o: any): true | undefined;
    toJSON(): {
        candidate: string;
        sdpMid: string | undefined;
        sdpMLineIndex: number | undefined;
    };
}
export declare class IceCandidate {
    component: number;
    foundation: string;
    ip: string;
    port: number;
    priority: number;
    protocol: string;
    type: string;
    relatedAddress?: string;
    relatedPort?: number;
    sdpMid?: string;
    sdpMLineIndex?: number;
    tcpType?: string;
    constructor(component: number, foundation: string, ip: string, port: number, priority: number, protocol: string, type: string);
    toJSON(): RTCIceCandidate;
    static fromJSON(data: RTCIceCandidate): IceCandidate | undefined;
}
export declare class RTCIceParameters {
    iceLite: boolean;
    usernameFragment: string;
    password: string;
    constructor(props?: Partial<RTCIceParameters>);
}
