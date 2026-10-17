"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const morgan_1 = __importDefault(require("morgan"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const env_1 = require("./config/env");
const errorHandler_1 = require("./middleware/errorHandler");
const public_1 = __importDefault(require("./routes/public"));
const admin_1 = __importDefault(require("./routes/admin"));
const app = (0, express_1.default)();
// Trust reverse proxy (LiteSpeed / Passenger / CloudLinux) so express-rate-limit and req.ip work
app.set('trust proxy', 1);
app.use((0, helmet_1.default)({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));
const isAllowedOrigin = (origin) => {
    if (!origin)
        return true;
    if (env_1.env.NODE_ENV === 'development')
        return true;
    if (origin === env_1.env.CLIENT_ORIGIN)
        return true;
    try {
        const url = new URL(origin);
        if (url.hostname === 'freshagro.farm' ||
            url.hostname.endsWith('.freshagro.farm') ||
            url.hostname === 'localhost' ||
            url.hostname === '127.0.0.1') {
            return true;
        }
    }
    catch {
        // fallback
    }
    return false;
};
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        if (isAllowedOrigin(origin)) {
            callback(null, true);
        }
        else {
            callback(null, false);
        }
    },
    credentials: true,
}));
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.use((0, morgan_1.default)('dev'));
const uploadsDir = path_1.default.resolve(__dirname, '../../uploads');
if (!fs_1.default.existsSync(uploadsDir)) {
    fs_1.default.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express_1.default.static(uploadsDir));
app.use('/api', public_1.default);
app.use('/api/admin', admin_1.default);
// Serve frontend build in production
const possibleClientPaths = [
    path_1.default.resolve(__dirname, '../../public'),
    path_1.default.resolve(__dirname, '../../client/dist'),
    path_1.default.resolve(__dirname, '../public'),
    path_1.default.resolve(process.cwd(), 'public'),
];
const clientDist = possibleClientPaths.find(p => fs_1.default.existsSync(path_1.default.join(p, 'index.html')));
if (clientDist) {
    app.use(express_1.default.static(clientDist));
    app.get('*', (req, res, next) => {
        if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
            return next();
        }
        res.sendFile(path_1.default.join(clientDist, 'index.html'));
    });
}
app.use(errorHandler_1.errorHandler);
exports.default = app;
