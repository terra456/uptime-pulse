import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import type { ServerData } from "@/types/types";
import { Pencil, Trash2 } from "lucide-react";
import { Switch } from "./ui/switch";
import { useStartServerMutation, useStopServerMutation } from "@/services/api";
import StatusSpan from "./status-span";
import { openAuthModal, selectIsAuthenticated } from "@/store/auth-slice";
import { useDispatch, useSelector } from "react-redux";

interface ServerTableProps {
  servers: ServerData[];
  onAction: (action: any) => void;
}

export function ServersTable({ servers, onAction }: ServerTableProps) {
  const [startServer] = useStartServerMutation();
  const [stopServer] = useStopServerMutation();

  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const handleAction = (callback: () => void) => {
    if (!isAuthenticated) {
      // Кнопка активна для клика, но вместо действия открывает модалку с пояснением!
      dispatch(
        openAuthModal(
          "Войдите в аккаунт, чтобы получить возможность редактировать данные",
        ),
      );
      return;
    }

    callback();
  };

  return (
    <Table>
      <TableCaption>A list of servises.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="w-25">Name</TableHead>
          <TableHead>URL</TableHead>
          <TableHead>Active</TableHead>
          <TableHead>Interval</TableHead>
          <TableHead>Status</TableHead>
          <TableHead></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {servers.map((server) => {
          return (
            <TableRow key={server.id}>
              <TableCell className="text-left font-medium">
                {server.name}
              </TableCell>
              <TableCell className="text-left">{server.url}</TableCell>
              <TableCell className="text-left">
                <Switch
                  id="active-toggle"
                  checked={server.isActive}
                  onCheckedChange={async () =>
                    server.isActive
                      ? await stopServer(server.id).unwrap()
                      : await startServer(server.id).unwrap()
                  }
                />
              </TableCell>
              <TableCell className="text-left">
                {server.interval / 60}
              </TableCell>
              <TableCell className="text-left">
                <StatusSpan status={server.status} />
              </TableCell>
              <TableCell className="text-right space-x-2">
                <Button
                  size="sm"
                  onClick={() => onAction({ type: "logs", server })}
                >
                  Логи
                </Button>

                <Button
                  variant="ghost"
                  size="icon" // Делает кнопку квадратной
                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                  onClick={() =>
                    handleAction(() => onAction({ type: "edit", server }))
                  }
                  title="Изменить настройки" // Подсказка при наведении
                >
                  <Pencil className="h-4 w-4" /> {/* Иконка вместо текста */}
                  <span className="sr-only">Изменить</span>{" "}
                  {/* Скрытый текст для скринридеров */}
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  onClick={() =>
                    handleAction(() => onAction({ type: "delete", server }))
                  }
                  title="Удалить сервер"
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Удалить</span>
                </Button>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
