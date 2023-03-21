"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LipsyncBase = void 0;
const src_1 = require("../../../common/src");
class LipsyncBase {
    constructor(audioOutput, videoOutput, options = {}) {
        Object.defineProperty(this, "audioOutput", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: audioOutput
        });
        Object.defineProperty(this, "videoOutput", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: videoOutput
        });
        Object.defineProperty(this, "options", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: options
        });
        Object.defineProperty(this, "bufferLength", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        /**ms */
        Object.defineProperty(this, "baseTime", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "audioBuffer", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "videoBuffer", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "stopped", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        /**ms */
        Object.defineProperty(this, "interval", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "started", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        /**ms */
        Object.defineProperty(this, "lastCommited", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "processAudioInput", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: ({ frame, eol }) => {
                if (!frame) {
                    this.stopped = true;
                    this.audioOutput({ eol });
                    return;
                }
                if (this.stopped) {
                    return;
                }
                if (this.baseTime == undefined) {
                    this.baseTime = frame.time;
                }
                /**ms */
                const elapsed = frame.time - this.baseTime;
                if (elapsed < 0 || elapsed < this.lastCommited) {
                    return;
                }
                const index = (0, src_1.int)(elapsed / this.interval) % this.bufferLength;
                this.audioBuffer[index].push({
                    frame,
                    elapsed,
                    kind: "audio",
                    seq: frame.sequence,
                });
                this.start();
            }
        });
        Object.defineProperty(this, "processVideoInput", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: ({ frame, eol }) => {
                if (!frame) {
                    this.stopped = true;
                    this.videoOutput({ eol });
                    return;
                }
                if (this.stopped) {
                    return;
                }
                if (this.baseTime == undefined) {
                    this.baseTime = frame.time;
                }
                /**ms */
                const elapsed = frame.time - this.baseTime;
                if (elapsed < 0 || elapsed < this.lastCommited) {
                    return;
                }
                const index = (0, src_1.int)(elapsed / this.interval) % this.bufferLength;
                this.videoBuffer[index].push({
                    frame,
                    elapsed,
                    kind: "video",
                    seq: frame.sequence,
                });
                this.start();
            }
        });
        this.bufferLength = this.options.bufferLength ?? 50;
        this.audioBuffer = [...new Array(this.bufferLength)].map(() => []);
        this.videoBuffer = [...new Array(this.bufferLength)].map(() => []);
        this.interval = this.options.interval ?? 500;
    }
    start() {
        // 2列目にカーソルが移ってから処理を始めることで1列目の処理を完了できる
        if ([...this.audioBuffer[1], ...this.videoBuffer[1]].length === 0) {
            return;
        }
        if (this.started) {
            return;
        }
        this.started = true;
        let index = 0;
        setInterval(() => {
            const joined = [
                ...this.audioBuffer[index],
                ...this.videoBuffer[index],
            ].filter((b) => b.elapsed >= this.lastCommited);
            const sorted = joined.sort((a, b) => a.frame.time - b.frame.time);
            this.audioBuffer[index] = [];
            this.videoBuffer[index] = [];
            for (const output of sorted) {
                if (output.kind === "audio") {
                    this.audioOutput(output);
                }
                else {
                    this.videoOutput(output);
                }
                this.lastCommited = output.elapsed;
            }
            index++;
            if (index === this.bufferLength) {
                index = 0;
            }
        }, this.interval);
    }
}
exports.LipsyncBase = LipsyncBase;
//# sourceMappingURL=lipsync.js.map