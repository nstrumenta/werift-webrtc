"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebmOutput = void 0;
const src_1 = require("../../../common/src");
const codec_1 = require("../codec");
const webm_1 = require("../container/webm");
class WebmOutput {
    constructor(writer, path, tracks, streams) {
        Object.defineProperty(this, "writer", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: writer
        });
        Object.defineProperty(this, "path", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: path
        });
        Object.defineProperty(this, "tracks", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: tracks
        });
        Object.defineProperty(this, "builder", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "queue", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new src_1.PromiseQueue()
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
        Object.defineProperty(this, "disposer", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
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
        Object.defineProperty(this, "stopped", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        this.builder = new webm_1.WEBMBuilder(tracks);
        tracks.forEach((t) => {
            this.timestamps[t.payloadType] = new TimestampManager(t.clockRate);
        });
        this.queue.push(() => this.init());
        if (streams?.rtpStream) {
            const { unSubscribe } = streams.rtpStream.subscribe((packet) => {
                this.pushRtpPackets([packet]);
            });
            this.disposer = unSubscribe;
        }
    }
    async init() {
        const staticPart = Buffer.concat([
            this.builder.ebmlHeader,
            this.builder.createSegment(),
        ]);
        await this.writer.writeFile(this.path, staticPart);
        this.position += staticPart.length;
        const video = this.tracks.find((t) => t.kind === "video");
        if (video) {
            this.cuePoints.push(new CuePoint(this.builder, video.trackNumber, 0.0, this.position));
        }
        const cluster = this.builder.createCluster(0.0);
        await this.writer.appendFile(this.path, cluster);
        this.position += cluster.length;
    }
    async stop(insertDuration = true) {
        this.stopped = true;
        if (this.disposer) {
            this.disposer();
        }
        if (!insertDuration) {
            return;
        }
        const originStaticPartOffset = Buffer.concat([
            this.builder.ebmlHeader,
            this.builder.createSegment(),
        ]).length;
        const clusters = (await this.writer.readFile(this.path)).slice(originStaticPartOffset);
        const latestTimestamp = Object.values(this.timestamps).sort((a, b) => a.relativeTimestamp - b.relativeTimestamp)[0].relativeTimestamp;
        const duration = this.relativeTimestamp + latestTimestamp;
        const staticPart = Buffer.concat([
            this.builder.ebmlHeader,
            this.builder.createSegment(duration),
        ]);
        // durationを挿入したことによるギャップの解消
        const staticPartGap = staticPart.length - originStaticPartOffset;
        this.cuePoints.forEach((c) => {
            c.position += staticPartGap;
        });
        let cuesSize = 0;
        let cues = this.builder.createCues(this.cuePoints.map((c) => c.build()));
        // cuesの最終的なサイズを再帰的に求める
        while (cuesSize !== cues.length) {
            cuesSize = cues.length;
            this.cuePoints.forEach((cue) => {
                cue.cuesLength += cuesSize;
            });
            cues = this.builder.createCues(this.cuePoints.map((c) => c.build()));
        }
        await this.writer.writeFile(this.path, staticPart);
        await this.writer.appendFile(this.path, cues);
        await this.writer.appendFile(this.path, clusters);
    }
    pushRtpPackets(packets) {
        if (this.stopped)
            return;
        this.queue.push(() => this.onRtpPackets(packets));
    }
    async onRtpPackets(packets) {
        const track = this.tracks.find((t) => t.payloadType === packets[0].header.payloadType);
        if (!track) {
            return;
        }
        const timestampManager = this.timestamps[track.payloadType];
        const { data, isKeyframe } = (0, codec_1.dePacketizeRtpPackets)(track.codec, packets);
        const tailTimestamp = packets.slice(-1)[0].header.timestamp;
        timestampManager.update(tailTimestamp);
        if ((track.kind === "video" &&
            timestampManager.relativeTimestamp > 0 &&
            isKeyframe) ||
            timestampManager.relativeTimestamp > MaxSinged16Int) {
            this.relativeTimestamp += timestampManager.relativeTimestamp;
            const cluster = this.builder.createCluster(this.relativeTimestamp);
            await this.writer.appendFile(this.path, cluster);
            this.cuePoints.push(new CuePoint(this.builder, track.trackNumber, this.relativeTimestamp, this.position));
            this.position += cluster.length;
            Object.values(this.timestamps).forEach((t) => t.reset());
        }
        const block = this.builder.createSimpleBlock(data, isKeyframe, track.trackNumber, timestampManager.relativeTimestamp);
        await this.writer.appendFile(this.path, block);
        this.position += block.length;
        const [cuePoint] = this.cuePoints.slice(-1);
        if (cuePoint) {
            cuePoint.blockNumber++;
        }
    }
}
exports.WebmOutput = WebmOutput;
class TimestampManager {
    constructor(clockRate) {
        Object.defineProperty(this, "clockRate", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: clockRate
        });
        Object.defineProperty(this, "baseTimestamp", {
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
    }
    reset() {
        this.baseTimestamp = undefined;
        this.relativeTimestamp = 0;
    }
    update(tailTimestamp) {
        if (this.baseTimestamp == undefined) {
            this.baseTimestamp = tailTimestamp;
        }
        const rotate = Math.abs(tailTimestamp - this.baseTimestamp) > (Max32Uint / 4) * 3;
        const elapsed = rotate
            ? tailTimestamp + Max32Uint - this.baseTimestamp
            : tailTimestamp - this.baseTimestamp;
        this.relativeTimestamp = (0, src_1.int)((elapsed / this.clockRate) * 1000);
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
const Max32Uint = Number(0x01n << 32n) - 1;
/**32767 */
const MaxSinged16Int = (0x01 << 16) / 2 - 1;
//# sourceMappingURL=webm.js.map