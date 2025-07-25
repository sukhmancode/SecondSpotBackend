"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const user_1 = __importDefault(require("./routes/user"));
const listings_1 = __importDefault(require("./routes/listings"));
const express_2 = require("@clerk/express");
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)({ origin: '*' }));
app.use(express_1.default.json());
app.use((0, express_2.clerkMiddleware)());
app.use('/api/users', user_1.default);
app.use('/api/listings', listings_1.default);
app.listen(3000, () => {
    console.log("app is listening on port 3000");
});
