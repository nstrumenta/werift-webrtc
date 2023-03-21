/// <reference types="node" />
import EventEmitter from "events";
export declare function enumerate<T>(arr: T[]): [number, T][];
export declare function divide(from: string, split: string): [string, string];
export declare class PromiseQueue {
    queue: {
        promise: () => Promise<any>;
        done: () => void;
    }[];
    running: boolean;
    push: (promise: () => Promise<any>) => Promise<void>;
    private run;
}
export declare class EventTarget extends EventEmitter {
    addEventListener: (type: string, listener: (...args: any[]) => void) => void;
    removeEventListener: (type: string, listener: (...args: any[]) => void) => void;
}
