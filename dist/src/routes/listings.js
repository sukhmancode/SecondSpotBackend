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
const express_2 = require("@clerk/express");
const prisma_1 = __importDefault(require("../db/prisma"));
const router = express_1.default.Router();
router.post('/new', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = (0, express_2.getAuth)(req);
    console.log("called with userId:", userId);
    if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    const { title, description, price, imagesUrl, categoryId, carDetail, location } = req.body;
    try {
        const listing = yield prisma_1.default.listing.create({
            data: Object.assign({ title,
                description, price: parseFloat(price), imagesUrl, user: {
                    connect: { clerkId: userId },
                }, category: {
                    connect: { id: categoryId },
                }, latitude: (location === null || location === void 0 ? void 0 : location.latitude) ? parseFloat(location.latitude) : null, longitude: (location === null || location === void 0 ? void 0 : location.longitude) ? parseFloat(location.longitude) : null, city: (location === null || location === void 0 ? void 0 : location.city) || null, state: (location === null || location === void 0 ? void 0 : location.state) || null, country: (location === null || location === void 0 ? void 0 : location.country) || null }, (carDetail && {
                carDetail: {
                    create: {
                        year: carDetail.year,
                        fuel: carDetail.fuel,
                        transmission: carDetail.transmission,
                    },
                },
            })),
            include: { carDetail: true },
        });
        res.status(201).json(listing);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Something went wrong.' });
    }
}));
router.get('/get', (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield prisma_1.default.listing.findMany({
        include: {
            category: true,
            user: true,
        }
    });
    res.json(response);
}));
router.delete('/delete/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const listingId = req.params.id;
    try {
        yield prisma_1.default.listing.delete({
            where: {
                id: listingId
            }
        });
        res.status(200).json({
            msg: "listing deleted successfully!"
        });
    }
    catch (err) {
        return res.status(500).json({
            message: "not deleted", err
        });
    }
}));
exports.default = router;
