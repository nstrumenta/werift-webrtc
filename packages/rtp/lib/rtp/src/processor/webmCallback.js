"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveToFileSystem = exports.WebmCallback = void 0;
const promises_1 = require("fs/promises");
const src_1 = require("../../../common/src");
const webm_1 = require("./webm");
class WebmCallback extends webm_1.WebmBase {
    constructor(tracks, options = {}) {
        super(tracks, (output) => {
            if (this.cb) {
                this.queue.push(() => this.cb(output));
            }
        }, options);
        Object.defineProperty(this, "cb", {
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
        Object.defineProperty(this, "pipe", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (cb) => {
                this.cb = cb;
                this.start();
            }
        });
        Object.defineProperty(this, "inputAudio", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: this.processAudioInput
        });
        Object.defineProperty(this, "inputVideo", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: this.processVideoInput
        });
    }
}
exports.WebmCallback = WebmCallback;
const saveToFileSystem = (path) => async (value) => {
    if (value.saveToFile) {
        await (0, promises_1.appendFile)(path, value.saveToFile);
    }
    else if (value.eol) {
        const { durationElement } = value.eol;
        const handler = await (0, promises_1.open)(path, "r+");
        await handler.write(durationElement, 0, durationElement.length, webm_1.DurationPosition);
        const meta = await (0, promises_1.stat)(path);
        const resize = (0, webm_1.replaceSegmentSize)(meta.size);
        await handler.write(resize, 0, resize.length, webm_1.SegmentSizePosition);
        await handler.close();
    }
};
exports.saveToFileSystem = saveToFileSystem;
//# sourceMappingURL=webmCallback.js.map