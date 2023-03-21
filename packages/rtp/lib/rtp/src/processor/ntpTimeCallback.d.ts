import { NtpTimeInput, NtpTimeOutput, syncRtpBase as NtpTimeBase } from "./ntpTime";
export declare class NtpTimeCallback extends NtpTimeBase {
    private cb;
    constructor(clockRate: number);
    pipe: (cb: (input: NtpTimeOutput) => void) => this;
    input: (input: NtpTimeInput) => void;
}
