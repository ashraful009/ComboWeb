"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppError = void 0;
class AppError extends Error {
    code;
    httpStatus;
    message;
    fieldErrors;
    constructor(code, httpStatus, message, fieldErrors) {
        super(message);
        this.code = code;
        this.httpStatus = httpStatus;
        this.message = message;
        this.fieldErrors = fieldErrors;
        Object.setPrototypeOf(this, new.target.prototype);
        Error.captureStackTrace(this);
    }
}
exports.AppError = AppError;
