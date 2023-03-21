"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebmFactory = void 0;
const promises_1 = require("fs/promises");
const rx_mini_1 = require("rx.mini");
const __1 = require("../../..");
const _1 = require(".");
const sourcePath = "packages/webrtc/src/nonstandard/recorder/writer/webm.ts";
class WebmFactory extends _1.MediaWriter {
    constructor() {
        super(...arguments);
        Object.defineProperty(this, "rtpSources", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "unSubscribers", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new rx_mini_1.EventDisposer()
        });
    }
    async start(tracks) {
        await (0, promises_1.unlink)(this.path).catch((e) => e);
        const inputTracks = tracks.map((track, i) => {
            const trackNumber = i + 1;
            const payloadType = track.codec.payloadType;
            if (track.kind === "video") {
                const codec = (() => {
                    switch (track.codec?.name.toLowerCase()) {
                        case "vp8":
                            return "VP8";
                        case "vp9":
                            return "VP9";
                        case "h264":
                            return "MPEG4/ISO/AVC";
                        case "av1x":
                            return "AV1";
                        default:
                            throw new __1.WeriftError({
                                message: "unsupported codec",
                                payload: { track, path: sourcePath },
                            });
                    }
                })();
                return {
                    kind: "video",
                    codec,
                    clockRate: 90000,
                    trackNumber,
                    width: this.options.width,
                    height: this.options.height,
                    payloadType,
                    track,
                };
            }
            else {
                return {
                    kind: "audio",
                    codec: "OPUS",
                    clockRate: 48000,
                    trackNumber,
                    payloadType,
                    track,
                };
            }
        });
        const webm = new __1.WebmStream(inputTracks, {
            duration: this.options.defaultDuration ?? 1000 * 60 * 60 * 24,
        });
        this.rtpSources = inputTracks.map(({ track, clockRate, codec }) => {
            const rtpSource = new __1.RtpSourceStream();
            track.onReceiveRtp
                .subscribe((rtp) => {
                rtpSource.push(rtp.clone());
            })
                .disposer(this.unSubscribers);
            // const jitterBuffer = jitterBufferTransformer(clockRate, {
            //   latency: this.options.jitterBufferLatency,
            //   bufferSize: this.options.jitterBufferSize,
            // });
            if (track.kind === "video") {
                rtpSource.readable
                    // .pipeThrough(jitterBuffer)
                    .pipeThrough((0, __1.depacketizeTransformer)(codec, {
                    waitForKeyframe: this.options.waitForKeyframe,
                    isFinalPacketInSequence: (h) => h.marker,
                }))
                    .pipeTo(webm.videoStream);
            }
            else {
                rtpSource.readable
                    // .pipeThrough(jitterBuffer)
                    .pipeThrough((0, __1.depacketizeTransformer)(codec))
                    .pipeTo(webm.audioStream);
            }
            return rtpSource;
        });
        const reader = webm.webmStream.getReader();
        const readChunk = async ({ value, done, }) => {
            if (done)
                return;
            if (value.saveToFile) {
                await (0, promises_1.appendFile)(this.path, value.saveToFile);
            }
            else if (value.eol) {
                const { durationElement } = value.eol;
                const handler = await (0, promises_1.open)(this.path, "r+");
                await handler.write(durationElement, 0, durationElement.length, 83);
                await handler.close();
            }
            reader.read().then(readChunk);
        };
        reader.read().then(readChunk);
    }
    async stop() {
        await Promise.all(this.rtpSources.map((r) => r.stop()));
        this.unSubscribers.dispose();
    }
}
exports.WebmFactory = WebmFactory;
const supportedVideoCodecs = ["h264", "vp8", "vp9", "av1x"];
//# sourceMappingURL=webm.js.map