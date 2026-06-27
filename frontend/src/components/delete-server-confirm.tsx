import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { ServerData } from "@/App";

interface DeleteServerConfirmProps {
  server: ServerData;
  onCancel: () => void;
  onSuccess: (id: string) => void;
}

export function DeleteServerConfirm({
  server,
  onCancel,
  onSuccess,
}: DeleteServerConfirmProps) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      // Отправляем DELETE запрос на бэкенд
      // await fetch(`/api/servers/${server.id}`, { method: "DELETE" });
      console.log(`delete not implement ${server.id}`);
      onSuccess(server.id);
    } catch (err) {
      console.error("Не удалось удалить сервер", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-foreground">
        Сервер <span className="font-semibold">{server.url}</span> больше не
        будет проверяться на доступность.
      </p>
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel} disabled={loading}>
          Отмена
        </Button>
        <Button variant="destructive" onClick={handleDelete} disabled={loading}>
          {loading ? "Удаление..." : "Да, удалить"}
        </Button>
      </div>
    </div>
  );
}
