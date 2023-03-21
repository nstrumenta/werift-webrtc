import { RtcpPacket, RtpPacket } from "..";
import { Processor } from "./interface";
export type NtpTimeInput = {
    rtp?: RtpPacket;
    eol?: boolean;
    rtcp?: RtcpPacket;
};
export interface NtpTimeOutput {
    rtp?: RtpPacket;
    /**ms */
    time?: number;
    eol?: boolean;
}
export declare class syncRtpBase implements Processor<NtpTimeInput, NtpTimeOutput> {
    clockRate: number;
    ntpTimestamp?: bigint;
    rtpTimestamp?: number;
    buffer: RtpPacket[];
    constructor(clockRate: number);
    processInput({ rtcp, rtp, eol }: NtpTimeInput): NtpTimeOutput[];
    /**sec */
    private calcNtp;
}
export declare const ntpTime2Time: (ntp: bigint) => number;
