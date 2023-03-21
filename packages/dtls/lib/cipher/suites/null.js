"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const key_exchange_1 = require("../key-exchange");
const abstract_1 = __importDefault(require("./abstract"));
/**
 * Default passthrough cipher.
 */
class NullCipher extends abstract_1.default {
    /**
     * @class NullCipher
     */
    constructor() {
        super();
        this.name = "NULL_NULL_NULL"; // key, mac, hash
        this.blockAlgorithm = "NULL";
        this.kx = (0, key_exchange_1.createNULLKeyExchange)();
        this.hashAlgorithm = "NULL";
    }
    /**
     * Encrypts data.
     * @param {AbstractSession} session
     * @param {Buffer} data Content to encryption.
     * @returns {Buffer}
     */
    encrypt(session, data) {
        return data;
    }
    /**
     * Decrypts data.
     * @param {AbstractSession} session
     * @param {Buffer} data Content to encryption.
     * @returns {Buffer}
     */
    decrypt(session, data) {
        return data;
    }
}
exports.default = NullCipher;
//# sourceMappingURL=null.js.map