"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.replaceSegmentSize = exports.SegmentSizePosition = exports.DurationPosition = exports.MaxSinged16Int = exports.Max32Uint = exports.WebmBase = void 0;
const debug_1 = __importDefault(require("debug"));
const ebml_1 = require("../container/ebml");
const webm_1 = require("../container/webm");
const sourcePath = `werift-rtp : packages/rtp/src/processor/webm.ts`;
const log = (0, debug_1.default)(sourcePath);
class WebmBase {
    constructor(tracks, output, options = {}) {
        Object.defineProperty(this, "tracks", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: tracks
        });
        Object.defineProperty(this, "output", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: output
        });
        Object.defineProperty(this, "options", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: options
        });
        Object.defineProperty(this, "builder", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "relativeTimestamp", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "timestamps", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: {}
        });
        Object.defineProperty(this, "cuePoints", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "position", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "clusterCounts", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "stopped", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        Object.defineProperty(this, "elapsed", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "processAudioInput", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (input) => {
                const track = this.tracks.find((t) => t.kind === "audio");
                if (track) {
                    this.processInput(input, track.trackNumber);
                }
            }
        });
        Object.defineProperty(this, "processVideoInput", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (input) => {
                const track = this.tracks.find((t) => t.kind === "video");
                if (track) {
                    this.processInput(input, track.trackNumber);
                }
            }
        });
        this.builder = new webm_1.WEBMBuilder(tracks, options.encryptionKey);
        tracks.forEach((t) => {
            this.timestamps[t.trackNumber] = new ClusterTimestamp();
        });
    }
    processInput(input, trackNumber) {
        if (this.stopped)
            return;
        if (!input.frame) {
            if (input.eol) {
                this.stop();
            }
            return;
        }
        this.onFrameReceived({ ...input.frame, trackNumber });
    }
    start() {
        const staticPart = Buffer.concat([
            this.builder.ebmlHeader,
            this.builder.createSegment(this.options.duration),
        ]);
        this.output({ saveToFile: staticPart, kind: "initial" });
        this.position += staticPart.length;
        const video = this.tracks.find((t) => t.kind === "video");
        if (video) {
            this.cuePoints.push(new CuePoint(this.builder, video.trackNumber, 0.0, this.position));
        }
    }
    onFrameReceived(frame) {
        const track = this.tracks.find((t) => t.trackNumber === frame.trackNumber);
        if (!track) {
            return;
        }
        const timestampManager = this.timestamps[track.trackNumber];
        if (timestampManager.baseTime == undefined) {
            for (const t of Object.values(this.timestamps)) {
                t.baseTime = frame.time;
            }
        }
        // clusterの経過時間
        let elapsed = timestampManager.update(frame.time);
        if (this.clusterCounts === 0) {
            this.createCluster(0.0, 0);
        }
        else if ((track.kind === "video" && frame.isKeyframe) ||
            elapsed > exports.MaxSinged16Int) {
            this.relativeTimestamp += elapsed;
            if (elapsed !== 0) {
                this.cuePoints.push(new CuePoint(this.builder, track.trackNumber, this.relativeTimestamp, this.position));
                this.createCluster(this.relativeTimestamp, elapsed);
                Object.values(this.timestamps).forEach((t) => t.shift(elapsed));
                elapsed = timestampManager.update(frame.time);
            }
        }
        if (elapsed >= 0) {
            this.createSimpleBlock({
                frame,
                trackNumber: track.trackNumber,
                elapsed,
            });
        }
        else {
            log("delayed frame", { elapsed });
        }
    }
    createCluster(timestamp, duration) {
        const cluster = this.builder.createCluster(timestamp);
        this.clusterCounts++;
        this.output({
            saveToFile: Buffer.from(cluster),
            kind: "cluster",
            previousDuration: duration,
        });
        this.position += cluster.length;
        this.elapsed = undefined;
    }
    createSimpleBlock({ frame, trackNumber, elapsed, }) {
        if (this.elapsed == undefined) {
            this.elapsed = elapsed;
        }
        if (elapsed < this.elapsed && this.options.strictTimestamp) {
            log("previous timestamp", {
                elapsed,
                present: this.elapsed,
                trackNumber,
            });
            return;
        }
        this.elapsed = elapsed;
        const block = this.builder.createSimpleBlock(frame.data, frame.isKeyframe, trackNumber, elapsed);
        this.output({ saveToFile: block, kind: "block" });
        this.position += block.length;
        const [cuePoint] = this.cuePoints.slice(-1);
        if (cuePoint) {
            cuePoint.blockNumber++;
        }
    }
    stop() {
        if (this.stopped) {
            return;
        }
        this.stopped = true;
        log("stop");
        const cues = this.builder.createCues(this.cuePoints.map((c) => c.build()));
        this.output({ saveToFile: Buffer.from(cues), kind: "cuePoints" });
        const latestTimestamp = Object.values(this.timestamps).sort((a, b) => a.elapsed - b.elapsed)[0].elapsed;
        const duration = this.relativeTimestamp + latestTimestamp;
        const durationElement = this.builder.createDuration(duration);
        this.output({ eol: { duration, durationElement } });
    }
}
exports.WebmBase = WebmBase;
class ClusterTimestamp {
    constructor() {
        /**ms */
        Object.defineProperty(this, "baseTime", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        /**ms */
        Object.defineProperty(this, "elapsed", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "offset", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
    }
    shift(
    /**ms */
    elapsed) {
        this.offset += elapsed;
    }
    update(
    /**ms */
    time) {
        if (this.baseTime == undefined) {
            throw new Error("baseTime not exist");
        }
        this.elapsed = time - this.baseTime - this.offset;
        return this.elapsed;
    }
}
class CuePoint {
    constructor(builder, trackNumber, relativeTimestamp, position) {
        Object.defineProperty(this, "builder", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: builder
        });
        Object.defineProperty(this, "trackNumber", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: trackNumber
        });
        Object.defineProperty(this, "relativeTimestamp", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: relativeTimestamp
        });
        Object.defineProperty(this, "position", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: position
        });
        /**
         * cuesの後のclusterのあるべき位置
         * cuesはclusterの前に挿入される
         */
        Object.defineProperty(this, "cuesLength", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "blockNumber", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
    }
    build() {
        return this.builder.createCuePoint(this.relativeTimestamp, this.trackNumber, this.position - 48 + this.cuesLength, this.blockNumber);
    }
}
/**4294967295 */
exports.Max32Uint = Number(0x01n << 32n) - 1;
/**32767 */
exports.MaxSinged16Int = (0x01 << 16) / 2 - 1;
exports.DurationPosition = 0x83;
exports.SegmentSizePosition = 0x40;
function replaceSegmentSize(totalFileSize) {
    const bodySize = totalFileSize - exports.SegmentSizePosition;
    const resize = [
        ...(0, ebml_1.vintEncode)((0, ebml_1.numberToByteArray)(bodySize, (0, ebml_1.getEBMLByteLength)(bodySize))),
    ];
    const todoFill = 8 - resize.length - 2;
    if (todoFill > 0) {
        resize.push(0xec);
        if (todoFill > 1) {
            const voidSize = (0, ebml_1.vintEncode)((0, ebml_1.numberToByteArray)(todoFill, (0, ebml_1.getEBMLByteLength)(todoFill)));
            [...voidSize].forEach((i) => resize.push(i));
        }
    }
    return Buffer.from(resize);
}
exports.replaceSegmentSize = replaceSegmentSize;
//# sourceMappingURL=webm.js.map