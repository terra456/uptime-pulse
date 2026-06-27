import { configureStore } from "@reduxjs/toolkit";
import { api } from "@/services/api";

export const store = configureStore({
  reducer: {
    // Подключаем автосгенерированный редюсер нашего API
    [api.reducerPath]: api.reducer,
  },
  // Добавляем мидлвар для кэширования, таймаутов и полинга
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(api.middleware),
})

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
