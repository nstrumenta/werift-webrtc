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
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Connection = exports.Candidate = void 0;
var candidate_1 = require("./candidate");
Object.defineProperty(exports, "Candidate", { enumerable: true, get: function () { return candidate_1.Candidate; } });
var ice_1 = require("./ice");
Object.defineProperty(exports, "Connection", { enumerable: true, get: function () { return ice_1.Connection; } });
__exportStar(require("./utils"), exports);
//# sourceMappingURL=index.js.map