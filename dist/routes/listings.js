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
router.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("called");
    const { title, description, price, imageUrl, categoryId, carDetail } = req.body;
    //@ts-ignore
    const userId = req.userId;
    if (!userId) {
        console.log("unauthorized");
    }
    else {
        console.log("authorized");
    }
    try {
        const listing = yield prisma_1.default.listing.create({
            data: Object.assign({ title, description, price: parseFloat(price), imageUrl, user: {
                    connect: { clerkId: userId }
                }, category: {
                    connect: { id: categoryId }
                } }, (carDetail && {
                carDetail: {
                    create: {
                        year: carDetail.year,
                        fuel: carDetail.fuel,
                        transmission: carDetail.transmission
                    }
                }
            })),
            include: { carDetail: true }
        });
        res.status(201).json(listing);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Something went wrong.' });
    }
}));
exports.default = router;
