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
exports.validateAddress = exports.serverReflexiveCandidate = exports.getHostAddresses = exports.candidatePairPriority = exports.sortCandidatePairs = exports.validateRemoteCandidate = exports.CandidatePairState = exports.CandidatePair = exports.Connection = void 0;
const crypto_1 = require("crypto");
const debug_1 = __importDefault(require("debug"));
const int64_buffer_1 = require("int64-buffer");
const nodeIp = __importStar(require("ip"));
const isEqual_1 = __importDefault(require("lodash/isEqual"));
const range_1 = __importDefault(require("lodash/range"));
const net_1 = require("net");
const os_1 = __importDefault(require("os"));
const p_cancelable_1 = __importDefault(require("p-cancelable"));
const rx_mini_1 = require("rx.mini");
const promises_1 = __importDefault(require("timers/promises"));
const candidate_1 = require("./candidate");
const lookup_1 = require("./dns/lookup");
const helper_1 = require("./helper");
const const_1 = require("./stun/const");
const message_1 = require("./stun/message");
const protocol_1 = require("./stun/protocol");
const protocol_2 = require("./turn/protocol");
const utils_1 = require("./utils");
const log = (0, debug_1.default)("werift-ice : packages/ice/src/ice.ts : log");
class Connection {
    get nominatedKeys() {
        return Object.keys(this.nominated).map((v) => v.toString());
    }
    constructor(iceControlling, options) {
        Object.defineProperty(this, "iceControlling", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: iceControlling
        });
        Object.defineProperty(this, "localUserName", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (0, helper_1.randomString)(4)
        });
        Object.defineProperty(this, "localPassword", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (0, helper_1.randomString)(22)
        });
        Object.defineProperty(this, "remotePassword", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: ""
        });
        Object.defineProperty(this, "remoteUsername", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: ""
        });
        Object.defineProperty(this, "remoteIsLite", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        Object.defineProperty(this, "checkList", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "localCandidates", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "stunServer", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "turnServer", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "useIpv4", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "useIpv6", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "options", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "remoteCandidatesEnd", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        /**コンポーネントはデータストリームの一部です. データストリームには複数のコンポーネントが必要な場合があり、
         * データストリーム全体が機能するには、それぞれが機能する必要があります.
         *  RTP / RTCPデータストリームの場合、RTPとRTCPが同じポートで多重化されていない限り、データストリームごとに2つのコンポーネントがあります.
         * 1つはRTP用、もう1つはRTCP用です. コンポーネントには候補ペアがあり、他のコンポーネントでは使用できません.  */
        Object.defineProperty(this, "_components", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_localCandidatesEnd", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        Object.defineProperty(this, "_tieBreaker", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: BigInt(new int64_buffer_1.Uint64BE((0, crypto_1.randomBytes)(64)).toString())
        });
        Object.defineProperty(this, "state", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "new"
        });
        Object.defineProperty(this, "dnsLookup", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "onData", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new rx_mini_1.Event()
        });
        Object.defineProperty(this, "stateChanged", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new rx_mini_1.Event()
        });
        Object.defineProperty(this, "_remoteCandidates", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        // P2P接続完了したソケット
        Object.defineProperty(this, "nominated", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: {}
        });
        Object.defineProperty(this, "nominating", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Set()
        });
        Object.defineProperty(this, "checkListDone", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        Object.defineProperty(this, "checkListState", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new helper_1.PQueue()
        });
        Object.defineProperty(this, "earlyChecks", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "localCandidatesStart", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        Object.defineProperty(this, "protocols", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "queryConsentHandle", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "promiseGatherCandidates", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        // 4.1.1.4 ? 生存確認 life check
        Object.defineProperty(this, "queryConsent", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: () => new p_cancelable_1.default(async (r, f, onCancel) => {
                let failures = 0;
                const cancelEvent = new AbortController();
                onCancel(() => {
                    failures += CONSENT_FAILURES;
                    cancelEvent.abort();
                    f("cancel");
                });
                // """
                // Periodically check consent (RFC 7675).
                // """
                try {
                    while (!this.remoteIsLite && this.state !== "closed") {
                        // # randomize between 0.8 and 1.2 times CONSENT_INTERVAL
                        await promises_1.default.setTimeout(CONSENT_INTERVAL * (0.8 + 0.4 * Math.random()) * 1000, undefined, { signal: cancelEvent.signal });
                        for (const key of this.nominatedKeys) {
                            const pair = this.nominated[Number(key)];
                            const request = this.buildRequest(pair, false);
                            try {
                                const [msg, addr] = await pair.protocol.request(request, pair.remoteAddr, Buffer.from(this.remotePassword, "utf8"), 0);
                                failures = 0;
                                if (this.state === "disconnected") {
                                    this.setState("connected");
                                }
                            }
                            catch (error) {
                                log("no stun response");
                                failures++;
                                this.setState("disconnected");
                            }
                            if (failures >= CONSENT_FAILURES) {
                                log("Consent to send expired");
                                this.queryConsentHandle = undefined;
                                // 切断検知
                                r(await this.close());
                                return;
                            }
                        }
                    }
                }
                catch (error) { }
            })
        });
        Object.defineProperty(this, "send", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: async (data) => {
                // """
                // Send a datagram on the first component.
                // If the connection is not established, a `ConnectionError` is raised.
                // :param data: The data to be sent.
                // """
                await this.sendTo(data, 1);
            }
        });
        // 3.  Terminology : Check
        Object.defineProperty(this, "checkStart", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (pair) => new p_cancelable_1.default(async (r, f, onCancel) => {
                onCancel(() => f("cancel"));
                // """
                // Starts a check.
                // """
                log("check start", pair.toJSON());
                this.setPairState(pair, CandidatePairState.IN_PROGRESS);
                const nominate = this.iceControlling && !this.remoteIsLite;
                const request = this.buildRequest(pair, nominate);
                const result = {};
                try {
                    const [response, addr] = await pair.protocol.request(request, pair.remoteAddr, Buffer.from(this.remotePassword, "utf8"), 4);
                    log("response", response, addr);
                    result.response = response;
                    result.addr = addr;
                }
                catch (error) {
                    const exc = error;
                    // 7.1.3.1.  Failure Cases
                    log("failure case", exc.response);
                    if (exc.response?.getAttributeValue("ERROR-CODE")[0] === 487) {
                        if (request.attributesKeys.includes("ICE-CONTROLLED")) {
                            this.switchRole(true);
                        }
                        else if (request.attributesKeys.includes("ICE-CONTROLLING")) {
                            this.switchRole(false);
                        }
                        await this.checkStart(pair);
                        r();
                        return;
                    }
                    else {
                        // timeout
                        log("CandidatePairState.FAILED", pair.toJSON());
                        this.setPairState(pair, CandidatePairState.FAILED);
                        this.checkComplete(pair);
                        r();
                        return;
                    }
                }
                // # check remote address matches
                if (!(0, isEqual_1.default)(result.addr, pair.remoteAddr)) {
                    this.setPairState(pair, CandidatePairState.FAILED);
                    this.checkComplete(pair);
                    r();
                    return;
                }
                // # success
                if (nominate || pair.remoteNominated) {
                    // # nominated by agressive nomination or the remote party
                    pair.nominated = true;
                }
                else if (this.iceControlling && !this.nominating.has(pair.component)) {
                    // # perform regular nomination
                    this.nominating.add(pair.component);
                    const request = this.buildRequest(pair, true);
                    try {
                        await pair.protocol.request(request, pair.remoteAddr, Buffer.from(this.remotePassword, "utf8"));
                    }
                    catch (error) {
                        this.setPairState(pair, CandidatePairState.FAILED);
                        this.checkComplete(pair);
                        return;
                    }
                    pair.nominated = true;
                }
                this.setPairState(pair, CandidatePairState.SUCCEEDED);
                this.checkComplete(pair);
                r();
            })
        });
        Object.defineProperty(this, "pairRemoteCandidate", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (remoteCandidate) => {
                for (const protocol of this.protocols) {
                    if (protocol.localCandidate?.canPairWith(remoteCandidate) &&
                        !this.findPair(protocol, remoteCandidate)) {
                        const pair = new CandidatePair(protocol, remoteCandidate);
                        this.checkList.push(pair);
                        this.setPairState(pair, CandidatePairState.WAITING);
                    }
                }
            }
        });
        this.options = {
            ...defaultOptions,
            ...options,
        };
        const { components, stunServer, turnServer, useIpv4, useIpv6 } = this.options;
        this.stunServer = validateAddress(stunServer);
        this.turnServer = validateAddress(turnServer);
        this.useIpv4 = useIpv4;
        this.useIpv6 = useIpv6;
        this._components = new Set((0, range_1.default)(1, components + 1));
    }
    setRemoteParams({ iceLite, usernameFragment, password, }) {
        log("setRemoteParams", { iceLite, usernameFragment, password });
        this.remoteIsLite = iceLite;
        this.remoteUsername = usernameFragment;
        this.remotePassword = password;
    }
    // 4.1.1 Gathering Candidates
    async gatherCandidates(cb) {
        if (!this.localCandidatesStart) {
            this.localCandidatesStart = true;
            this.promiseGatherCandidates = new rx_mini_1.Event();
            let address = getHostAddresses(this.useIpv4, this.useIpv6);
            if (this.options.additionalHostAddresses) {
                address = Array.from(new Set([...this.options.additionalHostAddresses, ...address]));
            }
            for (const component of this._components) {
                const candidates = await this.getComponentCandidates(component, address, 5, cb);
                this.localCandidates = [...this.localCandidates, ...candidates];
            }
            this._localCandidatesEnd = true;
            this.promiseGatherCandidates.execute();
        }
        this.setState("completed");
    }
    async getComponentCandidates(component, addresses, timeout = 5, cb) {
        let candidates = [];
        for (const address of addresses) {
            // # create transport
            const protocol = new protocol_1.StunProtocol(this);
            await protocol.connectionMade((0, net_1.isIPv4)(address), this.options.portRange, this.options.interfaceAddresses);
            protocol.localAddress = address;
            this.protocols.push(protocol);
            // # add host candidate
            const candidateAddress = [address, protocol.getExtraInfo()[1]];
            protocol.localCandidate = new candidate_1.Candidate((0, candidate_1.candidateFoundation)("host", "udp", candidateAddress[0]), component, "udp", (0, candidate_1.candidatePriority)(component, "host"), candidateAddress[0], candidateAddress[1], "host");
            candidates.push(protocol.localCandidate);
            if (cb) {
                cb(protocol.localCandidate);
            }
        }
        // # query STUN server for server-reflexive candidates (IPv4 only)
        const stunServer = this.stunServer;
        if (stunServer) {
            try {
                const srflxCandidates = (await Promise.all(this.protocols.map((protocol) => new Promise(async (r, f) => {
                    const timer = setTimeout(f, timeout * 1000);
                    if (protocol.localCandidate?.host &&
                        (0, net_1.isIPv4)(protocol.localCandidate?.host)) {
                        const candidate = await serverReflexiveCandidate(protocol, stunServer).catch((error) => log("error", error));
                        if (candidate && cb)
                            cb(candidate);
                        clearTimeout(timer);
                        r(candidate);
                    }
                    else {
                        clearTimeout(timer);
                        r();
                    }
                })))).filter((v) => typeof v !== "undefined");
                candidates = [...candidates, ...srflxCandidates];
            }
            catch (error) {
                log("query STUN server", error);
            }
        }
        if (this.turnServer &&
            this.options.turnUsername &&
            this.options.turnPassword) {
            const protocol = await (0, protocol_2.createTurnEndpoint)(this.turnServer, this.options.turnUsername, this.options.turnPassword, {
                portRange: this.options.portRange,
                interfaceAddresses: this.options.interfaceAddresses,
            });
            this.protocols.push(protocol);
            const candidateAddress = protocol.turn.relayedAddress;
            const relatedAddress = protocol.turn.mappedAddress;
            log("turn candidateAddress", candidateAddress);
            protocol.localCandidate = new candidate_1.Candidate((0, candidate_1.candidateFoundation)("relay", "udp", candidateAddress[0]), component, "udp", (0, candidate_1.candidatePriority)(component, "relay"), candidateAddress[0], candidateAddress[1], "relay", relatedAddress[0], relatedAddress[1]);
            protocol.receiver = this;
            if (this.options.forceTurn) {
                candidates = [];
            }
            candidates.push(protocol.localCandidate);
        }
        return candidates;
    }
    async connect() {
        // """
        // Perform ICE handshake.
        //
        // This coroutine returns if a candidate pair was successfully nominated
        // and raises an exception otherwise.
        // """
        log("start connect ice", this.localCandidates);
        if (!this._localCandidatesEnd) {
            if (!this.localCandidatesStart)
                throw new Error("Local candidates gathering was not performed");
            if (this.promiseGatherCandidates)
                // wait for GatherCandidates finish
                await this.promiseGatherCandidates.asPromise();
        }
        if (!this.remoteUsername || !this.remotePassword)
            throw new Error("Remote username or password is missing");
        // # 5.7.1. Forming Candidate Pairs
        this.remoteCandidates.forEach(this.pairRemoteCandidate);
        this.sortCheckList();
        this.unfreezeInitial();
        // # handle early checks
        this.earlyChecks.forEach((earlyCheck) => this.checkIncoming(...earlyCheck));
        this.earlyChecks = [];
        // # perform checks
        // 5.8.  Scheduling Checks
        for (;;) {
            if (this.state === "closed")
                break;
            if (!this.schedulingChecks())
                break;
            await promises_1.default.setTimeout(20);
        }
        // # wait for completion
        let res = ICE_FAILED;
        while (this.checkList.length > 0 && res === ICE_FAILED) {
            res = await this.checkListState.get();
        }
        // # cancel remaining checks
        this.checkList.forEach((check) => check.handle?.cancel());
        if (res !== ICE_COMPLETED) {
            throw new Error("ICE negotiation failed");
        }
        // # start consent freshness tests
        this.queryConsentHandle = (0, helper_1.future)(this.queryConsent());
        this.setState("connected");
    }
    unfreezeInitial() {
        // # unfreeze first pair for the first component
        const firstPair = this.checkList.find((pair) => pair.component === Math.min(...[...this._components]));
        if (!firstPair)
            return;
        if (firstPair.state === CandidatePairState.FROZEN) {
            this.setPairState(firstPair, CandidatePairState.WAITING);
        }
        // # unfreeze pairs with same component but different foundations
        const seenFoundations = new Set(firstPair.localCandidate.foundation);
        for (const pair of this.checkList) {
            if (pair.component === firstPair.component &&
                !seenFoundations.has(pair.localCandidate.foundation) &&
                pair.state === CandidatePairState.FROZEN) {
                this.setPairState(pair, CandidatePairState.WAITING);
                seenFoundations.add(pair.localCandidate.foundation);
            }
        }
    }
    // 5.8 Scheduling Checks
    schedulingChecks() {
        // Ordinary Check
        {
            // # find the highest-priority pair that is in the waiting state
            const pair = this.checkList
                .filter((pair) => {
                if (this.options.forceTurn && pair.protocol.type === "stun")
                    return false;
                return true;
            })
                .find((pair) => pair.state === CandidatePairState.WAITING);
            if (pair) {
                pair.handle = (0, helper_1.future)(this.checkStart(pair));
                return true;
            }
        }
        {
            // # find the highest-priority pair that is in the frozen state
            const pair = this.checkList.find((pair) => pair.state === CandidatePairState.FROZEN);
            if (pair) {
                pair.handle = (0, helper_1.future)(this.checkStart(pair));
                return true;
            }
        }
        // # if we expect more candidates, keep going
        if (!this.remoteCandidatesEnd) {
            return !this.checkListDone;
        }
        return false;
    }
    async close() {
        // """
        // Close the connection.
        // """
        this.setState("closed");
        // # stop consent freshness tests
        if (this.queryConsentHandle && !this.queryConsentHandle.done()) {
            this.queryConsentHandle.cancel();
            try {
                await this.queryConsentHandle.promise;
            }
            catch (error) {
                // pass
            }
        }
        // # stop check list
        if (this.checkList && !this.checkListDone) {
            this.checkListState.put(new Promise((r) => {
                r(ICE_FAILED);
            }));
        }
        this.nominated = {};
        for (const protocol of this.protocols) {
            if (protocol.close) {
                await protocol.close();
            }
        }
        this.protocols = [];
        this.localCandidates = [];
        await this.dnsLookup?.close();
    }
    setState(state) {
        this.state = state;
        this.stateChanged.execute(state);
    }
    async addRemoteCandidate(remoteCandidate) {
        // """
        // Add a remote candidate or signal end-of-candidates.
        // To signal end-of-candidates, pass `None`.
        // :param remote_candidate: A :class:`Candidate` instance or `None`.
        // """
        if (!remoteCandidate) {
            this.pruneComponents();
            this.remoteCandidatesEnd = true;
            return;
        }
        if (remoteCandidate.host.includes(".local")) {
            try {
                if (this.state === "closed")
                    return;
                if (!this.dnsLookup) {
                    this.dnsLookup = new lookup_1.DnsLookup();
                }
                const host = await this.dnsLookup.lookup(remoteCandidate.host);
                remoteCandidate.host = host;
            }
            catch (error) {
                return;
            }
        }
        try {
            validateRemoteCandidate(remoteCandidate);
        }
        catch (error) {
            return;
        }
        log("addRemoteCandidate", remoteCandidate);
        this.remoteCandidates.push(remoteCandidate);
        this.pairRemoteCandidate(remoteCandidate);
        this.sortCheckList();
    }
    async sendTo(data, component) {
        // """
        // Send a datagram on the specified component.
        // If the connection is not established, a `ConnectionError` is raised.
        // :param data: The data to be sent.
        // :param component: The component on which to send the data.
        // """
        const activePair = this.nominated[component];
        if (activePair) {
            await activePair.protocol.sendData(data, activePair.remoteAddr);
        }
        else {
            // log("Cannot send data, ice not connected");
            return;
        }
    }
    getDefaultCandidate(component) {
        const candidates = this.localCandidates.sort((a, b) => a.priority - b.priority);
        const candidate = candidates.find((candidate) => candidate.component === component);
        return candidate;
    }
    requestReceived(message, addr, protocol, rawData) {
        if (message.messageMethod !== const_1.methods.BINDING) {
            this.respondError(message, addr, protocol, [400, "Bad Request"]);
            return;
        }
        // # authenticate request
        try {
            (0, message_1.parseMessage)(rawData, Buffer.from(this.localPassword, "utf8"));
            if (!this.remoteUsername) {
                const rxUsername = `${this.localUserName}:${this.remoteUsername}`;
                if (message.getAttributeValue("USERNAME") != rxUsername) {
                    throw new Error("Wrong username");
                }
            }
        }
        catch (error) {
            this.respondError(message, addr, protocol, [400, "Bad Request"]);
            return;
        }
        const { iceControlling } = this;
        // 7.2.1.1.  Detecting and Repairing Role Conflicts
        if (iceControlling && message.attributesKeys.includes("ICE-CONTROLLING")) {
            if (this._tieBreaker >= message.getAttributeValue("ICE-CONTROLLING")) {
                this.respondError(message, addr, protocol, [487, "Role Conflict"]);
                return;
            }
            else {
                this.switchRole(false);
            }
        }
        else if (!iceControlling &&
            message.attributesKeys.includes("ICE-CONTROLLED")) {
            if (this._tieBreaker < message.getAttributeValue("ICE-CONTROLLED")) {
                this.respondError(message, addr, protocol, [487, "Role Conflict"]);
            }
            else {
                this.switchRole(true);
                return;
            }
        }
        if (this.options.filterStunResponse &&
            !this.options.filterStunResponse(message, addr, protocol)) {
            return;
        }
        // # send binding response
        const response = new message_1.Message(const_1.methods.BINDING, const_1.classes.RESPONSE, message.transactionId);
        response
            .setAttribute("XOR-MAPPED-ADDRESS", addr)
            .addMessageIntegrity(Buffer.from(this.localPassword, "utf8"))
            .addFingerprint();
        protocol.sendStun(response, addr);
        // todo fix
        // if (this.checkList.length === 0) {
        //   this.earlyChecks.push([message, addr, protocol]);
        // } else {
        this.checkIncoming(message, addr, protocol);
        // }
    }
    dataReceived(data, component) {
        try {
            this.onData.execute(data, component);
        }
        catch (error) {
            log("dataReceived", error);
        }
    }
    // for test only
    set remoteCandidates(value) {
        if (this.remoteCandidatesEnd)
            throw new Error("Cannot set remote candidates after end-of-candidates.");
        this._remoteCandidates = [];
        for (const remoteCandidate of value) {
            try {
                validateRemoteCandidate(remoteCandidate);
            }
            catch (error) {
                continue;
            }
            this.remoteCandidates.push(remoteCandidate);
        }
        this.pruneComponents();
        this.remoteCandidatesEnd = true;
    }
    get remoteCandidates() {
        return this._remoteCandidates;
    }
    pruneComponents() {
        const seenComponents = new Set(this.remoteCandidates.map((v) => v.component));
        const missingComponents = [...(0, helper_1.difference)(this._components, seenComponents)];
        if (missingComponents.length > 0) {
            this._components = seenComponents;
        }
    }
    sortCheckList() {
        sortCandidatePairs(this.checkList, this.iceControlling);
    }
    findPair(protocol, remoteCandidate) {
        const pair = this.checkList.find((pair) => (0, isEqual_1.default)(pair.protocol, protocol) &&
            (0, isEqual_1.default)(pair.remoteCandidate, remoteCandidate));
        return pair;
    }
    setPairState(pair, state) {
        log("setPairState", pair.toJSON(), CandidatePairState[state]);
        pair.updateState(state);
    }
    switchRole(iceControlling) {
        log("switch role", iceControlling);
        this.iceControlling = iceControlling;
        this.sortCheckList();
    }
    resetNominatedPair() {
        log("resetNominatedPair");
        this.nominated = {};
        this.nominating.clear();
    }
    checkComplete(pair) {
        pair.handle = undefined;
        if (pair.state === CandidatePairState.SUCCEEDED) {
            // Updating the Nominated Flag
            // https://www.rfc-editor.org/rfc/rfc8445#section-7.3.1.5,
            // Once the nominated flag is set for a component of a data stream, it
            // concludes the ICE processing for that component.  See Section 8.
            // So disallow overwriting of the pair nominated for that component
            if (pair.nominated && this.nominated[pair.component] == undefined) {
                log("nominated", pair.toJSON());
                this.nominated[pair.component] = pair;
                this.nominating.delete(pair.component);
                // 8.1.2.  Updating States
                // The agent MUST remove all Waiting and Frozen pairs in the check
                // list and triggered check queue for the same component as the
                // nominated pairs for that media stream.
                for (const p of this.checkList) {
                    if (p.component === pair.component &&
                        [CandidatePairState.WAITING, CandidatePairState.FROZEN].includes(p.state)) {
                        this.setPairState(p, CandidatePairState.FAILED);
                    }
                }
            }
            // Once there is at least one nominated pair in the valid list for
            // every component of at least one media stream and the state of the
            // check list is Running:
            if (this.nominatedKeys.length === this._components.size) {
                if (!this.checkListDone) {
                    log("ICE completed");
                    this.checkListState.put(new Promise((r) => r(ICE_COMPLETED)));
                    this.checkListDone = true;
                }
                return;
            }
            // 7.1.3.2.3.  Updating Pair States
            for (const p of this.checkList) {
                if (p.localCandidate.foundation === pair.localCandidate.foundation &&
                    p.state === CandidatePairState.FROZEN) {
                    this.setPairState(p, CandidatePairState.WAITING);
                }
            }
        }
        {
            const list = [CandidatePairState.SUCCEEDED, CandidatePairState.FAILED];
            if (this.checkList.find(({ state }) => !list.includes(state))) {
                return;
            }
        }
        if (!this.iceControlling) {
            const target = CandidatePairState.SUCCEEDED;
            if (this.checkList.find(({ state }) => state === target)) {
                return;
            }
        }
        if (!this.checkListDone) {
            log("ICE failed");
            this.checkListState.put(new Promise((r) => {
                r(ICE_FAILED);
            }));
        }
    }
    // 7.2.  STUN Server Procedures
    // 7.2.1.3、7.2.1.4、および7.2.1.5
    checkIncoming(message, addr, protocol) {
        // log("checkIncoming", message.toJSON(), addr);
        // """
        // Handle a successful incoming check.
        // """
        const component = protocol.localCandidate?.component;
        if (component == undefined) {
            throw new Error("component not exist");
        }
        // find remote candidate
        let remoteCandidate;
        const [host, port] = addr;
        for (const c of this.remoteCandidates) {
            if (c.host === host && c.port === port) {
                remoteCandidate = c;
                if (remoteCandidate.component !== component) {
                    throw new Error("checkIncoming");
                }
                break;
            }
        }
        if (!remoteCandidate) {
            // 7.2.1.3.  Learning Peer Reflexive Candidates
            remoteCandidate = new candidate_1.Candidate((0, helper_1.randomString)(10), component, "udp", message.getAttributeValue("PRIORITY"), host, port, "prflx");
            this.remoteCandidates.push(remoteCandidate);
        }
        // find pair
        let pair = this.findPair(protocol, remoteCandidate);
        if (!pair) {
            pair = new CandidatePair(protocol, remoteCandidate);
            this.setPairState(pair, CandidatePairState.WAITING);
            this.checkList.push(pair);
            this.sortCheckList();
        }
        // 7.2.1.4.  Triggered Checks
        if ([CandidatePairState.WAITING, CandidatePairState.FAILED].includes(pair.state)) {
            pair.handle = (0, helper_1.future)(this.checkStart(pair));
        }
        else {
            pair;
        }
        // 7.2.1.5. Updating the Nominated Flag
        if (message.attributesKeys.includes("USE-CANDIDATE") &&
            !this.iceControlling) {
            pair.remoteNominated = true;
            if (pair.state === CandidatePairState.SUCCEEDED) {
                pair.nominated = true;
                this.checkComplete(pair);
            }
        }
    }
    buildRequest(pair, nominate) {
        const txUsername = `${this.remoteUsername}:${this.localUserName}`;
        const request = new message_1.Message(const_1.methods.BINDING, const_1.classes.REQUEST);
        request
            .setAttribute("USERNAME", txUsername)
            .setAttribute("PRIORITY", (0, candidate_1.candidatePriority)(pair.component, "prflx"));
        if (this.iceControlling) {
            request.setAttribute("ICE-CONTROLLING", this._tieBreaker);
            if (nominate) {
                request.setAttribute("USE-CANDIDATE", null);
            }
        }
        else {
            request.setAttribute("ICE-CONTROLLED", this._tieBreaker);
        }
        return request;
    }
    respondError(request, addr, protocol, errorCode) {
        const response = new message_1.Message(request.messageMethod, const_1.classes.ERROR, request.transactionId);
        response
            .setAttribute("ERROR-CODE", errorCode)
            .addMessageIntegrity(Buffer.from(this.localPassword, "utf8"))
            .addFingerprint();
        protocol.sendStun(response, addr);
    }
}
exports.Connection = Connection;
class CandidatePair {
    get state() {
        return this._state;
    }
    toJSON() {
        return {
            protocol: this.protocol.type,
            remoteAddr: this.remoteAddr,
        };
    }
    constructor(protocol, remoteCandidate) {
        Object.defineProperty(this, "protocol", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: protocol
        });
        Object.defineProperty(this, "remoteCandidate", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: remoteCandidate
        });
        Object.defineProperty(this, "handle", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "nominated", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        Object.defineProperty(this, "remoteNominated", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        // 5.7.4.  Computing States
        Object.defineProperty(this, "_state", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: CandidatePairState.FROZEN
        });
    }
    updateState(state) {
        this._state = state;
    }
    get localCandidate() {
        if (!this.protocol.localCandidate)
            throw new Error("localCandidate not exist");
        return this.protocol.localCandidate;
    }
    get remoteAddr() {
        return [this.remoteCandidate.host, this.remoteCandidate.port];
    }
    get component() {
        return this.localCandidate.component;
    }
}
exports.CandidatePair = CandidatePair;
const ICE_COMPLETED = 1;
const ICE_FAILED = 2;
const CONSENT_INTERVAL = 5;
const CONSENT_FAILURES = 6;
var CandidatePairState;
(function (CandidatePairState) {
    CandidatePairState[CandidatePairState["FROZEN"] = 0] = "FROZEN";
    CandidatePairState[CandidatePairState["WAITING"] = 1] = "WAITING";
    CandidatePairState[CandidatePairState["IN_PROGRESS"] = 2] = "IN_PROGRESS";
    CandidatePairState[CandidatePairState["SUCCEEDED"] = 3] = "SUCCEEDED";
    CandidatePairState[CandidatePairState["FAILED"] = 4] = "FAILED";
})(CandidatePairState = exports.CandidatePairState || (exports.CandidatePairState = {}));
const defaultOptions = {
    components: 1,
    useIpv4: true,
    useIpv6: true,
};
function validateRemoteCandidate(candidate) {
    // """
    // Check the remote candidate is supported.
    // """
    if (!["host", "relay", "srflx"].includes(candidate.type))
        throw new Error(`Unexpected candidate type "${candidate.type}"`);
    // ipaddress.ip_address(candidate.host)
    return candidate;
}
exports.validateRemoteCandidate = validateRemoteCandidate;
function sortCandidatePairs(pairs, iceControlling) {
    pairs.sort((a, b) => candidatePairPriority(a.localCandidate, a.remoteCandidate, iceControlling) -
        candidatePairPriority(b.localCandidate, b.remoteCandidate, iceControlling));
}
exports.sortCandidatePairs = sortCandidatePairs;
// 5.7.2.  Computing Pair Priority and Ordering Pairs
function candidatePairPriority(local, remote, iceControlling) {
    const G = (iceControlling && local.priority) || remote.priority;
    const D = (iceControlling && remote.priority) || local.priority;
    return (1 << 32) * Math.min(G, D) + 2 * Math.max(G, D) + (G > D ? 1 : 0);
}
exports.candidatePairPriority = candidatePairPriority;
function isAutoconfigurationAddress(info) {
    return ((0, utils_1.normalizeFamilyNodeV18)(info.family) === 4 &&
        info.address?.startsWith("169.254."));
}
function nodeIpAddress(family) {
    // https://chromium.googlesource.com/external/webrtc/+/master/rtc_base/network.cc#236
    const costlyNetworks = ["ipsec", "tun", "utun", "tap"];
    const banNetworks = ["vmnet", "veth"];
    const interfaces = os_1.default.networkInterfaces();
    const all = Object.keys(interfaces)
        .map((nic) => {
        for (const word of [...costlyNetworks, ...banNetworks]) {
            if (nic.startsWith(word)) {
                return {
                    nic,
                    addresses: [],
                };
            }
        }
        const addresses = interfaces[nic].filter((details) => (0, utils_1.normalizeFamilyNodeV18)(details.family) === family &&
            !nodeIp.isLoopback(details.address) &&
            !isAutoconfigurationAddress(details));
        return {
            nic,
            addresses: addresses.map((address) => address.address),
        };
    })
        .filter((address) => !!address);
    // os.networkInterfaces doesn't actually return addresses in a good order.
    // have seen instances where en0 (ethernet) is after en1 (wlan), etc.
    // eth0 > eth1
    all.sort((a, b) => a.nic.localeCompare(b.nic));
    return Object.values(all)
        .map((entry) => entry.addresses)
        .flat();
}
function getHostAddresses(useIpv4, useIpv6) {
    const address = [];
    if (useIpv4)
        address.push(...nodeIpAddress(4));
    if (useIpv6)
        address.push(...nodeIpAddress(6));
    return address;
}
exports.getHostAddresses = getHostAddresses;
async function serverReflexiveCandidate(protocol, stunServer) {
    // """
    // Query STUN server to obtain a server-reflexive candidate.
    // """
    // # perform STUN query
    const request = new message_1.Message(const_1.methods.BINDING, const_1.classes.REQUEST);
    try {
        const [response] = await protocol.request(request, stunServer);
        const localCandidate = protocol.localCandidate;
        if (!localCandidate)
            throw new Error("not exist");
        return new candidate_1.Candidate((0, candidate_1.candidateFoundation)("srflx", "udp", localCandidate.host), localCandidate.component, localCandidate.transport, (0, candidate_1.candidatePriority)(localCandidate.component, "srflx"), response.getAttributeValue("XOR-MAPPED-ADDRESS")[0], response.getAttributeValue("XOR-MAPPED-ADDRESS")[1], "srflx", localCandidate.host, localCandidate.port);
    }
    catch (error) {
        // todo fix
        log("error serverReflexiveCandidate", error);
    }
}
exports.serverReflexiveCandidate = serverReflexiveCandidate;
function validateAddress(addr) {
    if (addr && isNaN(addr[1])) {
        return [addr[0], 443];
    }
    return addr;
}
exports.validateAddress = validateAddress;
//# sourceMappingURL=ice.js.map