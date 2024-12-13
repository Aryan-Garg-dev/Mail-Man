import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import { MulterError } from "multer"

const errorHandler = (err: AppError, req: Request, res: Response, next: NextFunction): void => {
  console.log(err.code, err.status, err.message)
  console.error(err.stack);
  const statusCode = err.status || 500;
  if (err instanceof MulterError && err.code === 'LIMIT_FILE_SIZE') {
    res.status(400).json({ error: 'File is too large. Maximum size is 10MB.' });
    return;
  }
  res.status(statusCode).json({
    success: false,
    message: err.message || 'An unexpected error occurred',
  });
};

export default errorHandler;