"use strict";
/**
   [10 Nov 1995 11:33:25.125 UTC]       [10 Nov 1995 11:33:36.5 UTC]
   n                 SR(n)              A=b710:8000 (46864.500 s)
   ---------------------------------------------------------------->
                      v                 ^
   ntp_sec =0xb44db705 v               ^ dlsr=0x0005:4000 (    5.250s)
   ntp_frac=0x20000000  v             ^  lsr =0xb705:2000 (46853.125s)
     (3024992005.125 s)  v           ^
   r                      v         ^ RR(n)
   ---------------------------------------------------------------->
                          |<-DLSR->|
                           (5.250 s)
        
   A     0xb710:8000 (46864.500 s)
   DLSR -0x0005:4000 (    5.250 s)
   LSR  -0xb705:2000 (46853.125 s)
   -------------------------------
   delay 0x0006:2000 (    6.125 s)
        
Figure 2: Example for round-trip time computation
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.wrapRtx = exports.RTCRtpSender = void 0;
const crypto_1 = require("crypto");
const debug_1 = __importDefault(require("debug"));
const jspack_1 = require("jspack");
const rx_mini_1 = __importDefault(require("rx.mini"));
const promises_1 = require("timers/promises");
const uuid = __importStar(require("uuid"));
const src_1 = require("../../../common/src");
const src_2 = require("../../../rtp/src");
const __1 = require("..");
const utils_1 = require("../utils");
const rtpExtension_1 = require("./extension/rtpExtension");
const senderBWE_1 = require("./sender/senderBWE");
const track_1 = require("./track");
const log = (0, debug_1.default)("werift:packages/webrtc/src/media/rtpSender.ts");
const RTP_HISTORY_SIZE = 128;
const RTT_ALPHA = 0.85;
class RTCRtpSender {
    constructor(trackOrKind) {
        Object.defineProperty(this, "trackOrKind", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: trackOrKind
        });
        Object.defineProperty(this, "type", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "sender"
        });
        Object.defineProperty(this, "kind", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "ssrc", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: jspack_1.jspack.Unpack("!L", (0, crypto_1.randomBytes)(4))[0]
        });
        Object.defineProperty(this, "rtxSsrc", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: jspack_1.jspack.Unpack("!L", (0, crypto_1.randomBytes)(4))[0]
        });
        Object.defineProperty(this, "streamId", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: uuid.v4()
        });
        Object.defineProperty(this, "trackId", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: uuid.v4()
        });
        Object.defineProperty(this, "onReady", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new rx_mini_1.default()
        });
        Object.defineProperty(this, "onRtcp", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new rx_mini_1.default()
        });
        Object.defineProperty(this, "onPictureLossIndication", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new rx_mini_1.default()
        });
        Object.defineProperty(this, "onGenericNack", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new rx_mini_1.default()
        });
        Object.defineProperty(this, "senderBWE", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new senderBWE_1.SenderBandwidthEstimator()
        });
        Object.defineProperty(this, "cname", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "mid", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "rtpStreamId", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "repairedRtpStreamId", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "rtxPayloadType", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "rtxSequenceNumber", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (0, src_1.random16)()
        });
        Object.defineProperty(this, "redRedundantPayloadType", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_redDistance", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 2
        });
        Object.defineProperty(this, "redEncoder", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new src_2.RedEncoder(this._redDistance)
        });
        Object.defineProperty(this, "headerExtensions", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "disposeTrack", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        // # stats
        Object.defineProperty(this, "lastSRtimestamp", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "lastSentSRTimestamp", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "ntpTimestamp", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0n
        });
        Object.defineProperty(this, "rtpTimestamp", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "octetCount", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "packetCount", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "rtt", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "receiverEstimatedMaxBitrate", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0n
        });
        // rtp
        Object.defineProperty(this, "sequenceNumber", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "timestamp", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "timestampOffset", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "seqOffset", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "rtpCache", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "codec", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "dtlsTransport", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "dtlsDisposer", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "track", {
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
        this.kind =
            typeof this.trackOrKind === "string"
                ? this.trackOrKind
                : this.trackOrKind.kind;
        if (trackOrKind instanceof track_1.MediaStreamTrack) {
            if (trackOrKind.streamId) {
                this.streamId = trackOrKind.streamId;
            }
            this.registerTrack(trackOrKind);
        }
    }
    setDtlsTransport(dtlsTransport) {
        if (this.dtlsTransport) {
            this.dtlsDisposer.forEach((dispose) => dispose());
        }
        this.dtlsTransport = dtlsTransport;
        this.dtlsDisposer = [
            this.dtlsTransport.onStateChange.subscribe((state) => {
                if (state === "connected") {
                    this.onReady.execute();
                }
            }).unSubscribe,
        ];
    }
    get redDistance() {
        return this._redDistance;
    }
    set redDistance(n) {
        this._redDistance = n;
        this.redEncoder.distance = n;
    }
    prepareSend(params) {
        this.cname = params.rtcp?.cname;
        this.mid = params.muxId;
        this.headerExtensions = params.headerExtensions;
        this.rtpStreamId = params.rtpStreamId;
        this.repairedRtpStreamId = params.repairedRtpStreamId;
        this.codec = params.codecs[0];
        if (this.track) {
            this.track.codec = this.codec;
        }
        params.codecs.forEach((codec) => {
            const codecParams = (0, __1.codecParametersFromString)(codec.parameters ?? "");
            if (codec.name.toLowerCase() === "rtx" &&
                codecParams["apt"] === this.codec?.payloadType) {
                this.rtxPayloadType = codec.payloadType;
            }
            if (codec.name.toLowerCase() === "red") {
                this.redRedundantPayloadType = Number((codec.parameters ?? "").split("/")[0]);
            }
        });
    }
    registerTrack(track) {
        if (track.stopped)
            throw new Error("track is ended");
        if (this.disposeTrack) {
            this.disposeTrack();
        }
        track.id = this.trackId;
        const { unSubscribe } = track.onReceiveRtp.subscribe(async (rtp) => {
            await this.sendRtp(rtp);
        });
        this.track = track;
        this.disposeTrack = unSubscribe;
        if (this.codec) {
            track.codec = this.codec;
        }
        track.onSourceChanged.subscribe((header) => {
            this.replaceRTP(header);
        });
    }
    async replaceTrack(track) {
        if (track === null) {
            // todo impl
            return;
        }
        if (track.stopped)
            throw new Error("track is ended");
        if (this.sequenceNumber != undefined) {
            const header = track.header || (await track.onReceiveRtp.asPromise())[0].header;
            this.replaceRTP(header);
        }
        this.registerTrack(track);
        log("replaceTrack", "ssrc", track.ssrc, "rid", track.rid);
    }
    stop() {
        this.stopped = true;
        this.rtcpRunning = false;
        this.rtcpCancel.abort();
        if (this.disposeTrack) {
            this.disposeTrack();
        }
        this.track = undefined;
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
                const packets = [
                    new src_2.RtcpSrPacket({
                        ssrc: this.ssrc,
                        senderInfo: new src_2.RtcpSenderInfo({
                            ntpTimestamp: this.ntpTimestamp,
                            rtpTimestamp: this.rtpTimestamp,
                            packetCount: this.packetCount,
                            octetCount: this.octetCount,
                        }),
                    }),
                ];
                this.lastSRtimestamp = (0, utils_1.compactNtp)(this.ntpTimestamp);
                this.lastSentSRTimestamp = (0, utils_1.timestampSeconds)();
                if (this.cname) {
                    packets.push(new src_2.RtcpSourceDescriptionPacket({
                        chunks: [
                            new src_2.SourceDescriptionChunk({
                                source: this.ssrc,
                                items: [
                                    new src_2.SourceDescriptionItem({ type: 1, text: this.cname }),
                                ],
                            }),
                        ],
                    }));
                }
                try {
                    await this.dtlsTransport.sendRtcp(packets);
                }
                catch (error) {
                    log("sendRtcp failed", error);
                    await (0, promises_1.setTimeout)(500 + Math.random() * 1000);
                }
            }
        }
        catch (error) { }
    }
    replaceRTP({ sequenceNumber, timestamp, }, discontinuity = false) {
        if (this.sequenceNumber != undefined) {
            this.seqOffset = (0, src_1.uint16Add)(this.sequenceNumber, -sequenceNumber);
            if (discontinuity) {
                this.seqOffset = (0, src_1.uint16Add)(this.seqOffset, 2);
            }
        }
        if (this.timestamp != undefined) {
            this.timestampOffset = (0, src_1.uint32Add)(this.timestamp, -timestamp);
            if (discontinuity) {
                this.timestampOffset = (0, src_1.uint16Add)(this.timestampOffset, 1);
            }
        }
        this.rtpCache = [];
        log("replaceRTP", this.sequenceNumber, sequenceNumber, this.seqOffset);
    }
    async sendRtp(rtp) {
        if (this.dtlsTransport.state !== "connected" || !this.codec) {
            return;
        }
        rtp = Buffer.isBuffer(rtp) ? src_2.RtpPacket.deSerialize(rtp) : rtp;
        const { header, payload } = rtp;
        header.ssrc = this.ssrc;
        header.payloadType = this.codec.payloadType;
        header.timestamp = (0, src_1.uint32Add)(header.timestamp, this.timestampOffset);
        header.sequenceNumber = (0, src_1.uint16Add)(header.sequenceNumber, this.seqOffset);
        this.timestamp = header.timestamp;
        this.sequenceNumber = header.sequenceNumber;
        const ntptime = (0, utils_1.ntpTime)();
        header.extensions = this.headerExtensions
            .map((extension) => {
            const payload = (() => {
                switch (extension.uri) {
                    case rtpExtension_1.RTP_EXTENSION_URI.sdesMid:
                        if (this.mid) {
                            return Buffer.from(this.mid);
                        }
                        return;
                    // todo : sender simulcast unsupported now
                    case rtpExtension_1.RTP_EXTENSION_URI.sdesRTPStreamID:
                        if (this.rtpStreamId) {
                            return Buffer.from(this.rtpStreamId);
                        }
                        return;
                    // todo : sender simulcast unsupported now
                    case rtpExtension_1.RTP_EXTENSION_URI.repairedRtpStreamId:
                        if (this.repairedRtpStreamId) {
                            return Buffer.from(this.repairedRtpStreamId);
                        }
                        return;
                    case rtpExtension_1.RTP_EXTENSION_URI.transportWideCC:
                        this.dtlsTransport.transportSequenceNumber = (0, src_1.uint16Add)(this.dtlsTransport.transportSequenceNumber, 1);
                        return (0, src_1.bufferWriter)([2], [this.dtlsTransport.transportSequenceNumber]);
                    case rtpExtension_1.RTP_EXTENSION_URI.absSendTime:
                        const buf = Buffer.alloc(3);
                        const time = (ntptime >> 14n) & 0x00ffffffn;
                        buf.writeUIntBE(Number(time), 0, 3);
                        return buf;
                }
            })();
            if (payload)
                return { id: extension.id, payload };
        })
            .filter((v) => v);
        this.ntpTimestamp = ntptime;
        this.rtpTimestamp = header.timestamp;
        this.octetCount += payload.length;
        this.packetCount = (0, src_1.uint32Add)(this.packetCount, 1);
        this.rtpCache[header.sequenceNumber % RTP_HISTORY_SIZE] = rtp;
        let rtpPayload = payload;
        if (this.redRedundantPayloadType) {
            this.redEncoder.push({
                block: rtpPayload,
                timestamp: header.timestamp,
                blockPT: this.redRedundantPayloadType,
            });
            const red = this.redEncoder.build();
            rtpPayload = red.serialize();
        }
        const size = await this.dtlsTransport.sendRtp(rtpPayload, header);
        this.runRtcp();
        const millitime = (0, utils_1.milliTime)();
        const sentInfo = {
            wideSeq: this.dtlsTransport.transportSequenceNumber,
            size,
            sendingAtMs: millitime,
            sentAtMs: millitime,
        };
        this.senderBWE.rtpPacketSent(sentInfo);
    }
    handleRtcpPacket(rtcpPacket) {
        switch (rtcpPacket.type) {
            case src_2.RtcpSrPacket.type:
            case src_2.RtcpRrPacket.type:
                {
                    const packet = rtcpPacket;
                    packet.reports
                        .filter((report) => report.ssrc === this.ssrc)
                        .forEach((report) => {
                        if (this.lastSRtimestamp === report.lsr && report.dlsr) {
                            if (this.lastSentSRTimestamp) {
                                const rtt = (0, utils_1.timestampSeconds)() -
                                    this.lastSentSRTimestamp -
                                    report.dlsr / 65536;
                                if (this.rtt === undefined) {
                                    this.rtt = rtt;
                                }
                                else {
                                    this.rtt = RTT_ALPHA * this.rtt + (1 - RTT_ALPHA) * rtt;
                                }
                            }
                        }
                    });
                }
                break;
            case src_2.RtcpTransportLayerFeedback.type:
                {
                    const packet = rtcpPacket;
                    switch (packet.feedback.count) {
                        case src_2.TransportWideCC.count:
                            {
                                const feedback = packet.feedback;
                                this.senderBWE.receiveTWCC(feedback);
                            }
                            break;
                        case src_2.GenericNack.count:
                            {
                                const feedback = packet.feedback;
                                feedback.lost.forEach(async (seqNum) => {
                                    let packet = this.rtpCache[seqNum % RTP_HISTORY_SIZE];
                                    if (packet && packet.header.sequenceNumber !== seqNum) {
                                        packet = undefined;
                                    }
                                    if (packet) {
                                        if (this.rtxPayloadType != undefined) {
                                            packet = wrapRtx(packet, this.rtxPayloadType, this.rtxSequenceNumber, this.rtxSsrc);
                                            this.rtxSequenceNumber = (0, src_1.uint16Add)(this.rtxSequenceNumber, 1);
                                        }
                                        await this.dtlsTransport.sendRtp(packet.payload, packet.header);
                                    }
                                });
                                this.onGenericNack.execute(feedback);
                            }
                            break;
                    }
                }
                break;
            case src_2.RtcpPayloadSpecificFeedback.type:
                {
                    const packet = rtcpPacket;
                    switch (packet.feedback.count) {
                        case src_2.ReceiverEstimatedMaxBitrate.count:
                            {
                                const feedback = packet.feedback;
                                this.receiverEstimatedMaxBitrate = feedback.bitrate;
                            }
                            break;
                        case src_2.PictureLossIndication.count:
                            {
                                this.onPictureLossIndication.execute();
                            }
                            break;
                    }
                }
                break;
        }
        this.onRtcp.execute(rtcpPacket);
    }
}
exports.RTCRtpSender = RTCRtpSender;
function wrapRtx(packet, payloadType, sequenceNumber, ssrc) {
    const rtx = new src_2.RtpPacket(new src_2.RtpHeader({
        payloadType,
        marker: packet.header.marker,
        sequenceNumber,
        timestamp: packet.header.timestamp,
        ssrc,
        csrc: packet.header.csrc,
        extensions: packet.header.extensions,
    }), Buffer.concat([
        Buffer.from(jspack_1.jspack.Pack("!H", [packet.header.sequenceNumber])),
        packet.payload,
    ]));
    return rtx;
}
exports.wrapRtx = wrapRtx;
//# sourceMappingURL=rtpSender.js.map