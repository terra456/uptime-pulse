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
import type { LogData } from "@/types/types";

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

  // Маппер стилей для статусов. Oxlint проверит, чтобы все варианты были учтены.
  const statusStyles: Record<LogData["status"], string> = {
    UP: "bg-green-500/10 text-green-500 border-green-500/20",
    DOWN: "bg-red-500/10 text-red-500 border-red-500/20 animate-pulse", // Текст «DOWN» будет слегка пульсировать
  };

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
                <span
                  className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold tracking-wide uppercase ${statusStyles[log.status]}`}
                >
                  {log.status}
                </span>
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
