import express from 'express';
import dotenv from "dotenv";
import cors from 'cors';
import userRoutes from './routes/user';
import listingRouter from './routes/listings';
import getChatsRouter from './routes/messages';
import categoryRoutes from './routes/categories';
import { clerkMiddleware } from '@clerk/express';
import prisma from './db/prisma';

import { WebSocketServer, WebSocket } from 'ws';
import http from 'http';

dotenv.config();

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(clerkMiddleware());

app.use('/api/categories', categoryRoutes);
app.use('/api/users', userRoutes);
app.use('/api/get', getChatsRouter);
app.use('/api/listings', listingRouter);

// Create HTTP server
const server = http.createServer(app);

// Setup WebSocket server on the same HTTP server
const wss = new WebSocketServer({ server });

const clients = new Map<string, WebSocket>();

wss.on("connection", (socket) => {
    let userId: string;
    console.log("WebSocket connected");

    socket.on("message", async (message) => {
        try {
            const data = JSON.parse(message.toString());
            if (data.type === "INIT") {
                userId = data.userId;
                clients.set(userId, socket);
                return;
            }

            if (data.type === "CHAT") {
                const { senderId, recieverId, content, listingId } = data;

                const savedMessage = await prisma.chatMessage.create({
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
                if (recieverSocket && recieverSocket.readyState === WebSocket.OPEN) {
                    recieverSocket.send(JSON.stringify({
                        type: "NEW_MESSAGE",
                        message: savedMessage
                    }));
                }
            }
        } catch (e) {
            console.log("WebSocket error:", e);
        }
    });

    socket.on("close", () => {
        if (userId) clients.delete(userId);
    });
});


const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server + WebSocket listening on port ${PORT}`);
});
