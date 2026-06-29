import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useGetLogsQuery } from "@/services/api";
import StatusSpan from "./status-span";

interface LogsTableProps {
  id: string;
}

export function LogsTable({ id }: LogsTableProps) {
  // Параметр pollingInterval заставляет хук делать тихий запрос каждые 5000 мс (5 секунд)
  const {
    data: logs = [],
    isLoading,
    isError,
  } = useGetLogsQuery(id, {
    pollingInterval: 60 * 1000,
    skip: !id, // не делать запрос, если id по какой-то причине пустой
  });

  // Обработка состояния первичной загрузки
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12 text-sm text-muted-foreground animate-pulse">
        Синхронизация с сервером и получение логов...
      </div>
    );
  }

  // Обработка критической ошибки сети или бэкенда
  if (isError) {
    return (
      <div className="text-center py-8 text-sm text-destructive bg-destructive/5 rounded-lg border border-destructive/10 p-4">
        Не удалось загрузить историю проверок. Пожалуйста, проверьте соединение.
      </div>
    );
  }

  return (
    <Table>
      <TableCaption>Последние данные для {id}</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="w-25">Время</TableHead>
          <TableHead>Статус</TableHead>
          <TableHead>Время ответа (мс)</TableHead>
          <TableHead>HTTP-ответ</TableHead>
          <TableHead>Текст ошибки</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {logs.length === 0 ? (
          <TableRow>
            <TableCell
              colSpan={4}
              className="h-24 text-center text-muted-foreground text-sm"
            >
              История проверок данного узла пуста.
            </TableCell>
          </TableRow>
        ) : (
          logs.map((log) => (
            <TableRow key={log.id}>
              <TableCell className="text-left font-medium">
                {log.createdAt.toString()}
              </TableCell>
              <TableCell className="text-left">
                <StatusSpan status={log.status} />
              </TableCell>
              <TableCell className="text-left">{log.responseTime}</TableCell>
              <TableCell className="text-left">{log.statusCode}</TableCell>
              <TableCell className="text-left">
                {log.error ? (
                  <span
                    className="block max-w-62.5 truncate text-xs font-mono text-red-400"
                    title={log.error} // При наведении мышки покажется полный текст ошибки
                  >
                    {log.error || "Unknown Connection Timeout"}
                  </span>
                ) : (
                  <span className="text-xs text-muted-foreground/40">—</span>
                )}
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
