import type { NextFunction, Request, RequestHandler, Response } from 'express';

type AsyncController = (req: Request, res: Response, next: NextFunction) => Promise<void>;

/** Forwards any rejected promise to the global error handler. */
export const catchAsync =
  (controller: AsyncController): RequestHandler =>
  (req, res, next): void => {
    controller(req, res, next).catch(next);
  };
