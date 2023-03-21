"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RtcpSourceCallback = void 0;
class RtcpSourceCallback {
    constructor() {
        Object.defineProperty(this, "cb", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "input", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (rtcp) => {
                if (this.cb) {
                    this.cb({ rtcp });
                }
            }
        });
    }
    pipe(cb) {
        this.cb = cb;
    }
    stop() {
        if (this.cb) {
            this.cb({ eol: true });
        }
    }
}
exports.RtcpSourceCallback = RtcpSourceCallback;
//# sourceMappingURL=rtcpCallback.js.map