import { RtcpPacket } from "../../rtcp/rtcp";
export interface RtcpOutput {
    rtcp?: RtcpPacket;
    eol?: boolean;
}
export declare class RtcpSourceCallback {
    private cb?;
    constructor();
    pipe(cb: (chunk: RtcpOutput) => void): void;
    input: (rtcp: RtcpPacket) => void;
    stop(): void;
}
