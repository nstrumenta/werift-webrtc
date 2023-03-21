"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NtpTimeCallback = void 0;
const ntpTime_1 = require("./ntpTime");
class NtpTimeCallback extends ntpTime_1.syncRtpBase {
    constructor(clockRate) {
        super(clockRate);
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
exports.NtpTimeCallback = NtpTimeCallback;
//# sourceMappingURL=ntpTimeCallback.js.map