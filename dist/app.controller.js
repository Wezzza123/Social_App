"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = require("dotenv");
const path_1 = require("path");
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = require("express-rate-limit");
const auth_controller_js_1 = __importDefault(require("./modules/auth/auth.controller.js"));
const error_response_js_1 = require("./utils/response/error.response.js");
const db_connection_js_1 = require("./DB/db.connection.js");
(0, dotenv_1.config)({ path: (0, path_1.resolve)("./config/.env.development") });
const limiter = (0, express_rate_limit_1.rateLimit)({
    windowMs: 60 * 60 * 1000,
    max: 2000,
    message: "Too many requests please try again later",
    statusCode: 429,
});
const bootstrap = async () => {
    const app = (0, express_1.default)();
    const port = process.env.PORT || 5000;
    app.use((0, cors_1.default)());
    app.use((0, helmet_1.default)());
    app.use(express_1.default.json());
    app.use(limiter);
    app.get("/", (req, res) => {
        res.json({ message: `Welcome to ${process.env.APPLICATION_NAME} backend` });
    });
    app.use("/auth", auth_controller_js_1.default);
    app.use("{/*dummy}", (req, res, next) => {
        next(new error_response_js_1.BadRequestException("In-valid app routing"));
    });
    app.use(error_response_js_1.globalErrorHandling);
    await (0, db_connection_js_1.connectDB)();
    app.listen(port, () => {
        console.log(`🚀 Server is running on PORT ::: ${port}`);
    });
};
exports.default = bootstrap;
