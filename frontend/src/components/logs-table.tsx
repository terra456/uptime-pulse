import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Data {
  id: string;
  serviceId: string;
  status: "UP" | "DOWN";
  statusCode: number | null;
  responseTime: number;
  error?: string;
  createdAt: string | Date;
}

const logs: Data[] = [
  {
    id: "waeq",
    serviceId: "ejreroktr",
    status: "UP",
    statusCode: 200,
    responseTime: 5,
    createdAt: "22:15",
  },
  {
    id: "yityu",
    serviceId: "ejreroktr",
    status: "UP",
    statusCode: 404,
    responseTime: 5,
    error:
      "Can't find on this server! Can't find on this server! Can't find on this server! Can't find on this server! Can't find on this server! Can't find on this server!",
    createdAt: "22:16",
  },
  {
    id: "ouiou",
    serviceId: "ejreroktr",
    status: "DOWN",
    statusCode: 500,
    responseTime: 20,
    error: "Something went wrong!",
    createdAt: "22:17",
  },
];

interface LogsTableProps {
  id: string;
}

export function LogsTable({ id }: LogsTableProps) {
  // Маппер стилей для статусов. Oxlint проверит, чтобы все варианты были учтены.
  const statusStyles: Record<LogStatus, string> = {
    UP: "bg-green-500/10 text-green-500 border-green-500/20",
    DOWN: "bg-red-500/10 text-red-500 border-red-500/20 animate-pulse", // Текст «DOWN» будет слегка пульсировать
  };

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
        {logs.map((log) => (
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
        ))}
      </TableBody>
    </Table>
  );
}
