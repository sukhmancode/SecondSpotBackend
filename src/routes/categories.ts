// src/routes/categories.ts
import express from 'express';
import prisma from '../db/prisma';

const router = express.Router();

router.get('/', async (_req, res) => {
  try {
    const categories = await prisma.category.findMany();
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

export default router;
