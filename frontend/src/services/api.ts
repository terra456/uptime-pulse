import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { LogData, ServerData, ServerFormFields, ServerUpgate } from "@/types/types";

export const api = createApi({
  reducerPath: "api",
  // Базовый URL вашего бэкенда (в будущем здесь будет ваш реальный домен)
  baseQuery: fetchBaseQuery({ baseUrl: import.meta.env.VITE_API_BASE_URL }), 
  
  // TagTypes нужны для автоматического обновления данных (инвалидации кэша)
  tagTypes: ["Servers"],

  endpoints: (builder) => ({
    getServers: builder.query<ServerData[], void>({
      query: () => "services",
      providesTags: ["Servers"], // Кэш завязан на этот тег
    }),

    getLogs: builder.query<LogData[], string>({
      query: (id) => `services/${id}/logs`,
    }),

    addNewServer: builder.mutation<ServerData, ServerFormFields>({
      query: initialData => ({
        url: '/services',
        method: 'POST',
        // Include the entire object as the body of the request
        body: initialData
      }),
      invalidatesTags: ["Servers"],
    }),

    editServer: builder.mutation<ServerData, ServerUpgate>({
      query: ({id, ...initialData}) => ({
        url: `/services/${id}`,
        method: 'PATCH',
        body: initialData
      })
    }),

    deleteServer: builder.mutation<void, string>({
      query: (id) => ({
        url: `services/${id}`,
        method: "DELETE",
      }),
      // Как только сервер удален, тег "Servers" инвалидируется,
      // и RTK Query сам автоматически перевызовет getServers для обновления таблицы!
      invalidatesTags: ["Servers"], 
    }),
  }),
})

// RTK Query автоматически генерирует хуки на основе имен эндпоинтов:
export const { 
  useGetServersQuery, 
  useGetLogsQuery, 
  useDeleteServerMutation,
  useAddNewServerMutation,
  useEditServerMutation
} = api;
