/// <reference types="node" />
export type Extension = {
    id: number;
    payload: Buffer;
};
export declare const ExtensionProfiles: {
    readonly OneByte: 48862;
    readonly TwoByte: 4096;
};
type ExtensionProfile = (typeof ExtensionProfiles)[keyof typeof ExtensionProfiles];
export declare class RtpHeader {
    version: number;
    padding: boolean;
    paddingSize: number;
    extension: boolean;
    marker: boolean;
    payloadOffset: number;
    payloadType: number;
    /**16bit */
    sequenceNumber: number;
    /**32bit microsec (milli/1000) */
    timestamp: number;
    ssrc: number;
    csrcLength: number;
    csrc: number[];
    extensionProfile: ExtensionProfile;
    /**deserialize only */
    extensionLength?: number;
    extensions: Extension[];
    constructor(props?: Partial<RtpHeader>);
    static deSerialize(rawPacket: Buffer): RtpHeader;
    get serializeSize(): number;
    serialize(size: number): Buffer;
}
export declare class RtpPacket {
    header: RtpHeader;
    payload: Buffer;
    constructor(header: RtpHeader, payload: Buffer);
    get serializeSize(): number;
    clone(): RtpPacket;
    serialize(): Buffer;
    static deSerialize(buf: Buffer): RtpPacket;
    clear(): void;
}
export {};
