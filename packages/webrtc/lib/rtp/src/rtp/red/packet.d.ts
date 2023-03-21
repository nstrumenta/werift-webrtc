/// <reference types="node" />
export declare class Red {
    header: RedHeader;
    blocks: {
        block: Buffer;
        blockPT: number;
        /**14bit */
        timestampOffset?: number;
    }[];
    static deSerialize(bufferOrArrayBuffer: Buffer | ArrayBuffer): Red;
    serialize(): Buffer;
}
export declare class RedHeader {
    fields: RedHeaderField[];
    static deSerialize(buf: Buffer): readonly [RedHeader, number];
    serialize(): Buffer;
}
interface RedHeaderField {
    /**ヘッダーの最初のビットは、別のヘッダーブロックが続くかどうかを示す。 1の場合は、さらにヘッダーブロックが続き、0の場合は、これが最後のヘッダーブロックとなります。 */
    fBit: number;
    blockPT: number;
    /**14bit */
    timestampOffset?: number;
    /**10bit */
    blockLength?: number;
}
export {};
