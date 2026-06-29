import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const baseApi = createApi({
  reducerPath: 'baseApi',
  baseQuery: fetchBaseQuery({ baseUrl: import.meta.env.VITE_API_URL }),
  // TagTypes нужны для автоматического обновления данных (инвалидации кэша)
  tagTypes: ["Servers", "Logs"],
  endpoints: () => ({}), // Пока оставляем пустым
});