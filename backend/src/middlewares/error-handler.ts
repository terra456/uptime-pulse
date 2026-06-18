import { type ErrorRequestHandler } from 'express';
import { AppError } from '../utils/app-error.js';

export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  // 1. Handle trusted, operational errors (e.g., validation failures, 404s)
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      status: 'fail',
      message: err.message,
    });
    return;
  }

  // 2. Handle unknown or programming errors (e.g., DB crash, logic bugs)
  console.error('ERROR 💥:', err); // Log details securely for debugging

  res.status(500).json({
    status: 'error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong!',
  });
};