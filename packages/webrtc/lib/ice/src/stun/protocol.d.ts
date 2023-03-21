/// <reference types="node" />
import { InterfaceAddresses } from "../../../common/src/network";
import { Candidate } from "../candidate";
import { Connection } from "../ice";
import { UdpTransport } from "../transport";
import { Address, Protocol } from "../types/model";
import { Message } from "./message";
import { Transaction } from "./transaction";
export declare class StunProtocol implements Protocol {
    receiver: Connection;
    readonly type = "stun";
    transport: UdpTransport;
    transactions: {
        [key: string]: Transaction;
    };
    get transactionsKeys(): string[];
    localCandidate?: Candidate;
    sentMessage?: Message;
    localAddress?: string;
    private readonly closed;
    constructor(receiver: Connection);
    connectionLost(): void;
    connectionMade: (useIpv4: boolean, portRange?: [number, number], interfaceAddresses?: InterfaceAddresses) => Promise<void>;
    private datagramReceived;
    getExtraInfo(): Address;
    sendStun(message: Message, addr: Address): Promise<void>;
    sendData(data: Buffer, addr: Address): Promise<void>;
    request(request: Message, addr: Address, integrityKey?: Buffer, retransmissions?: number): Promise<[Message, readonly [string, number]]>;
    close(): Promise<void>;
}
