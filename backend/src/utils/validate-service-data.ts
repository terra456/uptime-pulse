import type { ServiceFormFields } from "../types.ts/types.js";
import { AppError } from "./app-error.js";

export function validateServiceData(data: any): ServiceFormFields | never {
  const { name, url, interval, isActive } = data;
  const number = Number(interval);
  const activation = isActive === "false" ? false : true; // т.к по умолчанию true

  if (!name) {
    throw new AppError('name must be defined', 400);
  }
  if (typeof name !== "string") {
    throw new AppError('name must be a string', 400);
  }
  if (!url) {
    throw new AppError('url must be defined', 400);
  }
  try {
    new URL(url);
  } catch (_) {
    throw new AppError('url incorrect', 400);
  }
  if (interval) {
    if (typeof number !== 'number') {
      throw new AppError('interval must be a number', 400);
    }
    if (number <= 1) {
      throw new AppError('interval must be more or equel 1 minute', 400);
    }
  }
  return { name, url, interval: number? number * 60 : 60, isActive: activation };
}