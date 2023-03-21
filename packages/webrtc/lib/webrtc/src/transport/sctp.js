"use strict";
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
exports.RTCSctpCapabilities = exports.RTCSctpTransport = void 0;
const debug_1 = __importDefault(require("debug"));
const jspack_1 = require("jspack");
const rx_mini_1 = require("rx.mini");
const uuid = __importStar(require("uuid"));
const src_1 = require("../../../sctp/src");
const const_1 = require("../const");
const dataChannel_1 = require("../dataChannel");
const log = (0, debug_1.default)("werift:packages/webrtc/src/transport/sctp.ts");
class RTCSctpTransport {
    constructor(port = 5000) {
        Object.defineProperty(this, "port", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: port
        });
        Object.defineProperty(this, "dtlsTransport", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "sctp", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "onDataChannel", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new rx_mini_1.Event()
        });
        Object.defineProperty(this, "id", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: uuid.v4()
        });
        Object.defineProperty(this, "mid", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "mLineIndex", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "bundled", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        Object.defineProperty(this, "dataChannels", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: {}
        });
        Object.defineProperty(this, "dataChannelQueue", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "dataChannelId", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "eventDisposer", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "datachannelReceive", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: async (streamId, ppId, data) => {
                if (ppId === const_1.WEBRTC_DCEP && data.length > 0) {
                    log("DCEP", streamId, ppId, data);
                    switch (data[0]) {
                        case const_1.DATA_CHANNEL_OPEN:
                            {
                                if (data.length < 12) {
                                    log("DATA_CHANNEL_OPEN data.length not enough");
                                    return;
                                }
                                if (!Object.keys(this.dataChannels).includes(streamId.toString())) {
                                    const [, channelType, , reliability, labelLength, protocolLength,] = jspack_1.jspack.Unpack("!BBHLHH", data);
                                    let pos = 12;
                                    const label = data.slice(pos, pos + labelLength).toString("utf8");
                                    pos += labelLength;
                                    const protocol = data
                                        .slice(pos, pos + protocolLength)
                                        .toString("utf8");
                                    log("DATA_CHANNEL_OPEN", {
                                        channelType,
                                        reliability,
                                        streamId,
                                        label,
                                        protocol,
                                    });
                                    const maxRetransmits = (channelType & 0x03) === 1 ? reliability : undefined;
                                    const maxPacketLifeTime = (channelType & 0x03) === 2 ? reliability : undefined;
                                    // # register channel
                                    const parameters = new dataChannel_1.RTCDataChannelParameters({
                                        label,
                                        ordered: (channelType & 0x80) === 0,
                                        maxPacketLifeTime,
                                        maxRetransmits,
                                        protocol,
                                        id: streamId,
                                    });
                                    const channel = new dataChannel_1.RTCDataChannel(this, parameters, false);
                                    channel.isCreatedByRemote = true;
                                    this.dataChannels[streamId] = channel;
                                    this.onDataChannel.execute(channel);
                                    channel.setReadyState("open");
                                }
                                else {
                                    log("datachannel already opened", "retransmit ack");
                                }
                                const channel = this.dataChannels[streamId];
                                this.dataChannelQueue.push([
                                    channel,
                                    const_1.WEBRTC_DCEP,
                                    Buffer.from(jspack_1.jspack.Pack("!B", [const_1.DATA_CHANNEL_ACK])),
                                ]);
                                await this.dataChannelFlush();
                            }
                            break;
                        case const_1.DATA_CHANNEL_ACK:
                            log("DATA_CHANNEL_ACK", streamId, ppId);
                            const channel = this.dataChannels[streamId];
                            if (!channel) {
                                throw new Error("channel not found");
                            }
                            channel.setReadyState("open");
                            break;
                    }
                }
                else {
                    const channel = this.dataChannels[streamId];
                    if (channel) {
                        const msg = (() => {
                            switch (ppId) {
                                case const_1.WEBRTC_STRING:
                                    return data.toString("utf8");
                                case const_1.WEBRTC_STRING_EMPTY:
                                    return "";
                                case const_1.WEBRTC_BINARY:
                                    return data;
                                case const_1.WEBRTC_BINARY_EMPTY:
                                    return Buffer.from([]);
                                default:
                                    throw new Error();
                            }
                        })();
                        channel.message.execute(msg);
                        channel.emit("message", { data: msg });
                        if (channel.onmessage) {
                            channel.onmessage({ data: msg });
                        }
                    }
                }
            }
        });
        Object.defineProperty(this, "datachannelSend", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (channel, data) => {
                channel.addBufferedAmount(data.length);
                this.dataChannelQueue.push(typeof data === "string"
                    ? [channel, const_1.WEBRTC_STRING, Buffer.from(data)]
                    : [channel, const_1.WEBRTC_BINARY, data]);
                if (this.sctp.associationState !== src_1.SCTP_STATE.ESTABLISHED) {
                    log("sctp not established", this.sctp.associationState);
                }
                this.dataChannelFlush();
            }
        });
    }
    setDtlsTransport(dtlsTransport) {
        if (this.dtlsTransport && this.dtlsTransport.id === dtlsTransport.id) {
            return;
        }
        this.eventDisposer.forEach((dispose) => dispose());
        this.dtlsTransport = dtlsTransport;
        this.sctp = new src_1.SCTP(new BridgeDtls(this.dtlsTransport), this.port);
        this.eventDisposer = [
            ...[
                this.sctp.onReceive.subscribe(this.datachannelReceive),
                this.sctp.onReconfigStreams.subscribe((ids) => {
                    ids.forEach((id) => {
                        const dc = this.dataChannels[id];
                        if (!dc)
                            return;
                        // todo fix
                        dc.setReadyState("closing");
                        dc.setReadyState("closed");
                        delete this.dataChannels[id];
                    });
                }),
                this.sctp.stateChanged.connected.subscribe(() => {
                    Object.values(this.dataChannels).forEach((channel) => {
                        if (channel.negotiated && channel.readyState !== "open") {
                            channel.setReadyState("open");
                        }
                    });
                    this.dataChannelFlush();
                }),
                this.sctp.stateChanged.closed.subscribe(() => {
                    Object.values(this.dataChannels).forEach((dc) => {
                        dc.setReadyState("closed");
                    });
                    this.dataChannels = {};
                }),
                this.dtlsTransport.onStateChange.subscribe((state) => {
                    if (state === "closed") {
                        this.sctp.setState(src_1.SCTP_STATE.CLOSED);
                    }
                }),
            ].map((e) => e.unSubscribe),
            () => (this.sctp.onSackReceived = async () => { }),
        ];
        this.sctp.onSackReceived = async () => {
            await this.dataChannelFlush();
        };
    }
    get isServer() {
        return this.dtlsTransport.iceTransport.role !== "controlling";
    }
    channelByLabel(label) {
        return Object.values(this.dataChannels).find((d) => d.label === label);
    }
    dataChannelAddNegotiated(channel) {
        if (channel.id == undefined) {
            throw new Error();
        }
        if (this.dataChannels[channel.id]) {
            throw new Error();
        }
        this.dataChannels[channel.id] = channel;
        if (this.sctp.associationState === src_1.SCTP_STATE.ESTABLISHED) {
            channel.setReadyState("open");
        }
    }
    dataChannelOpen(channel) {
        if (channel.id) {
            if (this.dataChannels[channel.id])
                throw new Error(`Data channel with ID ${channel.id} already registered`);
            this.dataChannels[channel.id] = channel;
        }
        let channelType = const_1.DATA_CHANNEL_RELIABLE;
        const priority = 0;
        let reliability = 0;
        if (!channel.ordered) {
            channelType = 0x80;
        }
        if (channel.maxRetransmits) {
            channelType = 1;
            reliability = channel.maxRetransmits;
        }
        else if (channel.maxPacketLifeTime) {
            channelType = 2;
            reliability = channel.maxPacketLifeTime;
        }
        // 5.1.  DATA_CHANNEL_OPEN Message
        const data = jspack_1.jspack.Pack("!BBHLHH", [
            const_1.DATA_CHANNEL_OPEN,
            channelType,
            priority,
            reliability,
            channel.label.length,
            channel.protocol.length,
        ]);
        const send = Buffer.concat([
            Buffer.from(data),
            Buffer.from(channel.label, "utf8"),
            Buffer.from(channel.protocol, "utf8"),
        ]);
        this.dataChannelQueue.push([channel, const_1.WEBRTC_DCEP, send]);
        this.dataChannelFlush();
    }
    async dataChannelFlush() {
        // """
        // Try to flush buffered data to the SCTP layer.
        // We wait until the association is established, as we need to know
        // whether we are a client or a server to correctly assign an odd/even ID
        // to the data channels.
        // """
        if (this.sctp.associationState != src_1.SCTP_STATE.ESTABLISHED)
            return;
        if (this.sctp.outboundQueue.length > 0)
            return;
        while (this.dataChannelQueue.length > 0) {
            const [channel, protocol, userData] = this.dataChannelQueue.shift();
            let streamId = channel.id;
            if (streamId === undefined) {
                streamId = this.dataChannelId;
                while (Object.keys(this.dataChannels).includes(streamId.toString())) {
                    streamId += 2;
                }
                this.dataChannels[streamId] = channel;
                channel.setId(streamId);
            }
            if (protocol === const_1.WEBRTC_DCEP) {
                await this.sctp.send(streamId, protocol, userData, {
                    ordered: true,
                });
            }
            else {
                const expiry = channel.maxPacketLifeTime
                    ? Date.now() + channel.maxPacketLifeTime / 1000
                    : undefined;
                await this.sctp.send(streamId, protocol, userData, {
                    expiry,
                    maxRetransmits: channel.maxRetransmits,
                    ordered: channel.ordered,
                });
                channel.addBufferedAmount(-userData.length);
            }
        }
    }
    static getCapabilities() {
        return new RTCSctpCapabilities(65536);
    }
    setRemotePort(port) {
        this.sctp.setRemotePort(port);
    }
    async start(remotePort) {
        if (this.isServer) {
            this.dataChannelId = 0;
        }
        else {
            this.dataChannelId = 1;
        }
        this.sctp.isServer = this.isServer;
        await this.sctp.start(remotePort);
    }
    async stop() {
        this.dtlsTransport.dataReceiver = () => { };
        await this.sctp.stop();
    }
    dataChannelClose(channel) {
        if (!["closing", "closed"].includes(channel.readyState)) {
            channel.setReadyState("closing");
            if (this.sctp.associationState === src_1.SCTP_STATE.ESTABLISHED) {
                this.sctp.reconfigQueue.push(channel.id);
                if (this.sctp.reconfigQueue.length === 1) {
                    this.sctp.transmitReconfigRequest();
                }
            }
            else {
                this.dataChannelQueue = this.dataChannelQueue.filter((queueItem) => queueItem[0].id !== channel.id);
                if (channel.id) {
                    delete this.dataChannels[channel.id];
                }
                channel.setReadyState("closed");
            }
        }
    }
}
exports.RTCSctpTransport = RTCSctpTransport;
class RTCSctpCapabilities {
    constructor(maxMessageSize) {
        Object.defineProperty(this, "maxMessageSize", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: maxMessageSize
        });
    }
}
exports.RTCSctpCapabilities = RTCSctpCapabilities;
class BridgeDtls {
    constructor(dtls) {
        Object.defineProperty(this, "dtls", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: dtls
        });
        Object.defineProperty(this, "send", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (data) => {
                return this.dtls.sendData(data);
            }
        });
    }
    set onData(onData) {
        this.dtls.dataReceiver = onData;
    }
    close() { }
}
//# sourceMappingURL=sctp.js.map