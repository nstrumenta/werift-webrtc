/// <reference types="node" />
import { Event } from "rx.mini";
import { InterfaceAddresses } from "../../common/src/network";
import { Candidate } from "./candidate";
import { DnsLookup } from "./dns/lookup";
import { Future } from "./helper";
import { Message } from "./stun/message";
import { Address, Protocol } from "./types/model";
export declare class Connection {
    iceControlling: boolean;
    localUserName: string;
    localPassword: string;
    remotePassword: string;
    remoteUsername: string;
    remoteIsLite: boolean;
    checkList: CandidatePair[];
    localCandidates: Candidate[];
    stunServer?: Address;
    turnServer?: Address;
    useIpv4: boolean;
    useIpv6: boolean;
    options: IceOptions;
    remoteCandidatesEnd: boolean;
    /**コンポーネントはデータストリームの一部です. データストリームには複数のコンポーネントが必要な場合があり、
     * データストリーム全体が機能するには、それぞれが機能する必要があります.
     *  RTP / RTCPデータストリームの場合、RTPとRTCPが同じポートで多重化されていない限り、データストリームごとに2つのコンポーネントがあります.
     * 1つはRTP用、もう1つはRTCP用です. コンポーネントには候補ペアがあり、他のコンポーネントでは使用できません.  */
    _components: Set<number>;
    _localCandidatesEnd: boolean;
    _tieBreaker: BigInt;
    state: IceState;
    dnsLookup?: DnsLookup;
    readonly onData: Event<[Buffer, number]>;
    readonly stateChanged: Event<[IceState]>;
    private _remoteCandidates;
    private nominated;
    get nominatedKeys(): string[];
    private nominating;
    private checkListDone;
    private checkListState;
    private earlyChecks;
    private localCandidatesStart;
    private protocols;
    private queryConsentHandle?;
    private promiseGatherCandidates?;
    constructor(iceControlling: boolean, options?: Partial<IceOptions>);
    setRemoteParams({ iceLite, usernameFragment, password, }: {
        iceLite: boolean;
        usernameFragment: string;
        password: string;
    }): void;
    gatherCandidates(cb?: (candidate: Candidate) => void): Promise<void>;
    private getComponentCandidates;
    connect(): Promise<void>;
    private unfreezeInitial;
    private schedulingChecks;
    private queryConsent;
    close(): Promise<void>;
    private setState;
    addRemoteCandidate(remoteCandidate: Candidate | undefined): Promise<void>;
    send: (data: Buffer) => Promise<void>;
    private sendTo;
    getDefaultCandidate(component: number): Candidate | undefined;
    requestReceived(message: Message, addr: Address, protocol: Protocol, rawData: Buffer): void;
    dataReceived(data: Buffer, component: number): void;
    set remoteCandidates(value: Candidate[]);
    get remoteCandidates(): Candidate[];
    private pruneComponents;
    private sortCheckList;
    private findPair;
    private setPairState;
    private switchRole;
    resetNominatedPair(): void;
    private checkComplete;
    checkStart: (pair: CandidatePair) => any;
    checkIncoming(message: Message, addr: Address, protocol: Protocol): void;
    private pairRemoteCandidate;
    private buildRequest;
    private respondError;
}
export declare class CandidatePair {
    protocol: Protocol;
    remoteCandidate: Candidate;
    handle?: Future;
    nominated: boolean;
    remoteNominated: boolean;
    private _state;
    get state(): CandidatePairState;
    toJSON(): {
        protocol: string;
        remoteAddr: readonly [string, number];
    };
    constructor(protocol: Protocol, remoteCandidate: Candidate);
    updateState(state: CandidatePairState): void;
    get localCandidate(): Candidate;
    get remoteAddr(): Address;
    get component(): number;
}
export declare enum CandidatePairState {
    FROZEN = 0,
    WAITING = 1,
    IN_PROGRESS = 2,
    SUCCEEDED = 3,
    FAILED = 4
}
type IceState = "disconnected" | "closed" | "completed" | "new" | "connected";
export interface IceOptions {
    components: number;
    stunServer?: Address;
    turnServer?: Address;
    turnUsername?: string;
    turnPassword?: string;
    turnSsl?: boolean;
    turnTransport?: string;
    forceTurn?: boolean;
    useIpv4: boolean;
    useIpv6: boolean;
    portRange?: [number, number];
    interfaceAddresses?: InterfaceAddresses;
    additionalHostAddresses?: string[];
    filterStunResponse?: (message: Message, addr: Address, protocol: Protocol) => boolean;
}
export declare function validateRemoteCandidate(candidate: Candidate): Candidate;
export declare function sortCandidatePairs(pairs: CandidatePair[], iceControlling: boolean): void;
export declare function candidatePairPriority(local: Candidate, remote: Candidate, iceControlling: boolean): number;
export declare function getHostAddresses(useIpv4: boolean, useIpv6: boolean): string[];
export declare function serverReflexiveCandidate(protocol: Protocol, stunServer: Address): Promise<Candidate | undefined>;
export declare function validateAddress(addr?: Address): Address | undefined;
export {};
