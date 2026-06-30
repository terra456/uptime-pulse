import { JwtPayload } from 'jsonwebtoken';

// Расширяем встроенный интерфейс Request в Express
declare global {
  namespace Express {
    interface Request {
      // Сюда мы запишем данные из токена, если он валиден
      user?: {
        userId: string;
        login: string;
      };
    }
  }
}
