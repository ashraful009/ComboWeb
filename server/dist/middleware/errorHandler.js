"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const AppError_1 = require("../utils/AppError");
const errorHandler = (err, req, res, _next) => {
    console.error('[Error]:', err);
    if (err instanceof AppError_1.AppError) {
        return res.status(err.httpStatus).json({
            success: false,
            error: {
                code: err.code,
                message: err.message,
                fieldErrors: err.fieldErrors,
            },
        });
    }
    return res.status(500).json({
        success: false,
        error: {
            code: 'INTERNAL_SERVER_ERROR',
            message: 'An unexpected error occurred.',
        },
    });
};
exports.errorHandler = errorHandler;
