/// <reference types="node" />
import Event from "rx.mini";
import { InterfaceAddresses } from "../../../common/src/network";
import { Candidate } from "../candidate";
import { Future } from "../helper";
import { Connection } from "../ice";
import { Message } from "../stun/message";
import { Transaction } from "../stun/transaction";
import { Transport } from "../transport";
import { Address, Protocol } from "../types/model";
declare class TurnTransport implements Protocol {
    turn: TurnClient;
    readonly type = "turn";
    localCandidate: Candidate;
    receiver?: Connection;
    constructor(turn: TurnClient);
    private datagramReceived;
    request(request: Message, addr: Address, integrityKey?: Buffer): any;
    connectionMade(): Promise<void>;
    sendData(data: Buffer, addr: Address): Promise<void>;
    sendStun(message: Message, addr: Address): Promise<void>;
}
declare class TurnClient implements Protocol {
    server: Address;
    username: string;
    password: string;
    lifetime: number;
    transport: Transport;
    type: string;
    readonly onData: Event<[Buffer, readonly [string, number]]>;
    transactions: {
        [hexId: string]: Transaction;
    };
    integrityKey?: Buffer;
    nonce?: Buffer;
    realm?: string;
    relayedAddress: Address;
    mappedAddress: Address;
    refreshHandle?: Future;
    channelNumber: number;
    channel?: {
        number: number;
        address: Address;
    };
    localCandidate: Candidate;
    onDatagramReceived: (data: Buffer, addr: Address) => void;
    private channelBinding?;
    constructor(server: Address, username: string, password: string, lifetime: number, transport: Transport);
    connectionMade(): Promise<void>;
    private handleChannelData;
    private handleSTUNMessage;
    private datagramReceived;
    connect(): Promise<void>;
    createPermission(peerAddress: Address): Promise<Message>;
    refresh: () => any;
    request(request: Message, addr: Address): Promise<[Message, Address]>;
    sendData(data: Buffer, addr: Address): Promise<void>;
    private getChannel;
    private channelBind;
    sendStun(message: Message, addr: Address): void;
}
export declare function createTurnEndpoint(serverAddr: Address, username: string, password: string, { lifetime, portRange, interfaceAddresses, }: {
    lifetime?: number;
    ssl?: boolean;
    transport?: "udp";
    portRange?: [number, number];
    interfaceAddresses?: InterfaceAddresses;
}): Promise<TurnTransport>;
export declare function makeIntegrityKey(username: string, realm: string, password: string): Buffer;
export {};
