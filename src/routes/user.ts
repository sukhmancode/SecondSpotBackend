// routes/user.ts or controllers/sync.ts
import { clerkClient } from '@clerk/clerk-sdk-node'
import express, { Request, Response } from 'express'
import prisma from '../db/prisma'
const router = express.Router()
import { getAuth } from '@clerk/express';

router.get("/me",async(req:Request,res:Response) => {
    console.log("GET /me called");
        try {
            const  {userId} = getAuth(req);
        if(!userId) {
            return res.status(401).json({
                message:"Unauthenticated"
            })
        }
        const dbUser = await prisma.user.findUnique({
            where: {
                clerkId:userId
            }
        });
        console.log(dbUser);
        return res.json({
            dbUser
        })
        
    }
    catch(error) {
        console.error('Error fetching user:', error);
        return res.status(500).json({ message: 'Failed to fetch user data' });

    }
})

router.post('/sync', async (req, res) => {
  try {
    const allClerkUsers = await clerkClient.users.getUserList()
    

    for (const user of allClerkUsers) {
      await prisma.user.upsert({
        where: { clerkId: user.id },
        update: {
          name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
          email: user.emailAddresses[0]?.emailAddress || null,
          image_url:user.imageUrl|| null,
        },
        create: {
          clerkId: user.id,
          name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
          email: user.emailAddresses[0]?.emailAddress || null,
          image_url: user.imageUrl || null,
        },
      })
    }

    return res.json({ message: 'Users synced successfully.' })
  } catch (err) {
    console.error('Sync error:', err)
    return res.status(500).json({ message: 'Failed to sync users' })
  }
})


export default router
