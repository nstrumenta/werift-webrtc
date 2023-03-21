import { RtpHeader } from "..";
import { DepacketizeBase, DepacketizerInput, DepacketizerOutput } from "./depacketizer";
export declare class DepacketizeCallback extends DepacketizeBase {
    private cb;
    constructor(codec: string, options?: {
        waitForKeyframe?: boolean;
        isFinalPacketInSequence?: (header: RtpHeader) => boolean;
    });
    pipe: (cb: (input: DepacketizerOutput) => void) => this;
    input: (input: DepacketizerInput) => void;
}
