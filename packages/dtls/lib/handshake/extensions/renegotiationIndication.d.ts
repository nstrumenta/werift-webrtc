/// <reference types="node" />
export declare class RenegotiationIndication {
    static type: number;
    static readonly spec: {
        type: number;
        data: number;
    };
    type: number;
    data: number;
    constructor(props?: Partial<RenegotiationIndication>);
    static createEmpty(): RenegotiationIndication;
    static deSerialize(buf: Buffer): RenegotiationIndication;
    serialize(): Buffer;
    get extension(): {
        type: number;
        data: Buffer;
    };
}
