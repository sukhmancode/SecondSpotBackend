"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = void 0;
const express_1 = require("@clerk/express");
const requireAuth = (req, res, next) => {
    const { userId } = (0, express_1.getAuth)(req);
    if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    //@ts-ignore
    req.userId = userId;
    next();
};
exports.requireAuth = requireAuth;
