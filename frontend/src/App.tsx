import { useState } from "react";
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

type ModalAction =
  | { type: "create" }
  | { type: "edit"; server: ServerData }
  | { type: "logs"; server: ServerData }
  | { type: "delete"; server: ServerData }
  | null; // null означает, что все окна закрыты

export default function App() {
  const [action, setAction] = useState<ModalAction>(null);

  const { data: servers = [], isLoading, isError } = useGetServersQuery();

  return (
    <ThemeProvider defaultTheme="system" storageKey="uptime-pulse-theme">
      <div className="relative flex min-h-screen flex-col bg-background text-foreground">
        {/* Подключаем наш хедер */}
        <Header />

        {/* Главный контент страницы */}
        <main className="flex-1 mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
            Мониторинг, который не спит
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
            Следите за доступностью ваших сайтов и сервисов в реальном времени.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Button size="lg" onClick={() => setAction({ type: "create" })}>
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
      </div>
    </ThemeProvider>
  );
}
