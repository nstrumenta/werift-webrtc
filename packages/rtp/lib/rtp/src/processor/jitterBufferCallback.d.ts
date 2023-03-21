import { JitterBufferBase, JitterBufferInput, JitterBufferOptions, JitterBufferOutput } from "./jitterBuffer";
export declare class JitterBufferCallback extends JitterBufferBase {
    clockRate: number;
    private cb;
    constructor(clockRate: number, options?: Partial<JitterBufferOptions>);
    pipe: (cb: (input: JitterBufferOutput) => void) => this;
    input: (input: JitterBufferInput) => void;
}
