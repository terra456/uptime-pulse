import type { RootState } from './index';
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

// 1. Описываем интерфейс пользователя
interface User {
  id: string;
  login: string;
}

// 2. Структура стейта авторизации
interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  // Новые поля для контроля модалки из любого компонента
  isAuthModalOpen: boolean;
  authModalReason: string | null; // Текст-призыв к действию
}

// 3. Пытаемся восстановить данные из localStorage при инициализации сайта
const savedUser = localStorage.getItem('user');
const initialUser: User | null = savedUser ? JSON.parse(savedUser) : null;

const initialState: AuthState = {
  user: initialUser,
  accessToken: null, // access-токен всегда стартует как null (его мы запросим через /refresh при старте)
  isAuthenticated: !!initialUser, // true, если пользователь сохранен в браузере
  // Новые поля для контроля модалки из любого компонента
  isAuthModalOpen: false,
  authModalReason: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Вызывается при успешном /login или /register
    setCredentials: (
      state,
      action: PayloadAction<{ user: User; accessToken: string; refreshToken: string }>
    ) => {
      const { user, accessToken, refreshToken } = action.payload;
      
      state.user = user;
      state.accessToken = accessToken;
      state.isAuthenticated = true;

      // Долгоживущие данные прячем в localStorage
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('refreshToken', refreshToken);
    },

    // Вызывается внутри RTK Query, когда сработал автоматический /refresh токенов
    setNewAccessToken: (
      state,
      action: PayloadAction<{ accessToken: string; refreshToken: string }>
    ) => {
      state.accessToken = action.payload.accessToken;
      // Перезаписываем рефреш-токен, так как на бэкенде включена ротация (Refresh Token Rotation)
      localStorage.setItem('refreshToken', action.payload.refreshToken);
    },

    // Вызывается при логауте или если refresh-токен полностью протух
    logOut: (state) => {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;

      // Полностью очищаем хранилище браузера
      localStorage.removeItem('user');
      localStorage.removeItem('refreshToken');
    },
    // Экшен для открытия модалки из любого места приложения
    openAuthModal: (state, action: PayloadAction<string | undefined>) => {
      state.isAuthModalOpen = true;
      state.authModalReason = action.payload || null; // сохраняем причину
    },
    // Экшен для закрытия модалки
    closeAuthModal: (state) => {
      state.isAuthModalOpen = false;
      state.authModalReason = null;
    }
  },
});

export const { setCredentials, setNewAccessToken, logOut, openAuthModal, closeAuthModal } = authSlice.actions;
export default authSlice.reducer;

export const selectCurrentUser = (state: RootState) => state.auth.user;
export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated;
export const selectCurrentToken = (state: RootState) => state.auth.accessToken;
export const selectAuthModal = (state: RootState) => ({
  isOpen: state.auth.isAuthModalOpen,
  reason: state.auth.authModalReason,
});