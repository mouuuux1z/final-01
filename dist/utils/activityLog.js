"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logActivity = logActivity;
const database_js_1 = require("../config/database.js");
async function logActivity(action, adminName, details) {
    await database_js_1.prisma.activityLog.create({
        data: { action, adminName, details },
    });
}
//# sourceMappingURL=activityLog.js.map