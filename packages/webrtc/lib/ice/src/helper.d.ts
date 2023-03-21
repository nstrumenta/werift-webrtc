/// <reference types="node" />
export declare function randomString(length: number): string;
export declare function randomTransactionId(): Buffer;
export declare function bufferXor(a: Buffer, b: Buffer): Buffer;
export declare function difference<T>(x: Set<T>, y: Set<T>): Set<T>;
export declare class PQueue<T> {
    private queue;
    private wait;
    put(v: Promise<T>): void;
    get(): Promise<T>;
}
export declare const future: (pCancel: PCancelable<any>) => {
    cancel: () => any;
    promise: PCancelable<any>;
    done: () => boolean;
};
export type Future = ReturnType<typeof future>;
