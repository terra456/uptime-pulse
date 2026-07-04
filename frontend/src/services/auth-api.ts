import { baseApi } from './base-api';
import { setCredentials } from '../store/auth-slice';

// 1. Описываем типы для входящих параметров и ответов бэкенда
interface AuthResponse {
  message: string;
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    login: string;
  };
}

interface AuthCredentials {
  login: string;
  password:  string;
}

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    
    // Эндпоинт регистрации
    registerUser: builder.mutation<AuthResponse, AuthCredentials>({
      query: (credentials) => ({
        url: '/auth/register',
        method: 'POST',
        body: credentials,
      }),
    }),

    // Эндпоинт логина
    loginUser: builder.mutation<AuthResponse, AuthCredentials>({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
      
      // !!! МАГИЯ ТУТ !!!
      // onQueryStarted срабатывает автоматически, как только мы запустили запрос.
      // queryFulfilled — это промис, который разрешится, когда сервер вернет ответ.
      async onQueryStarted(_args, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          
          // Как только бэк вернул токены и юзера, мы одной командой
          // обновляем Redux-стейт и localStorage через наш authSlice екшен
          dispatch(
            setCredentials({
              user: data.user,
              accessToken: data.accessToken,
              refreshToken: data.refreshToken,
            })
          );

          dispatch(baseApi.util.invalidateTags(['Servers']));
          
        } catch (err) {
          // Если логин упал с ошибкой (например, неверный пароль),
          // здесь ничего делать не нужно — ошибка обработается в самом React-компоненте
          console.log('Ошибка авторизации в RTK Query:', err);
        }
      },
    }),
    
    // Эндпоинт для обновления токенов
      refreshTokens: builder.mutation<{ accessToken: string; refreshToken: string }, { refreshToken: string }>({
        query: (body) => ({
          url: '/auth/refresh',
          method: 'POST',
          body,
        }),
      }),
      // Эндпоинт для выхода
    logoutUser: builder.mutation<void, { refreshToken: string }>({
      query: (body) => ({
        url: '/auth/logout',
        method: 'POST',
        body,
      }),
    }),
  }),
});

// Экспортируем хуки для использования в компонентах форм
export const {
  useRegisterUserMutation,
  useLoginUserMutation,
  useRefreshTokensMutation,
  useLogoutUserMutation
} = authApi;
