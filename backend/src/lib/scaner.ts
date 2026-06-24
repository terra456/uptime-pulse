import type { Service } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import cron, { type ScheduledTask } from 'node-cron';
import { checkService } from "../utils/check-service.js";
import { saveResponse } from "../utils/save-response.js";

const activeCronJobs:{ [targetId: string]: ScheduledTask } = {};

export function scheduleCronForUrl(target: Service) {
  if (activeCronJobs[target.id]) {
    console.log(`[Cron] Перезапуск задачи для ID: ${target.id}`);
    activeCronJobs[target.id]?.stop();
    delete activeCronJobs[target.id];
  }

  console.log(`[Cron] Старт проверки для ID ${target.id}: ${target.url}`);

  const minutes = Math.max(1, Math.round(target.interval / 60));
  const cronExpression = `*/${minutes} * * * *`;

  const task = cron.schedule(cronExpression, async () => {
    console.log(`[Cron] Проверка для ID ${target.id}: ${target.url}`);
    try {
      const resultData = await checkService({id: target.id, url: target.url});
      await saveResponse(resultData);
      
    } catch (e) {
      console.error(`[Cron][Ошибка] ID ${target.id} (${target.url}):`, e);
      // Здесь при желании можно обновить статус в БД на 'failed' или записать лог ошибки
    }
  });

  activeCronJobs[target.id] = task;
}

export async function initScaner() {
  try {
    const pendingUrls = await prisma.service.findMany({});

    console.log(`[Система] Восстановление из БД: найдено ${pendingUrls.length} URL. Запуск cron...`);
    
    for (const target of pendingUrls) {
      scheduleCronForUrl(target);
    }
  } catch (error) {
    console.error('[Система] Ошибка инициализации cron-задач:', error);
  }
}

export function stopCronForUrl(id: string) {
  if (activeCronJobs[id]) {
    activeCronJobs[id].stop(); // Останавливаем выполнение cron
    delete activeCronJobs[id]; // Удаляем из объекта памяти
    console.log(`[Cron] Задача с ID ${id} была успешно остановлена и удалена из памяти.`);
    return true;
  }
  return false;
} 