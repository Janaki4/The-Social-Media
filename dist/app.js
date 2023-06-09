"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const cors_1 = __importDefault(require("cors"));
const Responses_1 = require("./helpers/Responses");
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.options('*', (0, cors_1.default)());
app.use((0, cors_1.default)({
    origin: "http://localhost:3001",
    credentials: true
}));
app.set('trust proxy', 1);
const publicRouter_1 = __importDefault(require("./routes/publicRouter"));
const dbURL = "mongodb://127.0.0.1:27017/typescript-prac";
mongoose_1.default
    .connect(dbURL)
    .then(() => console.log("db connected"))
    .catch((err) => console.log("not connected" + err));
app.use("/public", publicRouter_1.default);
app.use((err, req, res, next) => {
    return res.status(500).send((0, Responses_1.errorResponse)(err));
});
app.listen(3000);
