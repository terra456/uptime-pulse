export type ServiceResponse = {
  serviceId: string;
  status: "UP" | "DOWN"; // Статус в момент проверки (UP или DOWN)
  statusCode: number | null;     // HTTP-ответ (например, 200, 404, 500). Может быть null, если сервер вообще не ответил
  responseTime?: number;   // Время ответа сервера в миллисекундах
  error?: string;// Текст ошибки, если запрос упал (например, "ENOTFOUND")
}

export type ServiceFormFields = {
  name: string;
  url: string;
  interval?: number;
}