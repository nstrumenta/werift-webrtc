"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Output = exports.Pipeline = void 0;
class Pipeline {
    constructor(streams) {
        Object.defineProperty(this, "children", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "disposer", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        const disposers = [];
        {
            const { unSubscribe } = streams?.rtpStream?.subscribe?.((packet) => {
                this.pushRtpPackets([packet]);
            }) ?? {};
            disposers.push(unSubscribe);
        }
        {
            const { unSubscribe } = streams?.rtcpStream?.subscribe?.((packet) => {
                this.pushRtcpPackets([packet]);
            }) ?? {};
            disposers.push(unSubscribe);
        }
        this.disposer = () => {
            disposers.forEach((d) => d?.());
        };
    }
    pipe(children) {
        this.children = children;
        return this;
    }
    pushRtpPackets(packets) { }
    pushRtcpPackets(packets) { }
    stop() {
        this.disposer?.();
    }
}
exports.Pipeline = Pipeline;
class Output {
    pushRtpPackets(packets) { }
    pushRtcpPackets(packets) { }
}
exports.Output = Output;
//# sourceMappingURL=base.js.map