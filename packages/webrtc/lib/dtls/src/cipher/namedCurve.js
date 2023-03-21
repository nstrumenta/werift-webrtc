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
exports.generateKeyPair = void 0;
const elliptic_1 = require("elliptic");
const nacl = __importStar(require("tweetnacl"));
const const_1 = require("./const");
function generateKeyPair(namedCurve) {
    switch (namedCurve) {
        case const_1.NamedCurveAlgorithm.secp256r1_23: {
            const elliptic = new elliptic_1.ec("p256");
            const key = elliptic.genKeyPair();
            const privateKey = key.getPrivate().toBuffer("be");
            const publicKey = Buffer.from(key.getPublic().encode("array", false));
            return {
                curve: namedCurve,
                privateKey,
                publicKey,
            };
        }
        case const_1.NamedCurveAlgorithm.x25519_29: {
            const keys = nacl.box.keyPair();
            return {
                curve: namedCurve,
                privateKey: Buffer.from(keys.secretKey.buffer),
                publicKey: Buffer.from(keys.publicKey.buffer),
            };
        }
        default:
            throw new Error();
    }
}
exports.generateKeyPair = generateKeyPair;
//# sourceMappingURL=namedCurve.js.map