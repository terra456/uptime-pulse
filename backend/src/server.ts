import express, { type NextFunction, type Request, type Response } from "express";
import cors from "cors";
import services from "./api/services.js";
import auth from "./api/auth.js";
import { errorHandler } from "./middlewares/error-handler.js";
import { AppError } from "./utils/app-error.js";
import { initScaner } from "./lib/scaner.js";

const app = express();
const PORT = 3000;

// Middleware для обработки JSON
app.use(cors());
app.use(express.json());

// Базовый маршрут (роут)
app.get("/", (_req: Request, res: Response) => {
  res.json({ message: "Сервер запущен и работает!" });
});

app.use('/api/services', services);
app.use('/api/auth', auth);

// Fallback for unhandled routes (404 Not Found)
app.all(/.*/, (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// GLOBAL ERROR HANDLER MUST BE LAST
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is start on http://localhost:${PORT}`);
  //запускаем сканер после старта сервера
  initScaner();
});
