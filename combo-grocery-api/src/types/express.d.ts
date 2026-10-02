import 'express';
import type { ValidatedData } from './common.types';
import type { AuthUser } from './auth.types';

declare module 'express-serve-static-core' {
  interface Request {
    user?: AuthUser;
    validated?: ValidatedData;
  }
}
