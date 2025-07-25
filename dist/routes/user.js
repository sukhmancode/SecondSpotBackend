"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// routes/user.ts or controllers/sync.ts
const clerk_sdk_node_1 = require("@clerk/clerk-sdk-node");
const express_1 = __importDefault(require("express"));
const prisma_1 = __importDefault(require("../db/prisma"));
const router = express_1.default.Router();
const express_2 = require("@clerk/express");
router.get("/me", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("GET /me called");
    try {
        const { userId } = (0, express_2.getAuth)(req);
        console.log(userId);
        if (!userId) {
            return res.status(401).json({
                message: "Unauthenticated"
            });
        }
        const dbUser = yield prisma_1.default.user.findUnique({
            where: {
                clerkId: userId
            }
        });
        console.log(dbUser);
        return res.json({
            dbUser
        });
    }
    catch (error) {
        console.error('Error fetching user:', error);
        return res.status(500).json({ message: 'Failed to fetch user data' });
    }
}));
router.post('/sync', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const allClerkUsers = yield clerk_sdk_node_1.clerkClient.users.getUserList();
        console.log(allClerkUsers);
        for (const user of allClerkUsers) {
            yield prisma_1.default.user.upsert({
                where: { clerkId: user.id },
                update: {
                    name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
                    email: ((_a = user.emailAddresses[0]) === null || _a === void 0 ? void 0 : _a.emailAddress) || null,
                    image_url: user.imageUrl || null,
                },
                create: {
                    clerkId: user.id,
                    name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
                    email: ((_b = user.emailAddresses[0]) === null || _b === void 0 ? void 0 : _b.emailAddress) || null,
                    image_url: user.imageUrl || null,
                },
            });
        }
        return res.json({ message: 'Users synced successfully.' });
    }
    catch (err) {
        console.error('Sync error:', err);
        return res.status(500).json({ message: 'Failed to sync users' });
    }
}));
exports.default = router;
