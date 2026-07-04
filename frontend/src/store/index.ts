import { configureStore } from "@reduxjs/toolkit";
import authReducer from './auth-slice';
import { baseApi } from "@/services/base-api";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    // Подключаем автосгенерированный редюсер нашего API
    [baseApi.reducerPath]: baseApi.reducer,
  },
  // Добавляем мидлвар для кэширования, таймаутов и полинга
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(baseApi.middleware),
})

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
