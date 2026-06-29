export interface ServerData {
  id: string;
  name: string;
  url: string;
  interval: number;
  status: "UP" | "DOWN" | "UNKNOWN";
  isActive: boolean;
}

export interface LogData {
  id: string;
  serviceId: string;
  status: "UP" | "DOWN";
  statusCode: number | null;
  responseTime: number;
  error?: string;
  createdAt: string | Date;
}

export interface ServerFormFields {
  name: string;
  url: string;
  interval: string; // Например, добавим интервал проверки (5 мин, 10 мин)
  isActive: boolean;
}

export interface ServerUpdate extends ServerFormFields {
  id: string,
}