export class AppError extends Error {
  constructor(
    public code: string,
    public httpStatus: number,
    public message: string,
    public fieldErrors?: Record<string, string>
  ) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this);
  }
}
