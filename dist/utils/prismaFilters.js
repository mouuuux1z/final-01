"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.textContains = textContains;
const isSqlite = process.env.DATABASE_URL?.startsWith('file:');
function textContains(value) {
    if (isSqlite) {
        return { contains: value };
    }
    return { contains: value, mode: 'insensitive' };
}
//# sourceMappingURL=prismaFilters.js.map