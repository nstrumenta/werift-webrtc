"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSelfSignedCertificate = exports.RtpBuilder = exports.parseIceServers = exports.compactNtp = exports.ntpTime = exports.timestampSeconds = exports.milliTime = exports.microTime = exports.reverseDirection = exports.andDirection = exports.reverseSimulcastDirection = exports.isRtcp = exports.isMedia = exports.isDtls = exports.fingerprint = void 0;
/* eslint-disable prefer-const */
const crypto_1 = require("crypto");
const debug_1 = __importDefault(require("debug"));
const perf_hooks_1 = require("perf_hooks");
const src_1 = require("../../common/src");
const cipher_1 = require("../../dtls/src/context/cipher");
const src_2 = require("../../rtp/src");
const rtpTransceiver_1 = require("./media/rtpTransceiver");
const now = require("nano-time");
const log = (0, debug_1.default)("werift:packages/webrtc/src/utils.ts");
function fingerprint(file, hashName) {
    const upper = (s) => s.toUpperCase();
    const colon = (s) => s.match(/(.{2})/g).join(":");
    const hash = (0, crypto_1.createHash)(hashName).update(file).digest("hex");
    return colon(upper(hash));
}
exports.fingerprint = fingerprint;
function isDtls(buf) {
    const firstByte = buf[0];
    return firstByte > 19 && firstByte < 64;
}
exports.isDtls = isDtls;
function isMedia(buf) {
    const firstByte = buf[0];
    return firstByte > 127 && firstByte < 192;
}
exports.isMedia = isMedia;
function isRtcp(buf) {
    return buf.length >= 2 && buf[1] >= 192 && buf[1] <= 208;
}
exports.isRtcp = isRtcp;
function reverseSimulcastDirection(dir) {
    if (dir === "recv")
        return "send";
    return "recv";
}
exports.reverseSimulcastDirection = reverseSimulcastDirection;
const andDirection = (a, b) => rtpTransceiver_1.Directions[rtpTransceiver_1.Directions.indexOf(a) & rtpTransceiver_1.Directions.indexOf(b)];
exports.andDirection = andDirection;
function reverseDirection(dir) {
    if (dir === "sendonly")
        return "recvonly";
    if (dir === "recvonly")
        return "sendonly";
    return dir;
}
exports.reverseDirection = reverseDirection;
const microTime = () => now.micro();
exports.microTime = microTime;
const milliTime = () => new Date().getTime();
exports.milliTime = milliTime;
const timestampSeconds = () => Date.now() / 1000;
exports.timestampSeconds = timestampSeconds;
/**https://datatracker.ietf.org/doc/html/rfc3550#section-4 */
const ntpTime = () => {
    const now = perf_hooks_1.performance.timeOrigin + perf_hooks_1.performance.now() - Date.UTC(1900, 0, 1);
    const seconds = now / 1000;
    const [sec, msec] = seconds.toString().split(".").map(Number);
    const buf = (0, src_1.bufferWriter)([4, 4], [sec, msec]);
    return buf.readBigUInt64BE();
};
exports.ntpTime = ntpTime;
/**
 * https://datatracker.ietf.org/doc/html/rfc3550#section-4
 * @param ntp
 * @returns 32bit
 */
const compactNtp = (ntp) => {
    const buf = (0, src_1.bufferWriter)([8], [ntp]);
    const [, sec, msec] = (0, src_1.bufferReader)(buf, [2, 2, 2, 2]);
    return (0, src_1.bufferWriter)([2, 2], [sec, msec]).readUInt32BE();
};
exports.compactNtp = compactNtp;
function parseIceServers(iceServers) {
    const url2Address = (url) => {
        if (!url)
            return;
        const [address, port] = url.split(":");
        return [address, parseInt(port)];
    };
    const stunServer = url2Address(iceServers.find(({ urls }) => urls.includes("stun:"))?.urls.slice(5));
    const turnServer = url2Address(iceServers.find(({ urls }) => urls.includes("turn:"))?.urls.slice(5));
    const { credential, username } = iceServers.find(({ urls }) => urls.includes("turn:")) || {};
    const options = {
        stunServer,
        turnServer,
        turnUsername: username,
        turnPassword: credential,
    };
    log("iceOptions", options);
    return options;
}
exports.parseIceServers = parseIceServers;
class RtpBuilder {
    constructor() {
        Object.defineProperty(this, "sequenceNumber", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (0, src_1.random16)()
        });
        Object.defineProperty(this, "timestamp", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (0, src_1.random32)()
        });
    }
    create(payload) {
        this.sequenceNumber = (0, src_1.uint16Add)(this.sequenceNumber, 1);
        this.timestamp = (0, src_1.uint32Add)(this.timestamp, 960);
        const header = new src_2.RtpHeader({
            sequenceNumber: this.sequenceNumber,
            timestamp: Number(this.timestamp),
            payloadType: 96,
            extension: true,
            marker: false,
            padding: false,
        });
        const rtp = new src_2.RtpPacket(header, payload);
        return rtp;
    }
}
exports.RtpBuilder = RtpBuilder;
/**
 *
 * @param signatureHash
 * @param namedCurveAlgorithm necessary when use ecdsa
 */
exports.createSelfSignedCertificate = cipher_1.CipherContext.createSelfSignedCertificateWithKey;
//# sourceMappingURL=utils.js.map