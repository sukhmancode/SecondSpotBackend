import express, { Request, Response } from 'express';
import prisma from '../db/prisma';
const router = express.Router();

router.get("/chats",async(req:Request,res:Response) => {
    const {user1,user2} = req.query;
    if(!user1 || !user2) {
        return res.status(400).json({
            message:"user 1 and user 2 are required"
        })
    }
    try {
        const chats = await prisma.chatMessage.findMany({
            where: {
                OR: [
                    {senderId:user1 as string,recieverId:user2 as string},
                    {senderId:user2 as string,recieverId:user1 as string}
                ]
            },
            orderBy: {
                createdAt:'asc'
            }
            
        });
        res.json(chats);
    }
    catch(error) {
        console.log(error);
        return res.status(500).json({
            message:"internal server error"
        })   
    }
})

router.get("/chats/inbox",async(req:Request,res:Response) => {
    const userId = req.query.userId as string;
    if(!userId) {
        return res.status(400).json({ message: "User ID is required" });
    }

    try {
        const allMessages = await prisma.chatMessage.findMany({
            where: {
                OR: [
                    {senderId:userId},
                    {recieverId:userId}
                ]
            },
            orderBy: {
                createdAt:'desc'
            },
            include: {
                sender: {
                    select: {
                        id:true,
                        name:true,
                        image_url:true
                    }
                },
                reciever: {
                    select: {
                        id:true,
                        name:true,
                        image_url:true
                    }
                },
                listing: {
                    select: {
                        id:true,
                        title:true,
                        imagesUrl:true
                    }
                }
            }
        });
        const seenPairs = new Set();
        const inboxConversations :typeof allMessages = [];

        for(const msg of allMessages) {
            const userA = msg.senderId;
            const userB = msg.recieverId;
            const pairKey = [userA,userB,msg.listingId].sort().join("-");

            if(!seenPairs.has(pairKey)) {
                inboxConversations.push(msg);
                seenPairs.add(pairKey);
            }
        }
        res.json(inboxConversations)
    }
    catch(error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
})
export default router;