"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JitterBufferCallback = void 0;
const jitterBuffer_1 = require("./jitterBuffer");
class JitterBufferCallback extends jitterBuffer_1.JitterBufferBase {
    constructor(clockRate, options = {}) {
        super(clockRate, options);
        Object.defineProperty(this, "clockRate", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: clockRate
        });
        Object.defineProperty(this, "cb", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "pipe", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (cb) => {
                this.cb = cb;
                return this;
            }
        });
        Object.defineProperty(this, "input", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (input) => {
                for (const output of this.processInput(input)) {
                    this.cb(output);
                }
            }
        });
    }
}
exports.JitterBufferCallback = JitterBufferCallback;
//# sourceMappingURL=jitterBufferCallback.js.map