"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DepacketizeCallback = void 0;
const depacketizer_1 = require("./depacketizer");
class DepacketizeCallback extends depacketizer_1.DepacketizeBase {
    constructor(codec, options = {}) {
        super(codec, options);
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
exports.DepacketizeCallback = DepacketizeCallback;
//# sourceMappingURL=depacketizerCallback.js.map