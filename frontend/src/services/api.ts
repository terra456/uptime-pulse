import { baseApi } from './base-api';
import type { LogData, ServerData, ServerFormFields, ServerUpdate } from "@/types/types";

export const api = baseApi.injectEndpoints({

  endpoints: (builder) => {
    const prefix = (url: string) => `/services${url}`;

    return {
      getServers: builder.query<ServerData[], void>({
        query: () => prefix(''),
        providesTags: ["Servers"], // Кэш завязан на этот тег
      }),

      getLogs: builder.query<LogData[], string>({
        query: (id) => prefix(`/${id}/logs`),
        providesTags: ["Logs"],
      }),

      addNewServer: builder.mutation<ServerData, ServerFormFields>({
        query: initialData => ({
          url: prefix(''),
          method: 'POST',
          // Include the entire object as the body of the request
          body: initialData
        }),
        invalidatesTags: ["Servers"],
      }),

      editServer: builder.mutation<ServerData, ServerUpdate>({
        query: ({id, ...initialData}) => ({
          url: prefix(`/${id}`),
          method: 'PUT',
          body: initialData
        }),
        invalidatesTags: ["Servers"],
      }),

      startServer: builder.mutation<ServerData, ServerUpdate>({
        query: (id) => ({
          url: prefix(`/${id}/start`),
          method: 'POST',
        }),
        invalidatesTags: ["Servers"],
      }),

      stopServer: builder.mutation<ServerData, ServerUpdate>({
        query: (id) => ({
          url: prefix(`/${id}/stop`),
          method: 'POST',
        }),
        invalidatesTags: ["Servers"],
      }),

      deleteServer: builder.mutation<void, string>({
        query: (id) => ({
          url: prefix(`/${id}`),
          method: "DELETE",
        }),
        // Как только сервер удален, тег "Servers" инвалидируется,
        // и RTK Query сам автоматически перевызовет getServers для обновления таблицы!
        invalidatesTags: ["Servers"], 
      }),

      clearLogs: builder.mutation<void, string>({
        query: (id) => ({
          //id - server id for their logs
          url: prefix(`/${id}/logs`),
          method: "DELETE",
        }),
        // Как только сервер удален, тег "Servers" инвалидируется,
        // и RTK Query сам автоматически перевызовет getServers для обновления таблицы!
        invalidatesTags: ["Logs"],
      }),
    }
  },
})

// RTK Query автоматически генерирует хуки на основе имен эндпоинтов:
export const { 
  useGetServersQuery, 
  useGetLogsQuery, 
  useDeleteServerMutation,
  useAddNewServerMutation,
  useEditServerMutation,
  useStartServerMutation,
  useStopServerMutation,
  useClearLogsMutation
} = api;
