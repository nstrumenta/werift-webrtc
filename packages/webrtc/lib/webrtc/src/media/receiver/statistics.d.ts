import { RtpPacket } from "../../../../rtp/src";
export declare class StreamStatistics {
    base_seq?: number;
    max_seq?: number;
    cycles: number;
    packets_received: number;
    private clockRate;
    jitter_q4: number;
    private last_arrival?;
    private last_timestamp?;
    expected_prior: number;
    received_prior: number;
    constructor(clockRate: number);
    add(packet: RtpPacket, now?: number): void;
    get fraction_lost(): number;
    get jitter(): number;
    get packets_expected(): number;
    get packets_lost(): number;
}
