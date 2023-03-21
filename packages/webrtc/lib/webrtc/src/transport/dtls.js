"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RTCDtlsParameters = exports.RTCDtlsFingerprint = exports.RTCCertificate = exports.DtlsStates = exports.RTCDtlsTransport = void 0;
const x509_1 = require("@fidm/x509");
const debug_1 = __importDefault(require("debug"));
const rx_mini_1 = __importDefault(require("rx.mini"));
const promises_1 = require("timers/promises");
const uuid_1 = require("uuid");
const src_1 = require("../../../dtls/src");
const const_1 = require("../../../dtls/src/cipher/const");
const cipher_1 = require("../../../dtls/src/context/cipher");
const src_2 = require("../../../rtp/src");
const const_2 = require("../../../rtp/src/srtp/const");
const utils_1 = require("../utils");
const log = (0, debug_1.default)("werift:packages/webrtc/src/transport/dtls.ts");
class RTCDtlsTransport {
    constructor(config, iceTransport, router, certificates, srtpProfiles = []) {
        Object.defineProperty(this, "config", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: config
        });
        Object.defineProperty(this, "iceTransport", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: iceTransport
        });
        Object.defineProperty(this, "router", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: router
        });
        Object.defineProperty(this, "certificates", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: certificates
        });
        Object.defineProperty(this, "srtpProfiles", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: srtpProfiles
        });
        Object.defineProperty(this, "id", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (0, uuid_1.v4)()
        });
        Object.defineProperty(this, "state", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "new"
        });
        Object.defineProperty(this, "role", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "auto"
        });
        Object.defineProperty(this, "srtpStarted", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        Object.defineProperty(this, "transportSequenceNumber", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "dataReceiver", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: () => { }
        });
        Object.defineProperty(this, "dtls", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "srtp", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "srtcp", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "onStateChange", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new rx_mini_1.default()
        });
        Object.defineProperty(this, "localCertificate", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "remoteParameters", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "sendData", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: async (data) => {
                if (this.config.debug.outboundPacketLoss &&
                    this.config.debug.outboundPacketLoss / 100 < Math.random()) {
                    return;
                }
                if (!this.dtls) {
                    throw new Error("dtls not established");
                }
                await this.dtls.send(data);
            }
        });
        this.localCertificate = this.certificates[0];
    }
    get localParameters() {
        return new RTCDtlsParameters(this.localCertificate ? this.localCertificate.getFingerprints() : [], this.role);
    }
    async setupCertificate() {
        if (!this.localCertificate) {
            const { certPem, keyPem, signatureHash } = await cipher_1.CipherContext.createSelfSignedCertificateWithKey({
                signature: const_1.SignatureAlgorithm.ecdsa_3,
                hash: const_1.HashAlgorithm.sha256_4,
            }, const_1.NamedCurveAlgorithm.secp256r1_23);
            this.localCertificate = new RTCCertificate(keyPem, certPem, signatureHash);
        }
        return this.localCertificate;
    }
    setRemoteParams(remoteParameters) {
        this.remoteParameters = remoteParameters;
    }
    async start() {
        if (this.state !== "new")
            throw new Error();
        if (this.remoteParameters?.fingerprints.length === 0)
            throw new Error();
        if (this.role === "auto") {
            if (this.iceTransport.role === "controlling") {
                this.role = "server";
            }
            else {
                this.role = "client";
            }
        }
        this.setState("connecting");
        await new Promise(async (r) => {
            if (this.role === "server") {
                this.dtls = new src_1.DtlsServer({
                    cert: this.localCertificate?.certPem,
                    key: this.localCertificate?.privateKey,
                    signatureHash: this.localCertificate?.signatureHash,
                    transport: createIceTransport(this.iceTransport.connection),
                    srtpProfiles: this.srtpProfiles,
                    extendedMasterSecret: true,
                    // certificateRequest: true,
                });
            }
            else {
                this.dtls = new src_1.DtlsClient({
                    cert: this.localCertificate?.certPem,
                    key: this.localCertificate?.privateKey,
                    signatureHash: this.localCertificate?.signatureHash,
                    transport: createIceTransport(this.iceTransport.connection),
                    srtpProfiles: this.srtpProfiles,
                    extendedMasterSecret: true,
                });
            }
            this.dtls.onData.subscribe((buf) => {
                if (this.config.debug.inboundPacketLoss &&
                    this.config.debug.inboundPacketLoss / 100 < Math.random()) {
                    return;
                }
                this.dataReceiver(buf);
            });
            this.dtls.onClose.subscribe(() => {
                this.setState("closed");
            });
            this.dtls.onConnect.once(r);
            this.dtls.onError.subscribe((error) => {
                this.setState("failed");
                log("dtls failed", error);
            });
            if (this.dtls instanceof src_1.DtlsClient) {
                await (0, promises_1.setTimeout)(100);
                this.dtls.connect().catch((error) => {
                    this.setState("failed");
                    log("dtls connect failed", error);
                });
            }
        });
        if (this.srtpProfiles.length > 0) {
            this.startSrtp();
        }
        this.dtls.onConnect.subscribe(() => {
            this.updateSrtpSession();
            this.setState("connected");
        });
        this.setState("connected");
        log("dtls connected");
    }
    updateSrtpSession() {
        if (!this.dtls)
            throw new Error();
        const profile = this.dtls.srtp.srtpProfile;
        if (!profile) {
            throw new Error("need srtpProfile");
        }
        log("selected SRTP Profile", profile);
        const { localKey, localSalt, remoteKey, remoteSalt } = this.dtls.extractSessionKeys((0, const_2.keyLength)(profile), (0, const_2.saltLength)(profile));
        const config = {
            keys: {
                localMasterKey: localKey,
                localMasterSalt: localSalt,
                remoteMasterKey: remoteKey,
                remoteMasterSalt: remoteSalt,
            },
            profile,
        };
        this.srtp = new src_2.SrtpSession(config);
        this.srtcp = new src_2.SrtcpSession(config);
    }
    startSrtp() {
        if (this.srtpStarted)
            return;
        this.srtpStarted = true;
        this.updateSrtpSession();
        this.iceTransport.connection.onData.subscribe((data) => {
            if (this.config.debug.inboundPacketLoss &&
                this.config.debug.inboundPacketLoss / 100 < Math.random()) {
                return;
            }
            if (!(0, utils_1.isMedia)(data))
                return;
            if ((0, utils_1.isRtcp)(data)) {
                const dec = this.srtcp.decrypt(data);
                const rtcps = src_2.RtcpPacketConverter.deSerialize(dec);
                rtcps.forEach((rtcp) => this.router.routeRtcp(rtcp));
            }
            else {
                const dec = this.srtp.decrypt(data);
                const rtp = src_2.RtpPacket.deSerialize(dec);
                try {
                    this.router.routeRtp(rtp);
                }
                catch (error) {
                    log("router error", error);
                }
            }
        });
    }
    async sendRtp(payload, header) {
        const enc = this.srtp.encrypt(payload, header);
        if (this.config.debug.outboundPacketLoss &&
            this.config.debug.outboundPacketLoss / 100 < Math.random()) {
            return enc.length;
        }
        await this.iceTransport.connection.send(enc).catch(() => { });
        return enc.length;
    }
    async sendRtcp(packets) {
        const payload = Buffer.concat(packets.map((packet) => packet.serialize()));
        const enc = this.srtcp.encrypt(payload);
        if (this.config.debug.outboundPacketLoss &&
            this.config.debug.outboundPacketLoss / 100 < Math.random()) {
            return enc.length;
        }
        await this.iceTransport.connection.send(enc).catch(() => { });
    }
    setState(state) {
        if (state != this.state) {
            this.state = state;
            this.onStateChange.execute(state);
        }
    }
    async stop() {
        this.setState("closed");
        // todo impl send alert
    }
}
exports.RTCDtlsTransport = RTCDtlsTransport;
exports.DtlsStates = [
    "new",
    "connecting",
    "connected",
    "closed",
    "failed",
];
class RTCCertificate {
    constructor(privateKeyPem, certPem, signatureHash) {
        Object.defineProperty(this, "certPem", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: certPem
        });
        Object.defineProperty(this, "signatureHash", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: signatureHash
        });
        Object.defineProperty(this, "publicKey", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "privateKey", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        const cert = x509_1.Certificate.fromPEM(Buffer.from(certPem));
        this.publicKey = cert.publicKey.toPEM();
        this.privateKey = x509_1.PrivateKey.fromPEM(Buffer.from(privateKeyPem)).toPEM();
    }
    getFingerprints() {
        return [
            new RTCDtlsFingerprint("sha-256", (0, utils_1.fingerprint)(x509_1.Certificate.fromPEM(Buffer.from(this.certPem)).raw, "sha256")),
        ];
    }
}
exports.RTCCertificate = RTCCertificate;
class RTCDtlsFingerprint {
    constructor(algorithm, value) {
        Object.defineProperty(this, "algorithm", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: algorithm
        });
        Object.defineProperty(this, "value", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: value
        });
    }
}
exports.RTCDtlsFingerprint = RTCDtlsFingerprint;
class RTCDtlsParameters {
    constructor(fingerprints = [], role) {
        Object.defineProperty(this, "fingerprints", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: fingerprints
        });
        Object.defineProperty(this, "role", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: role
        });
    }
}
exports.RTCDtlsParameters = RTCDtlsParameters;
class IceTransport {
    constructor(ice) {
        Object.defineProperty(this, "ice", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: ice
        });
        Object.defineProperty(this, "onData", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "send", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (data) => {
                return this.ice.send(data);
            }
        });
        ice.onData.subscribe((buf) => {
            if ((0, utils_1.isDtls)(buf)) {
                if (this.onData)
                    this.onData(buf);
            }
        });
    }
    close() {
        this.ice.close();
    }
}
const createIceTransport = (ice) => new IceTransport(ice);
//# sourceMappingURL=dtls.js.map