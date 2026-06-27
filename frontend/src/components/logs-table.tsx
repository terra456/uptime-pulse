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
    error: "Can't find on this server!",
    createdAt: "22:16",
  },
  {
    id: "ouiou",
    serviceId: "ejreroktr",
    status: "UP",
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
            <TableCell className="text-left">{log.status}</TableCell>
            <TableCell className="text-left">{log.responseTime}</TableCell>
            <TableCell className="text-left">{log.statusCode}</TableCell>
            <TableCell className="text-left">{log.error}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
