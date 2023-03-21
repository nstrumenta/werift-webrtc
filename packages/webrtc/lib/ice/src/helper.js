"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.future = exports.PQueue = exports.difference = exports.bufferXor = exports.randomTransactionId = exports.randomString = void 0;
const crypto_1 = require("crypto");
const debug_1 = __importDefault(require("debug"));
const rx_mini_1 = require("rx.mini");
const log = (0, debug_1.default)("werift-ice:packages/ice/src/helper.ts");
function randomString(length) {
    return (0, crypto_1.randomBytes)(length).toString("hex").substring(0, length);
}
exports.randomString = randomString;
function randomTransactionId() {
    return (0, crypto_1.randomBytes)(12);
}
exports.randomTransactionId = randomTransactionId;
function bufferXor(a, b) {
    if (a.length !== b.length) {
        throw new TypeError("[webrtc-stun] You can not XOR buffers which length are different");
    }
    const length = a.length;
    const buffer = Buffer.allocUnsafe(length);
    for (let i = 0; i < length; i++) {
        buffer[i] = a[i] ^ b[i];
    }
    return buffer;
}
exports.bufferXor = bufferXor;
function difference(x, y) {
    return new Set([...x].filter((e) => !y.has(e)));
}
exports.difference = difference;
// infinite size queue
class PQueue {
    constructor() {
        Object.defineProperty(this, "queue", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "wait", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new rx_mini_1.Event()
        });
    }
    put(v) {
        this.queue.push(v);
        if (this.queue.length === 1) {
            this.wait.execute(v);
        }
    }
    get() {
        const v = this.queue.shift();
        if (!v) {
            return new Promise((r) => {
                this.wait.subscribe((v) => {
                    this.queue.shift();
                    r(v);
                });
            });
        }
        return v;
    }
}
exports.PQueue = PQueue;
const future = (pCancel) => {
    const state = { done: false };
    const cancel = () => pCancel.cancel();
    const done = () => state.done;
    pCancel
        .then(() => {
        state.done = true;
    })
        .catch((error) => {
        if (error !== "cancel") {
            log("future", error);
        }
    });
    return { cancel, promise: pCancel, done };
};
exports.future = future;
//# sourceMappingURL=helper.js.map