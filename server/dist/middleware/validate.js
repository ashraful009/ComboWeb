"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateBody = void 0;
const zod_1 = require("zod");
const AppError_1 = require("../utils/AppError");
const validateBody = (schema) => {
    return (req, res, next) => {
        try {
            req.body = schema.parse(req.body);
            next();
        }
        catch (error) {
            if (error instanceof zod_1.ZodError || error.name === 'ZodError') {
                const fieldErrors = {};
                const zodErr = error;
                zodErr.errors.forEach((err) => {
                    if (err.path.length > 0) {
                        fieldErrors[err.path.join('.')] = err.message;
                    }
                });
                next(new AppError_1.AppError('VALIDATION_ERROR', 400, 'Invalid request data', fieldErrors));
            }
            else {
                next(error);
            }
        }
    };
};
exports.validateBody = validateBody;
