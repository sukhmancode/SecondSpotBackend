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
const express_1 = __importDefault(require("express"));
const prisma_1 = __importDefault(require("../db/prisma"));
const router = express_1.default.Router();
router.get("/chats", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { user1, user2 } = req.query;
    if (!user1 || !user2) {
        return res.status(400).json({
            message: "user 1 and user 2 are required"
        });
    }
    try {
        const chats = yield prisma_1.default.chatMessage.findMany({
            where: {
                OR: [
                    { senderId: user1, recieverId: user2 },
                    { senderId: user2, recieverId: user1 }
                ]
            },
            orderBy: {
                createdAt: 'asc'
            }
        });
        res.json(chats);
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "internal server error"
        });
    }
}));
router.get("/chats/inbox", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.query.userId;
    if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
    }
    try {
        const allMessages = yield prisma_1.default.chatMessage.findMany({
            where: {
                OR: [
                    { senderId: userId },
                    { recieverId: userId }
                ]
            },
            orderBy: {
                createdAt: 'desc'
            },
            include: {
                sender: {
                    select: {
                        id: true,
                        name: true,
                        image_url: true
                    }
                },
                reciever: {
                    select: {
                        id: true,
                        name: true,
                        image_url: true
                    }
                },
                listing: {
                    select: {
                        id: true,
                        title: true,
                        imagesUrl: true
                    }
                }
            }
        });
        const seenPairs = new Set();
        const inboxConversations = [];
        for (const msg of allMessages) {
            const userA = msg.senderId;
            const userB = msg.recieverId;
            const pairKey = [userA, userB, msg.listingId].sort().join("-");
            if (!seenPairs.has(pairKey)) {
                inboxConversations.push(msg);
                seenPairs.add(pairKey);
            }
        }
        res.json(inboxConversations);
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
}));
exports.default = router;
