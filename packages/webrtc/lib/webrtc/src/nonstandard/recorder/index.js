"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MediaRecorder = void 0;
const webm_1 = require("./writer/webm");
class MediaRecorder {
    constructor(tracks, path, options = {}) {
        Object.defineProperty(this, "tracks", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: tracks
        });
        Object.defineProperty(this, "path", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: path
        });
        Object.defineProperty(this, "options", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: options
        });
        Object.defineProperty(this, "writer", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "ext", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.ext = path.split(".").slice(-1)[0];
        this.writer = (() => {
            switch (this.ext) {
                case "webm":
                    return new webm_1.WebmFactory(path, options);
                default:
                    throw new Error();
            }
        })();
    }
    addTrack(track) {
        this.tracks.push(track);
    }
    async start() {
        await this.writer.start(this.tracks);
    }
    async stop() {
        await this.writer.stop();
    }
}
exports.MediaRecorder = MediaRecorder;
//# sourceMappingURL=index.js.map