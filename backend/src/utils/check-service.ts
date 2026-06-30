import { error } from "node:console";
import type { ServiceResponse } from "../types/types.js";

export async function checkService({id, url}: {id: string, url: string}): Promise<ServiceResponse> {
  const start = performance.now();
  const result: Partial<ServiceResponse> = {
    serviceId: id,
  };

  try {
    const response = await fetch(url);
    Object.assign(result, {
      status: response.ok ? "UP" : "DOWN",
      statusCode: response.status,
    });

    if (!response.ok) {
      result.error = response.statusText;
    }
  } catch (e) {
    Object.assign(result, {
      status: "DOWN",
      statusCode: null,
      error: String(e),
    });
  } finally {
    const end = performance.now(); // Фиксируем время завершения
    const duration = end - start;
    result.responseTime = duration;
  }
  
  return result as ServiceResponse;
}