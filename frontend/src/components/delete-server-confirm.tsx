import { Button } from "@/components/ui/button";
import type { ServerData } from "@/types/types";
import { useDeleteServerMutation } from "@/services/api";

interface DeleteServerConfirmProps {
  server: ServerData;
  onCancel: () => void;
}

export function DeleteServerConfirm({
  server,
  onCancel,
}: DeleteServerConfirmProps) {
  const [deleteServer, { isLoading: isDeleting }] = useDeleteServerMutation();

  const handleDelete = async () => {
    try {
      // Вызываем функцию удаления и ждем выполнения (.unwrap() развернет промис)
      await deleteServer(server.id).unwrap();

      // После успешного удаления просто закрываем модалку.
      // Список серверов в фоне обновится САМ благодаря механизму тегов!
      onCancel();
    } catch (err) {
      console.error("Ошибка при удалении сервера с бэкенда:", err);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-foreground">
        Сервер <span className="font-semibold">{server.url}</span> больше не
        будет проверяться на доступность.
      </p>
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel} disabled={isDeleting}>
          Отмена
        </Button>
        <Button
          variant="destructive"
          onClick={handleDelete}
          disabled={isDeleting}
        >
          {isDeleting ? "Удаление..." : "Да, удалить"}
        </Button>
      </div>
    </div>
  );
}
