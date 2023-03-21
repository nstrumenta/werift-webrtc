"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.unwrapRtx = exports.RTCRtpReceiver = void 0;
const debug_1 = require("debug");
const jspack_1 = require("jspack");
const rx_mini_1 = __importDefault(require("rx.mini"));
const promises_1 = require("timers/promises");
const uuid_1 = require("uuid");
const src_1 = require("../../../common/src");
const src_2 = require("../../../rtp/src");
const __1 = require("..");
const utils_1 = require("../utils");
const rtpExtension_1 = require("./extension/rtpExtension");
const nack_1 = require("./receiver/nack");
const receiverTwcc_1 = require("./receiver/receiverTwcc");
const statistics_1 = require("./receiver/statistics");
const log = (0, debug_1.debug)("werift:packages/webrtc/src/media/rtpReceiver.ts");
class RTCRtpReceiver {
    get codecArray() {
        return Object.values(this.codecs).sort((a, b) => a.payloadType - b.payloadType);
    }
    constructor(config, kind, rtcpSsrc) {
        Object.defineProperty(this, "config", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: config
        });
        Object.defineProperty(this, "kind", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: kind
        });
        Object.defineProperty(this, "rtcpSsrc", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: rtcpSsrc
        });
        Object.defineProperty(this, "codecs", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: {}
        });
        Object.defineProperty(this, "ssrcByRtx", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: {}
        });
        Object.defineProperty(this, "nack", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new nack_1.NackHandler(this)
        });
        Object.defineProperty(this, "audioRedHandler", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new src_2.RedHandler()
        });
        Object.defineProperty(this, "type", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "receiver"
        });
        Object.defineProperty(this, "uuid", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (0, uuid_1.v4)()
        });
        Object.defineProperty(this, "tracks", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "trackBySSRC", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: {}
        });
        Object.defineProperty(this, "trackByRID", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: {}
        });
        /**last sender Report Timestamp
         * compactNtp
         */
        Object.defineProperty(this, "lastSRtimestamp", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: {}
        });
        /**seconds */
        Object.defineProperty(this, "receiveLastSRTimestamp", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: {}
        });
        Object.defineProperty(this, "onPacketLost", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: this.nack.onPacketLost
        });
        Object.defineProperty(this, "onRtcp", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new rx_mini_1.default()
        });
        Object.defineProperty(this, "dtlsTransport", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "sdesMid", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "latestRid", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "latestRepairedRid", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "receiverTWCC", {
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
        Object.defineProperty(this, "remoteStreamId", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "remoteTrackId", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "rtcpRunning", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        Object.defineProperty(this, "rtcpCancel", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new AbortController()
        });
        Object.defineProperty(this, "remoteStreams", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: {}
        });
        Object.defineProperty(this, "handleRtpBySsrc", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (packet, extensions) => {
                const track = this.trackBySSRC[packet.header.ssrc];
                this.handleRTP(packet, extensions, track);
            }
        });
        Object.defineProperty(this, "handleRtpByRid", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (packet, rid, extensions) => {
                const track = this.trackByRID[rid];
                if (!this.trackBySSRC[packet.header.ssrc]) {
                    this.trackBySSRC[packet.header.ssrc] = track;
                }
                this.handleRTP(packet, extensions, track);
            }
        });
    }
    setDtlsTransport(dtls) {
        this.dtlsTransport = dtls;
    }
    // todo fix
    get track() {
        return this.tracks[0];
    }
    get nackEnabled() {
        return this.codecArray[0]?.rtcpFeedback.find((f) => f.type === "nack");
    }
    get twccEnabled() {
        return this.codecArray[0]?.rtcpFeedback.find((f) => f.type === (0, __1.useTWCC)().type);
    }
    get pliEnabled() {
        return this.codecArray[0]?.rtcpFeedback.find((f) => f.type === (0, __1.usePLI)().type);
    }
    prepareReceive(params) {
        params.codecs.forEach((c) => {
            this.codecs[c.payloadType] = c;
        });
        params.encodings.forEach((e) => {
            if (e.rtx) {
                this.ssrcByRtx[e.rtx.ssrc] = e.ssrc;
            }
        });
    }
    /**
     * setup TWCC if supported
     */
    setupTWCC(mediaSourceSsrc) {
        if (this.twccEnabled && !this.receiverTWCC) {
            this.receiverTWCC = new receiverTwcc_1.ReceiverTWCC(this.dtlsTransport, this.rtcpSsrc, mediaSourceSsrc);
        }
    }
    addTrack(track) {
        const exist = this.tracks.find((t) => {
            if (t.rid) {
                return t.rid === track.rid;
            }
            if (t.ssrc) {
                return t.ssrc === track.ssrc;
            }
        });
        if (exist) {
            return false;
        }
        this.tracks.push(track);
        if (track.ssrc) {
            this.trackBySSRC[track.ssrc] = track;
        }
        if (track.rid) {
            this.trackByRID[track.rid] = track;
        }
        return true;
    }
    stop() {
        this.stopped = true;
        this.rtcpRunning = false;
        this.rtcpCancel.abort();
        if (this.receiverTWCC)
            this.receiverTWCC.twccRunning = false;
        this.nack.close();
    }
    async runRtcp() {
        if (this.rtcpRunning || this.stopped)
            return;
        this.rtcpRunning = true;
        try {
            while (this.rtcpRunning) {
                await (0, promises_1.setTimeout)(500 + Math.random() * 1000, undefined, {
                    signal: this.rtcpCancel.signal,
                });
                const reports = Object.entries(this.remoteStreams).map(([ssrc, stream]) => {
                    let lastSRtimestamp = 0, delaySinceLastSR = 0;
                    if (this.lastSRtimestamp[ssrc]) {
                        lastSRtimestamp = this.lastSRtimestamp[ssrc];
                        const delaySeconds = (0, utils_1.timestampSeconds)() - this.receiveLastSRTimestamp[ssrc];
                        if (delaySeconds > 0 && delaySeconds < 65536) {
                            delaySinceLastSR = (0, src_1.int)(delaySeconds * 65536);
                        }
                    }
                    return new src_2.RtcpReceiverInfo({
                        ssrc: Number(ssrc),
                        fractionLost: stream.fraction_lost,
                        packetsLost: stream.packets_lost,
                        highestSequence: stream.max_seq,
                        jitter: stream.jitter,
                        lsr: lastSRtimestamp,
                        dlsr: delaySinceLastSR,
                    });
                });
                const packet = new src_2.RtcpRrPacket({ ssrc: this.rtcpSsrc, reports });
                try {
                    if (this.config.debug.receiverReportDelay) {
                        await (0, promises_1.setTimeout)(this.config.debug.receiverReportDelay);
                    }
                    await this.dtlsTransport.sendRtcp([packet]);
                }
                catch (error) {
                    log("sendRtcp failed", error);
                    await (0, promises_1.setTimeout)(500 + Math.random() * 1000);
                }
            }
        }
        catch (error) { }
    }
    /**todo impl */
    getStats() { }
    async sendRtcpPLI(mediaSsrc) {
        if (!this.pliEnabled) {
            log("pli not supported", { mediaSsrc });
            return;
        }
        if (this.stopped) {
            return;
        }
        log("sendRtcpPLI", { mediaSsrc });
        const packet = new src_2.RtcpPayloadSpecificFeedback({
            feedback: new src_2.PictureLossIndication({
                senderSsrc: this.rtcpSsrc,
                mediaSsrc,
            }),
        });
        try {
            await this.dtlsTransport.sendRtcp([packet]);
        }
        catch (error) {
            log(error);
        }
    }
    handleRtcpPacket(packet) {
        switch (packet.type) {
            case src_2.RtcpSrPacket.type:
                {
                    const sr = packet;
                    this.lastSRtimestamp[sr.ssrc] = (0, utils_1.compactNtp)(sr.senderInfo.ntpTimestamp);
                    this.receiveLastSRTimestamp[sr.ssrc] = (0, utils_1.timestampSeconds)();
                    const track = this.trackBySSRC[packet.ssrc];
                    if (track) {
                        track.onReceiveRtcp.execute(packet);
                    }
                }
                break;
        }
        this.onRtcp.execute(packet);
    }
    handleRTP(packet, extensions, track) {
        if (this.stopped) {
            return;
        }
        const codec = this.codecs[packet.header.payloadType];
        if (!codec) {
            // log("unknown codec " + packet.header.payloadType);
            return;
        }
        this.remoteStreams[packet.header.ssrc] =
            this.remoteStreams[packet.header.ssrc] ??
                new statistics_1.StreamStatistics(codec.clockRate);
        this.remoteStreams[packet.header.ssrc].add(packet);
        if (this.receiverTWCC) {
            const transportSequenceNumber = extensions[rtpExtension_1.RTP_EXTENSION_URI.transportWideCC];
            if (!transportSequenceNumber == undefined) {
                throw new Error("undefined");
            }
            this.receiverTWCC.handleTWCC(transportSequenceNumber);
        }
        else if (this.twccEnabled) {
            this.setupTWCC(packet.header.ssrc);
        }
        if (codec.name.toLowerCase() === "rtx") {
            const originalSsrc = this.ssrcByRtx[packet.header.ssrc];
            const codecParams = (0, __1.codecParametersFromString)(codec.parameters ?? "");
            const rtxCodec = this.codecs[codecParams["apt"]];
            if (packet.payload.length < 2)
                return;
            packet = unwrapRtx(packet, rtxCodec.payloadType, originalSsrc);
            track = this.trackBySSRC[originalSsrc];
        }
        let red;
        if (codec.name.toLowerCase() === "red") {
            red = src_2.Red.deSerialize(packet.payload);
            if (!Object.keys(this.codecs).includes(red.header.fields[0].blockPT.toString())) {
                return;
            }
        }
        if (track?.kind === "video" && this.nackEnabled) {
            this.nack.addPacket(packet);
        }
        if (track) {
            if (red) {
                if (track.kind === "audio") {
                    const payloads = this.audioRedHandler.push(red, packet);
                    for (const packet of payloads) {
                        track.onReceiveRtp.execute(packet.clone());
                    }
                }
                else {
                }
            }
            else {
                track.onReceiveRtp.execute(packet.clone());
            }
        }
        this.runRtcp();
    }
}
exports.RTCRtpReceiver = RTCRtpReceiver;
function unwrapRtx(rtx, payloadType, ssrc) {
    const packet = new src_2.RtpPacket(new src_2.RtpHeader({
        payloadType,
        marker: rtx.header.marker,
        sequenceNumber: jspack_1.jspack.Unpack("!H", rtx.payload.subarray(0, 2))[0],
        timestamp: rtx.header.timestamp,
        ssrc,
    }), rtx.payload.subarray(2));
    return packet;
}
exports.unwrapRtx = unwrapRtx;
//# sourceMappingURL=rtpReceiver.js.map