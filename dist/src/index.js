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
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const user_1 = __importDefault(require("./routes/user"));
const listings_1 = __importDefault(require("./routes/listings"));
const messages_1 = __importDefault(require("./routes/messages"));
const categories_1 = __importDefault(require("./routes/categories"));
const express_2 = require("@clerk/express");
const prisma_1 = __importDefault(require("./db/prisma"));
const ws_1 = require("ws");
const http_1 = __importDefault(require("http"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)({ origin: '*' }));
app.use(express_1.default.json());
app.use((0, express_2.clerkMiddleware)());
app.use('/api/categories', categories_1.default);
app.use('/api/users', user_1.default);
app.use('/api/get', messages_1.default);
app.use('/api/listings', listings_1.default);
app.get("/", (req, res) => {
    res.send("backend is running");
});
// Create HTTP server
const server = http_1.default.createServer(app);
// Setup WebSocket server on the same HTTP server
const wss = new ws_1.WebSocketServer({ server });
const clients = new Map();
wss.on("connection", (socket) => {
    let userId;
    console.log("WebSocket connected");
    socket.on("message", (message) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const data = JSON.parse(message.toString());
            if (data.type === "INIT") {
                userId = data.userId;
                clients.set(userId, socket);
                return;
            }
            if (data.type === "CHAT") {
                const { senderId, recieverId, content, listingId } = data;
                const savedMessage = yield prisma_1.default.chatMessage.create({
                    data: {
                        senderId,
                        recieverId,
                        content,
                        listingId
                    },
                    include: {
                        sender: { select: { id: true, name: true, image_url: true } },
                        reciever: { select: { id: true, name: true, image_url: true } },
                        listing: { select: { id: true, title: true, imagesUrl: true } },
                    }
                });
                const recieverSocket = clients.get(recieverId);
                if (recieverSocket && recieverSocket.readyState === ws_1.WebSocket.OPEN) {
                    recieverSocket.send(JSON.stringify({
                        type: "NEW_MESSAGE",
                        message: savedMessage
                    }));
                }
            }
        }
        catch (e) {
            console.log("WebSocket error:", e);
        }
    }));
    socket.on("close", () => {
        if (userId)
            clients.delete(userId);
    });
});
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server + WebSocket listening on port ${PORT}`);
});
