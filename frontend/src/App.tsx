import { useEffect, useState } from "react";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/footer";
import { ThemeProvider } from "@/components/theme-provider";
import { BaseModal } from "@/components/base-modal";
import { AddServerForm } from "@/components/add-server-form";
import { ServersTable } from "@/components/servers-table";
import { LogsTable } from "@/components/logs-table";
import { DeleteServerConfirm } from "@/components/delete-server-confirm";
import type { ServerData } from "@/types/types";
import { useGetServersQuery } from "@/services/api";
import {
  logOut,
  openAuthModal,
  selectIsAuthenticated,
  setNewAccessToken,
} from "@/store/auth-slice";
import { useRefreshTokensMutation } from "@/services/auth-api";
import { useDispatch, useSelector } from "react-redux";
import { Toaster } from "@/components/ui/sonner";

type ModalAction =
  | { type: "create" }
  | { type: "edit"; server: ServerData }
  | { type: "logs"; server: ServerData }
  | { type: "delete"; server: ServerData }
  | { type: "start"; server: ServerData }
  | { type: "stop"; server: ServerData }
  | null; // null означает, что все окна закрыты

export default function App() {
  const [action, setAction] = useState<ModalAction>(null);
  const dispatch = useDispatch();

  // Локальный стейт, чтобы не показывать интерфейс, пока проверяется сессия
  const [isInitializing, setIsInitializing] = useState(true);

  const {
    data: servers = [],
    isLoading,
    isError,
  } = useGetServersQuery(undefined, {
    // Запрос НЕ уйдет на бэкенд, пока isInitializing равен true
    skip: isInitializing,
  });

  // Хук мутации из RTK Query
  const [refreshTokens] = useRefreshTokensMutation();

  const isAuthenticated = useSelector(selectIsAuthenticated);
  const handleAction = (callback: () => void) => {
    if (!isAuthenticated) {
      // Кнопка активна для клика, но вместо действия открывает модалку с пояснением!
      dispatch(
        openAuthModal("Войдите в аккаунт, чтобы добавить новые сервера"),
      );
      return;
    }

    // Логика самого действия (если пользователь авторизован)
    console.log("Выполняю действие для сервера");
    callback();
  };

  useEffect(() => {
    const initializeAuth = async () => {
      // 1. Проверяем, есть ли сохраненный рефреш-токен в браузере
      const savedRefreshToken = localStorage.getItem("refreshToken");

      if (!savedRefreshToken) {
        // Если токена нет, то пользователь аноним, завершаем загрузку
        setIsInitializing(false);
        return;
      }

      try {
        // 2. Отправляем запрос на бэк для получения нового Access-токена
        const data = await refreshTokens({
          refreshToken: savedRefreshToken,
        }).unwrap();

        // 3. Если бэк ответил 200, записываем новые токены в Redux и localStorage
        dispatch(
          setNewAccessToken({
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
          }),
        );
      } catch (error) {
        // 4. Если токен просрочен или удален из БД бэкенда, сбрасываем всё (разлогиниваем)
        console.warn("Сессия устарела или невалидна:", error);
        dispatch(logOut());
      } finally {
        // В любом случае убираем экран загрузки приложения
        setIsInitializing(false);
      }
    };

    initializeAuth();
  }, [refreshTokens, dispatch]);

  // Пока идет запрос к бэкенду, показываем аккуратный спиннер shadcn или обычный лоадер
  if (isInitializing) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-2">
          {/* Спиннер Tailwind */}
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">
            Восстановление сессии...
          </p>
        </div>
      </div>
    );
  }

  return (
    <ThemeProvider defaultTheme="system" storageKey="uptime-pulse-theme">
      <div className="relative flex min-h-screen flex-col bg-background text-foreground">
        {/* Подключаем наш хедер */}
        <Header isInitializing={isInitializing} />

        {/* Главный контент страницы */}
        <main className="flex-1 mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
            Мониторинг, который не спит
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
            Следите за доступностью ваших сайтов и сервисов в реальном времени.
          </p>
          <div className="m-8 flex justify-center gap-4">
            <Button
              size="lg"
              onClick={() => handleAction(() => setAction({ type: "create" }))}
            >
              Добавить сервер на мониторинг
            </Button>
          </div>

          {isLoading && (
            <div className="flex items-center justify-center py-12 text-sm text-muted-foreground animate-pulse">
              Синхронизация с сервером и получение данных...
            </div>
          )}

          {isError && (
            <div className="text-center py-8 text-sm text-destructive bg-destructive/5 rounded-lg border border-destructive/10 p-4">
              Не удалось данные. Пожалуйста, проверьте соединение.
            </div>
          )}

          {servers.length === 0 ? (
            <div className="text-center py-8 text-sm text-destructive bg-destructive/5 rounded-lg border border-destructive/10 p-4">
              У вас пока что не добавлено ни одного сервера для мониторинга.
            </div>
          ) : (
            <ServersTable servers={servers} onAction={setAction} />
          )}

          {/* 1. МОДАЛКА: СОЗДАНИЕ И РЕДАКТИРОВАНИЕ */}
          <BaseModal
            isOpen={action?.type === "create" || action?.type === "edit"}
            onClose={() => setAction(null)}
            title={
              action?.type === "edit"
                ? "Редактировать настройки"
                : "Новый объект мониторинга"
            }
            description={
              action?.type === "edit"
                ? "Внесите изменения в конфигурацию."
                : "Введите адрес сайта для отслеживания."
            }
          >
            <AddServerForm
              onClose={() => setAction(null)}
              initialData={action?.type === "edit" ? action.server : null}
            />
          </BaseModal>

          {/* 2. МОДАЛКА: ПРОСМОТР ЛОГОВ */}
          <BaseModal
            isOpen={action?.type === "logs"}
            size="xl" // <--- Делаем окно широким специально для таблицы логов
            onClose={() => setAction(null)}
            title={
              action?.type === "logs"
                ? `Логи сервера: ${action.server.name}`
                : ""
            }
            description={
              action?.type === "logs"
                ? `Подробные результаты запросов для ${action.server.url}`
                : ""
            }
          >
            {action?.type === "logs" && <LogsTable id={action.server.id} />}
          </BaseModal>

          {/* 3. МОДАЛКА: ПОДТВЕРЖДЕНИЕ УДАЛЕНИЯ */}
          <BaseModal
            isOpen={action?.type === "delete"}
            onClose={() => setAction(null)}
            title="Удалить сервер из мониторинга?"
            description={
              action?.type === "delete"
                ? `Вы собираетесь удалить ${action.server.name}. Это действие нельзя отменить.`
                : ""
            }
          >
            {action?.type === "delete" && (
              <DeleteServerConfirm
                server={action.server}
                onCancel={() => setAction(null)}
              />
            )}
          </BaseModal>
        </main>

        <Footer />
        <Toaster />
      </div>
    </ThemeProvider>
  );
}
