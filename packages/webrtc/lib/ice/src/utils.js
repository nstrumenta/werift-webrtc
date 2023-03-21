"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeFamilyNodeV18 = exports.getGlobalIp = void 0;
const ice_1 = require("./ice");
const protocol_1 = require("./stun/protocol");
async function getGlobalIp(stunServer, interfaceAddresses) {
    const connection = new ice_1.Connection(true, {
        stunServer: stunServer ?? ["stun.l.google.com", 19302],
    });
    await connection.gatherCandidates();
    const protocol = new protocol_1.StunProtocol(connection);
    protocol.localCandidate = connection.localCandidates[0];
    await protocol.connectionMade(true, undefined, interfaceAddresses);
    const candidate = await (0, ice_1.serverReflexiveCandidate)(protocol, [
        "stun.l.google.com",
        19302,
    ]);
    await connection.close();
    await protocol.close();
    return candidate?.host;
}
exports.getGlobalIp = getGlobalIp;
function normalizeFamilyNodeV18(family) {
    if (family === "IPv4")
        return 4;
    if (family === "IPv6")
        return 6;
    return family;
}
exports.normalizeFamilyNodeV18 = normalizeFamilyNodeV18;
//# sourceMappingURL=utils.js.map