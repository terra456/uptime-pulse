import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { AppError } from '../utils/app-error.js';
import { prisma } from '../lib/prisma.js';
import { validate } from 'uuid';

const router = express.Router();

// Количество раундов хеширования для bcrypt (10 — оптимальный баланс скорости и защиты)
const SALT_ROUNDS = 10;

// Секреты из .env (с фоллбэком на случай, если забыли указать)
const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'fallback_access_secret';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'fallback_refresh_secret';

router.post('/register', async (req, res) => {
  try {
    const { login, password } = req.body;

    // 1. Валидация входных данных
    if (!login || !password) {
      throw new AppError('Логин и пароль обязательны для заполнения', 400);
    }

    if (password.length < 6) {
      throw new AppError('Пароль должен быть не менее 6 символов', 400);
    }

    // 2. Проверяем, нет ли уже пользователя с таким логином
    const existingUser = await prisma.user.findUnique({
      where: { login },
    });

    if (existingUser) {
      throw new AppError('Пользователь с таким логином уже существует', 409);
    }

    // 3. Хешируем пароль
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // 4. Создаем пользователя в базе данных
    const newUser = await prisma.user.create({
      data: {
        login,
        password: hashedPassword,
      },
      // Выбираем, какие поля вернуть (пароль возвращать клиенту нельзя!)
      select: {
        id: true,
        login: true,
      }
    });

    // 5. Возвращаем успешный ответ
    res.status(201).send(newUser);
    
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new Error('Внутренняя ошибка сервера');
  }
});

router.post('/login', async (req, res) => {
  try {
    const { login, password } = req.body;

    // 1. Валидация входных данных
    if (!login || !password) {
      throw new AppError('Логин и пароль обязательны', 400);
    }

    // 2. Ищем пользователя в базе данных
    const user = await prisma.user.findUnique({
      where: { login },
    });

    if (!user) {
      // Специально даем размытый ответ "Неверный логин или пароль", 
      // чтобы злоумышленник не мог перебирать существующие логины
      throw new AppError('Неверный логин или пароль', 401);
    }

    // 3. Проверяем правильность пароля через bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new AppError('Неверный логин или пароль', 401);
    }

    // 4. Генерируем Access-токен (живет 15 минут)
    // В полезную нагрузку (payload) зашиваем id и login пользователя
    const accessToken = jwt.sign(
      { userId: user.id, login: user.login },
      ACCESS_SECRET,
      { expiresIn: '15m' }
    );

    // 5. Генерируем Refresh-токен (живет 30 дней)
    const refreshToken = jwt.sign(
      { userId: user.id },
      REFRESH_SECRET,
      { expiresIn: '30d' }
    );

    // 6. Вычисляем дату истечения Refresh-токена для сохранения в БД
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // Текущая дата + 30 дней

    // 7. Сохраняем Refresh-токен в таблицу RefreshToken через Prisma
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        expiresAt: expiresAt,
        userId: user.id,
      },
    });

    // 8. Отправляем успешный ответ с токенами
    res.status(200).send({
      message: 'Успешный вход',
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        login: user.login,
      },
    });

  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new Error('Внутренняя ошибка сервера');
  }
});

router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    // 1. Проверяем, пришел ли токен в теле запроса
    if (!refreshToken) {
      throw new AppError('Refresh-токен обязателен', 400);
    }

    // 2. Валидируем токен через jsonwebtoken (проверяем подпись и срок годности)
    let payload: any;
    try {
      payload = jwt.verify(refreshToken, REFRESH_SECRET);
    } catch (jwtError) {
      throw new AppError('Невалидный или просроченный Refresh-токен', 401);
    }

    // 3. Ищем этот токен в базе данных Postgres
    const savedToken = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true }, // Сразу подтягиваем данные пользователя
    });

    // Если токена нет в базе (например, пользователь уже нажал /logout)
    // или если он просрочен по дате в БД
    if (!savedToken || savedToken.expiresAt < new Date()) {
      // Если токен просрочен в БД, подчищаем его, чтобы не копился мусор
      if (savedToken) {
        await prisma.refreshToken.delete({ where: { id: savedToken.id } });
      }
      throw new AppError('Сессия устарела, авторизуйтесь заново', 401);
    }

    // 4. Генерируем НОВУЮ пару токенов (Реализуем Refresh Token Rotation для безопасности)
    const newAccessToken = jwt.sign(
      { userId: savedToken.user.id, login: savedToken.user.login },
      ACCESS_SECRET,
      { expiresIn: '15m' }
    );

    const newRefreshToken = jwt.sign(
      { userId: savedToken.user.id },
      REFRESH_SECRET,
      { expiresIn: '30d' }
    );

    // 5. Обновляем Refresh-токен в базе данных
    // Вместо удаления и создания старой записи, мы просто заменяем сам токен и продлеваем ему жизнь
    const nextExpiresAt = new Date();
    nextExpiresAt.setDate(nextExpiresAt.getDate() + 30);

    await prisma.refreshToken.update({
      where: { id: savedToken.id },
      data: {
        token: newRefreshToken,
        expiresAt: nextExpiresAt,
      },
    });

    // 6. Отправляем новые токены на фронтенд
    res.status(200).send({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });

  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new Error('Внутренняя ошибка сервера');
  }
});

// TODO поправить ошибки
router.post('/logout', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      // Просто удаляем запись о сессии из таблицы RefreshToken
      await prisma.refreshToken.deleteMany({
        where: { token: refreshToken },
      });
    }

    res.status(200).send({ message: 'Успешный выход из системы' });
  } catch (error) {
    console.error('Ошибка при логауте:', error);
    // Даже если в БД произошла ошибка (например, токена уже нет), 
    // для клиента возвращаем 200, так как фронтенд всё равно сотрет стейт
    res.status(200).send({ message: 'Успешный выход из системы' });
  }
});

export default router;
