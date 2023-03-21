"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.int = exports.uint32Gte = exports.uint32Gt = exports.uint16Gte = exports.uint16Gt = exports.uint24 = exports.uint32Add = exports.uint16Add = exports.uint8Add = void 0;
function uint8Add(a, b) {
    return (a + b) & 0xff;
}
exports.uint8Add = uint8Add;
function uint16Add(a, b) {
    return (a + b) & 0xffff;
}
exports.uint16Add = uint16Add;
function uint32Add(a, b) {
    return Number((BigInt(a) + BigInt(b)) & 0xffffffffn);
}
exports.uint32Add = uint32Add;
function uint24(v) {
    return v & 0xffffff;
}
exports.uint24 = uint24;
/**Return a > b */
function uint16Gt(a, b) {
    const halfMod = 0x8000;
    return (a < b && b - a > halfMod) || (a > b && a - b < halfMod);
}
exports.uint16Gt = uint16Gt;
/**Return a >= b */
function uint16Gte(a, b) {
    return a === b || uint16Gt(a, b);
}
exports.uint16Gte = uint16Gte;
/**Return a > b */
function uint32Gt(a, b) {
    const halfMod = 0x80000000;
    return (a < b && b - a > halfMod) || (a > b && a - b < halfMod);
}
exports.uint32Gt = uint32Gt;
/**Return a >= b */
function uint32Gte(a, b) {
    return a === b || uint32Gt(a, b);
}
exports.uint32Gte = uint32Gte;
const int = (n) => parseInt(n, 10);
exports.int = int;
//# sourceMappingURL=number.js.map