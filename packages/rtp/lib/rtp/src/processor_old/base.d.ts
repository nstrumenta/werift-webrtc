import Event from "rx.mini";
import { RtcpPacket, RtpPacket } from "..";
export declare abstract class Pipeline {
    protected children?: Pipeline | Output;
    private disposer?;
    constructor(streams?: {
        rtpStream?: Event<[RtpPacket]>;
        rtcpStream?: Event<[RtcpPacket]>;
    });
    pipe(children: Pipeline | Output): Pipeline | Output;
    pushRtpPackets(packets: RtpPacket[]): void;
    pushRtcpPackets(packets: RtcpPacket[]): void;
    stop(): void;
}
export declare abstract class Output {
    pushRtpPackets?(packets: RtpPacket[]): void;
    pushRtcpPackets?(packets: RtcpPacket[]): void;
}
