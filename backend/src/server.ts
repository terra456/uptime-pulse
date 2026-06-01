import express, { type Request, type Response } from "express";

const app = express();
const PORT = 3000;

// Middleware для обработки JSON
app.use(express.json());

// Базовый маршрут (роут)
app.get("/", (_req: Request, res: Response) => {
  res.json({ message: "Сервер запущен и работает!" });
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Server is start on http://localhost:${PORT}`);
});
