import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from '../utils/app-error.js';

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'fallback_access_secret';

/**
 * Мидлварь для проверки JWT.
 * По умолчанию ОСТАНАВЛИВАЕТ запрос, если токена нет или он протух (isStrict = true).
 * Если передать isStrict = false, то при отсутствии токена она просто пропустит запрос дальше как анонимный.
 */
export const validateAuth = (isStrict = true) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    // 1. Извлекаем заголовок Authorization
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      if (isStrict) {
        throw new AppError('Доступ запрещен. Токен отсутствует', 401);
      }
      // Если проверка мягкая — просто идем дальше без пользователя
      return next();
    }

    // 2. Достаем сам токен (убираем слово 'Bearer ')
    const token = authHeader.split(' ')[1];

    if (!token) {
      throw new AppError('Доступ запрещен. Токен отсутствует', 401);
    }

    try {
      // 3. Проверяем токен секретным ключом
      const decoded = jwt.verify(token, ACCESS_SECRET) as unknown as { userId: string; login: string };

      // 4. Записываем данные в req.user, чтобы они были доступны в контроллере
      req.user = {
        userId: decoded.userId,
        login: decoded.login
      };

      next();
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      if (isStrict) {
         res.status(401).send({ error: 'Невалидный или просроченный токен' });
         return;
      }
      // При мягкой проверке, даже если токен битый, мы не падаем с ошибкой, а идем дальше как аноним
      next();
    }
  };
};
