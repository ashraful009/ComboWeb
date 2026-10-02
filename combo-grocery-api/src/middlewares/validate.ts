import type { Request, RequestHandler } from 'express';
import { z, type ZodType } from 'zod';
import type { FieldError, ValidatedData } from '../types/common.types';
import { AppError } from '../utils/appError';

/** One schema object per route: any of body / query / params. */
export interface RequestSchema {
  body?: ZodType;
  query?: ZodType;
  params?: ZodType;
}

/** The parsed (coerced + defaulted) output types of a RequestSchema. */
export type ValidatedOf<S extends RequestSchema> = {
  body: S['body'] extends ZodType ? z.infer<S['body']> : any;
  query: S['query'] extends ZodType ? z.infer<S['query']> : any;
  params: S['params'] extends ZodType ? z.infer<S['params']> : any;
};

type Part = keyof RequestSchema;
const PARTS: readonly Part[] = ['body', 'query', 'params'];

/** Route-level validation. Rejects with 422 + field errors, or stores req.validated. */
export const validate =
  (schema: RequestSchema): RequestHandler =>
  (req, _res, next): void => {
    const data: ValidatedData = {};
    const errors: FieldError[] = [];

    for (const part of PARTS) {
      const partSchema = schema[part];
      if (!partSchema) continue;

      const result = partSchema.safeParse(req[part]);
      if (result.success) {
        data[part] = result.data;
      } else {
        for (const issue of result.error.issues) {
          errors.push({
            field: [part, ...issue.path.map(String)].join('.'),
            message: issue.message,
          });
        }
      }
    }

    if (errors.length > 0) {
      next(AppError.unprocessable('Validation failed', 'VALIDATION_ERROR', errors));
      return;
    }

    req.validated = data;
    next();
  };

/** Typed accessor used by controllers: types come from the SAME schema as the route. */
export const validatedOf = <S extends RequestSchema>(
  req: Request,
  _schema: S,
): ValidatedOf<S> => {
  if (!req.validated) {
    throw new AppError(
      'validate() middleware missing on this route',
      500,
      'VALIDATION_NOT_APPLIED',
    );
  }
  return req.validated as ValidatedOf<S>;
};
