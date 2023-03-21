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
Object.defineProperty(exports, "__esModule", { value: true });
exports.pHash = exports.hmac = void 0;
const crypto = __importStar(require("crypto"));
/**
 * Culculates HMAC using provided hash.
 * @param {string} algorithm - Hash algorithm.
 * @param {Buffer} secret - Hmac seed.
 * @param {Buffer} data - Input data.
 * @returns {Buffer}
 */
function hmac(algorithm, secret, data) {
    const hash = crypto.createHmac(algorithm, secret);
    hash.update(data);
    return hash.digest();
}
exports.hmac = hmac;
/**
 * A data expansion function for PRF.
 * @param {number} bytes - The number of bytes required by PRF.
 * @param {string} algorithm - Hmac hash algorithm.
 * @param {Buffer} secret - Hmac secret.
 * @param {Buffer} seed - Input data.
 * @returns {Buffer}
 */
function pHash(bytes, algorithm, secret, seed) {
    const totalLength = bytes;
    const bufs = [];
    let Ai = seed; // A0
    do {
        Ai = hmac(algorithm, secret, Ai); // A(i) = HMAC(secret, A(i-1))
        const output = hmac(algorithm, secret, Buffer.concat([Ai, seed]));
        bufs.push(output);
        bytes -= output.length; // eslint-disable-line no-param-reassign
    } while (bytes > 0);
    return Buffer.concat(bufs, totalLength);
}
exports.pHash = pHash;
//# sourceMappingURL=utils.js.map