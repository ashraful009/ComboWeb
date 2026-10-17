"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminAuth = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
const AppError_1 = require("../utils/AppError");
const adminAuth = (req, res, next) => {
    const token = req.cookies.admin_token;
    if (!token) {
        return next(new AppError_1.AppError('UNAUTHORIZED', 401, 'Authentication required'));
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, env_1.env.JWT_SECRET);
        if (decoded.username !== env_1.env.ADMIN_USERNAME) {
            return next(new AppError_1.AppError('UNAUTHORIZED', 401, 'Invalid token'));
        }
        next();
    }
    catch (error) {
        return next(new AppError_1.AppError('UNAUTHORIZED', 401, 'Invalid or expired token'));
    }
};
exports.adminAuth = adminAuth;
