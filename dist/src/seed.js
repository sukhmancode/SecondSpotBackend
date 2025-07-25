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
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const categories = [
            { name: 'Cars', icon: '🚗' },
            { name: 'Mobiles', icon: '📱' },
            { name: 'Properties', icon: '🏠' },
            { name: 'Furniture', icon: '🪑' },
            { name: 'Fashion', icon: '👗' },
            { name: 'Bikes', icon: '🏍️' },
            { name: 'Electronics', icon: '📺' },
            { name: 'Books, Sports & Hobbies', icon: '📚' },
            { name: 'Commercial Vehicles & Spares', icon: '🚚' },
            { name: 'Jobs', icon: '💼' },
        ];
        for (const cat of categories) {
            yield prisma.category.upsert({
                where: { name: cat.name },
                update: {},
                create: cat,
            });
        }
        console.log('✅ Categories seeded');
    });
}
main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
