"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JitterBufferBase = void 0;
const debug_1 = __importDefault(require("debug"));
const __1 = require("..");
const srcPath = `werift-rtp : packages/rtp/src/processor/jitterBuffer.ts`;
const log = (0, debug_1.default)(srcPath);
class JitterBufferBase {
    get expectNextSeqNum() {
        return (0, __1.uint16Add)(this.presentSeqNum, 1);
    }
    constructor(clockRate, options = {}) {
        Object.defineProperty(this, "clockRate", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: clockRate
        });
        Object.defineProperty(this, "options", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        /**uint16 */
        Object.defineProperty(this, "presentSeqNum", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "rtpBuffer", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: {}
        });
        this.options = {
            latency: options.latency ?? 200,
            bufferSize: options.bufferSize ?? 10000,
        };
    }
    processInput(input) {
        const output = [];
        if (!input.rtp) {
            if (input.eol) {
                const packets = this.sortAndClearBuffer(this.rtpBuffer);
                for (const rtp of packets) {
                    output.push({ rtp });
                }
                output.push({ eol: true });
            }
            return output;
        }
        const { packets, timeoutSeqNum } = this.processRtp(input.rtp);
        if (timeoutSeqNum != undefined) {
            const isPacketLost = {
                from: this.expectNextSeqNum,
                to: timeoutSeqNum,
            };
            this.presentSeqNum = input.rtp.header.sequenceNumber;
            output.push({ isPacketLost });
            if (packets) {
                for (const rtp of [...packets, input.rtp]) {
                    output.push({ rtp });
                }
            }
            return output;
        }
        else {
            if (packets) {
                for (const rtp of packets) {
                    output.push({ rtp });
                }
                return output;
            }
            return [];
        }
    }
    processRtp(rtp) {
        const { sequenceNumber, timestamp } = rtp.header;
        // init
        if (this.presentSeqNum == undefined) {
            this.presentSeqNum = sequenceNumber;
            return { packets: [rtp] };
        }
        // duplicate
        if ((0, __1.uint16Gte)(this.presentSeqNum, sequenceNumber)) {
            log("duplicate", { sequenceNumber });
            return { nothing: undefined };
        }
        // expect
        if (sequenceNumber === this.expectNextSeqNum) {
            this.presentSeqNum = sequenceNumber;
            const rtpBuffer = this.resolveBuffer((0, __1.uint16Add)(sequenceNumber, 1));
            this.presentSeqNum =
                rtpBuffer.at(-1)?.header.sequenceNumber ?? this.presentSeqNum;
            this.disposeTimeoutPackets(timestamp);
            return { packets: [rtp, ...rtpBuffer] };
        }
        this.pushRtpBuffer(rtp);
        const { latestTimeoutSeqNum, sorted } = this.disposeTimeoutPackets(timestamp);
        if (latestTimeoutSeqNum) {
            return { timeoutSeqNum: latestTimeoutSeqNum, packets: sorted };
        }
        else {
            return { nothing: undefined };
        }
    }
    pushRtpBuffer(rtp) {
        if (Object.values(this.rtpBuffer).length > this.options.bufferSize) {
            log("buffer over flow");
            return;
        }
        // log("pushRtpBuffer", { seq: rtp.header.sequenceNumber });
        this.rtpBuffer[rtp.header.sequenceNumber] = rtp;
    }
    resolveBuffer(seqNumFrom) {
        const resolve = [];
        for (let index = seqNumFrom;; index = (0, __1.uint16Add)(index, 1)) {
            const rtp = this.rtpBuffer[index];
            if (rtp) {
                resolve.push(rtp);
                delete this.rtpBuffer[index];
            }
            else {
                break;
            }
        }
        // if (resolve.length > 0) {
        //   log(
        //     "resolveBuffer",
        //     resolve.map((r) => r.header.sequenceNumber)
        //   );
        // }
        return resolve;
    }
    sortAndClearBuffer(rtpBuffer) {
        const buffer = [];
        for (let index = this.presentSeqNum ?? 0;; index = (0, __1.uint16Add)(index, 1)) {
            const rtp = rtpBuffer[index];
            if (rtp) {
                buffer.push(rtp);
                delete rtpBuffer[index];
            }
            if (Object.values(rtpBuffer).length === 0) {
                break;
            }
        }
        return buffer;
    }
    disposeTimeoutPackets(baseTimestamp) {
        let latestTimeoutSeqNum;
        const packets = Object.values(this.rtpBuffer)
            .map((rtp) => {
            const { timestamp, sequenceNumber } = rtp.header;
            if ((0, __1.uint32Gt)(timestamp, baseTimestamp)) {
                return;
            }
            const elapsedSec = (0, __1.uint32Add)(baseTimestamp, -timestamp) / this.clockRate;
            if (elapsedSec * 1000 > this.options.latency) {
                log("timeout packet", {
                    sequenceNumber,
                    elapsedSec,
                    baseTimestamp,
                    timestamp,
                });
                if (latestTimeoutSeqNum == undefined) {
                    latestTimeoutSeqNum = sequenceNumber;
                }
                // 現在のSeqNumとの差が最も大きいSeqNumを探す
                if ((0, __1.uint16Add)(sequenceNumber, -this.presentSeqNum) >
                    (0, __1.uint16Add)(latestTimeoutSeqNum, -this.presentSeqNum)) {
                    latestTimeoutSeqNum = sequenceNumber;
                }
                const packet = this.rtpBuffer[sequenceNumber];
                delete this.rtpBuffer[sequenceNumber];
                return packet;
            }
        })
            .flatMap((p) => p)
            .filter((p) => p);
        const sorted = this.sortAndClearBuffer(packets.reduce((acc, cur) => {
            acc[cur.header.sequenceNumber] = cur;
            return acc;
        }, {}));
        return { latestTimeoutSeqNum, sorted };
    }
}
exports.JitterBufferBase = JitterBufferBase;
//# sourceMappingURL=jitterBuffer.js.map