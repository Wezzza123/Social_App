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
(0, dotenv_1.config)({ path: (0, path_1.resolve)("./config/.env.development") });
const limiter = (0, express_rate_limit_1.rateLimit)({
    windowMs: 60 * 60000,
    max: 2000,
    message: "Too many requests please try again later",
    statusCode: 429
});
const bootstrap = () => {
    const app = (0, express_1.default)();
    const port = process.env.PORT || 5000;
    app.use((0, cors_1.default)(), express_1.default.json(), (0, helmet_1.default)(), limiter);
    app.get("/", (req, res) => {
        res.json({ message: `Welcome to ${process.env.APPLICATION_NAME} backend` });
    });
    app.use("/auth", auth_controller_js_1.default);
    app.use("{*/dummy}", (req, res, next) => {
        res.json({ message: "In-valid app routing" });
    });
    app.use((error, req, res, next) => {
        return res.status(500).json({
            err_message: error.message || "Something went wrong!!",
            stack: process.env.MODE === "development" ? error.stack : undefined,
            error
        });
    });
    app.listen(port, () => {
        console.log(`Server is running ON PORT :::${port}`);
    });
};
exports.default = bootstrap;
