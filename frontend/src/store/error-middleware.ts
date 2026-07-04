import { type Middleware, isRejectedWithValue } from '@reduxjs/toolkit';
import { toast } from 'sonner';

export const rtkQueryErrorMiddleware: Middleware = () => (next) => (action) => {
  // Проверяем, является ли экшен "провалившимся" запросом от RTK Query
  if (isRejectedWithValue(action)) {
    const payload = action.payload as any;

    // 1. Игнорируем ошибку 401 для процесса /refresh, чтобы не спамить тостами,
    // когда у пользователя просто планово истек access-токен в фоне
    if (action.meta?.arg?.endpointName === 'refreshTokens' || payload?.status === 401) {
      return next(action);
    }

    // 2. Вытаскиваем сообщение об ошибке, которое прислал наш Express-сервер
    // Наш бэк возвращает { error: "Текст ошибки" }, в RTK Query это лежит в payload.data.error
    const serverMessage = payload?.data?.error;
    
    // Если бэк упал без внятного ответа, проверяем статус (например, 500 или нет сети)
    const fallbackMessage = payload?.status === 'FETCH_ERROR' 
      ? 'Нет связи с сервером. Проверьте интернет-соединение.' 
      : 'Произошла непредвиденная ошибка сервера';

    const finalMessage = serverMessage || fallbackMessage;

    // 3. Выводим стильный тост от shadcn / sonner
    toast.error('Ошибка запроса', {
      description: finalMessage,
      duration: 4000, // Тост закроется сам через 4 секунды
    });
  }

  return next(action);
};
