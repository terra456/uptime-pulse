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

export interface ServerData {
  id: string;
  name: string;
  url: string;
  interval: number;
  status: "UP" | "DOWN" | "UNKNOWN";
}

type ModalAction =
  | { type: "create" }
  | { type: "edit"; server: ServerData }
  | { type: "logs"; server: ServerData }
  | { type: "delete"; server: ServerData }
  | null; // null означает, что все окна закрыты

const data: ServerData[] = [
  {
    id: "jerfewkr",
    name: "first",
    url: "http://first.ru",
    interval: 60,
    status: "UP",
  },
  {
    id: "irjerew",
    name: "second",
    url: "http://second.ru",
    interval: 60,
    status: "DOWN",
  },
  {
    id: "beoiejrwe",
    name: "fird",
    url: "http://fird.ru",
    interval: 60,
    status: "UNKNOWN",
  },
];

export default function App() {
  const [servers, setServers] = useState<ServerData[]>([]);
  const [action, setAction] = useState<ModalAction>(null);

  useEffect(() => {
    setServers(data);
    // fetch("/api/servers") // Замените на ваш реальный URL
    //   .then((res) => res.json())
    //   .then((data) => setServers(data))
    //   .catch((err) => console.error("Ошибка загрузки серверов:", err));
  }, []);

  const handleDeleteSuccess = (id: string) => {
    setServers((prev) => prev.filter((s) => s.id !== id));
    setAction(null); // Закрываем окно
  };

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

          <ServersTable servers={servers} onAction={setAction} />

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
                onSuccess={handleDeleteSuccess}
              />
            )}
          </BaseModal>
        </main>

        <Footer />
      </div>
    </ThemeProvider>
  );
}
