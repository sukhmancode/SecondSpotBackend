import express, { Request, Response } from 'express';
import { getAuth } from '@clerk/express';
import prisma from '../db/prisma';

const router = express.Router();

router.post('/new', async (req: Request, res: Response) => {
  const { userId } = getAuth(req);
  console.log("called with userId:", userId);

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { title, description, price, imagesUrl, categoryId, carDetail,location} = req.body;

  try {
    const listing = await prisma.listing.create({
      data: {
        title,
        description,
        price: parseFloat(price),
        imagesUrl,
   
        user: {
          connect: { clerkId: userId },
        },
        category: {
          connect: { id: categoryId },
        },
        latitude: location?.latitude ? parseFloat(location.latitude) : null,
        longitude: location?.longitude ? parseFloat(location.longitude) : null,
        city: location?.city || null,
        state: location?.state || null,
        country: location?.country || null,
        ...(carDetail && {
          carDetail: {
            create: {
              year: carDetail.year,
              fuel: carDetail.fuel,
              transmission: carDetail.transmission,
            },
          },
        }),
      },
      include: { carDetail: true },
    });

    res.status(201).json(listing);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong.' });
  }
});
router.get('/get', async(_req, res) => {
    const response = await prisma.listing.findMany({
        include: {
          category:true,
          user:true,
        }
    }) 
    res.json(response)
    
  });

  router.delete('/delete/:id',async(req:Request,res:Response) => {
    const listingId = req.params.id;
    try {
       await prisma.listing.delete({
        where:{
          id:listingId
        }
      })
      res.status(200).json({
        msg:"listing deleted successfully!"
      })
    }
    catch(err) {
      return res.status(500).json({
        message:"not deleted"
      })
    }
  })

export default router;
