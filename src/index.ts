import express from 'express';
import dotenv from "dotenv";
import cors from 'cors'
import userRoutes from './routes/user';
import listingRouter from './routes/listings'
import getChatsRouter from './routes/messages'
import { clerkMiddleware} from '@clerk/express';
dotenv.config();
import categoryRoutes from './routes/categories';
const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json())
app.use(clerkMiddleware());
app.use('/api/categories', categoryRoutes);

app.use('/api/users', userRoutes);
app.use('/api/get',getChatsRouter)
app.use('/api/listings',listingRouter);
app.listen(3000, () => {
    console.log("app is listening on port 3000");
    
})