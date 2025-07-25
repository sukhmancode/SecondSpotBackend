import {WebSocketServer,WebSocket} from "ws";

import prisma from "../db/prisma";

const wss = new WebSocketServer({port:8080});
const clients = new Map<string,WebSocket>();
    
wss.on("connection",(socket) => {
    let userId:any;
    console.log("connected");
    

    socket.on("message",async (message) => {
        try {
            const data = JSON.parse(message.toString());
            if(data.type === "INIT") {
                userId = data.userId;
                clients.set(userId,socket);
                return;
            }

            if(data.type === "CHAT") {
                const {senderId,recieverId,content,listingId} = data;

                const savedMessage = await prisma.chatMessage.create({
                    data: {
                        senderId,recieverId,content,listingId
                    },include: {
                        sender: { select: { id: true, name: true, image_url: true } },
                        reciever: { select: { id: true, name: true, image_url: true } },
                        listing: { select: { id: true, title: true, imagesUrl: true } },
                    }
                });
                console.log("Creating message with listingId:", listingId);

                const recieverSocket = clients.get(recieverId);
                if(recieverSocket && recieverSocket.readyState === WebSocket.OPEN) {
                    recieverSocket.send(JSON.stringify({
                        type:"NEW_MESSAGE",
                        message:savedMessage
                    }))
                }
            }
        }   catch(e) {
            console.log(e);
        }
    
    });
    socket.on('close', () => {
        if (userId) clients.delete(userId);
      });
});
