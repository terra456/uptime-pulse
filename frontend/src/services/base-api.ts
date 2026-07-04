import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const baseApi = createApi({
  reducerPath: 'baseApi',
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_URL,
    prepareHeaders: (headers, { getState }) => {
      // 1. Принудительно приводим тип к вашему RootState
      const state = getState() as any; 
      
      // 2. Выводим лог в консоль браузера (F12) для проверки
      console.log("Текущий стейт в Redux:", state);
      console.log("Токен в стейте:", state.auth?.accessToken);

      const token = state.auth?.accessToken;
      
      if (token) {
        // Имя заголовка должно быть 'authorization' (маленькими буквами)
        headers.set('authorization', `Bearer ${token}`);
      }
      
      return headers;
    },
  }),
  // TagTypes нужны для автоматического обновления данных (инвалидации кэша)
  tagTypes: ["Servers", "Logs"],
  endpoints: () => ({}), // Пока оставляем пустым
});