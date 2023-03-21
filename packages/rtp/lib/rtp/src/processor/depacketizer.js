"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DepacketizeBase = void 0;
const debug_1 = __importDefault(require("debug"));
const __1 = require("..");
const codec_1 = require("../codec");
const helper_1 = require("../helper");
const path = `werift-rtp : packages/rtp/src/processor/depacketizer.ts`;
const log = (0, debug_1.default)(path);
class DepacketizeBase {
    constructor(codec, options = {}) {
        Object.defineProperty(this, "codec", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: codec
        });
        Object.defineProperty(this, "options", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: options
        });
        Object.defineProperty(this, "buffering", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "lastSeqNum", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "frameBroken", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        Object.defineProperty(this, "sequence", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
    }
    processInput(input) {
        const output = [];
        if (!input.rtp) {
            if (input.eol) {
                output.push({ eol: true });
            }
            return output;
        }
        if (this.options.isFinalPacketInSequence) {
            const isFinal = this.checkFinalPacket(input);
            if (isFinal) {
                try {
                    const { data, isKeyframe, sequence, timestamp } = (0, codec_1.dePacketizeRtpPackets)(this.codec, this.buffering.map((b) => b.rtp));
                    if (isKeyframe) {
                        log("isKeyframe", this.codec);
                    }
                    if (!this.frameBroken) {
                        const time = this.buffering.at(-1)?.time ?? 0;
                        output.push({
                            frame: {
                                data,
                                isKeyframe,
                                time,
                                sequence: this.sequence++,
                                rtpSeq: sequence,
                                timestamp,
                            },
                        });
                    }
                    if (this.frameBroken) {
                        this.frameBroken = false;
                    }
                    this.clearBuffer();
                    return output;
                }
                catch (error) {
                    log("error", error, input);
                    this.clearBuffer();
                }
            }
        }
        else {
            try {
                const { data, isKeyframe, sequence, timestamp } = (0, codec_1.dePacketizeRtpPackets)(this.codec, [input.rtp]);
                output.push({
                    frame: {
                        data,
                        isKeyframe,
                        time: input.time,
                        sequence: this.sequence++,
                        rtpSeq: sequence,
                        timestamp,
                    },
                });
                return output;
            }
            catch (error) {
                log("error", error, input);
            }
        }
        return [];
    }
    clearBuffer() {
        this.buffering.forEach((b) => b.rtp.clear());
        this.buffering = [];
    }
    checkFinalPacket({ rtp, time }) {
        if (!this.options.isFinalPacketInSequence) {
            throw new Error("isFinalPacketInSequence not exist");
        }
        const { sequenceNumber } = rtp.header;
        if (this.lastSeqNum != undefined) {
            const expect = (0, __1.uint16Add)(this.lastSeqNum, 1);
            if ((0, __1.uint16Gt)(expect, sequenceNumber)) {
                log("unexpect", { expect, sequenceNumber });
                return false;
            }
            if ((0, __1.uint16Gt)(sequenceNumber, expect)) {
                log("packet lost happened", { expect, sequenceNumber });
                this.frameBroken = true;
                this.clearBuffer();
            }
        }
        this.buffering.push({ rtp, time });
        this.lastSeqNum = sequenceNumber;
        let finalPacket;
        for (const [i, { rtp }] of (0, helper_1.enumerate)(this.buffering)) {
            if (this.options.isFinalPacketInSequence(rtp.header)) {
                finalPacket = i;
                break;
            }
        }
        if (finalPacket == undefined) {
            return false;
        }
        return true;
    }
}
exports.DepacketizeBase = DepacketizeBase;
//# sourceMappingURL=depacketizer.js.map