import express from "express";
import { prisma } from "../lib/prisma.js";
import { AppError, NotFoundError } from "../utils/app-error.js";
import { validate } from "uuid";
import { scheduleCronForUrl, stopCronForUrl } from "../lib/scaner.js";
import { validateServiceData } from "../utils/validate-service-data.js";
import { validateAuth } from "../middlewares/auth-middleware.js";

const router = express.Router();

router.post('/', validateAuth(true), async (req, res) => {
  // Достаем id текущего пользователя из мидлвари
  const currentUserId = req.user!.userId;

  const serviceData = req.body;
  try {
    const validData = validateServiceData(serviceData);

    const service = await prisma.service.create({
      data: {
        userId: currentUserId,
        ...validData,
      },
    });

    if (service.isActive === true) {
      scheduleCronForUrl(service);
    }

    res.status(202).send(service);
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new Error('somthing wrong');
  }
});

router.get('/', validateAuth(false), async (req, res) => {
  if (req.user) {
    const currentUserId = req.user!.userId;
  
    const services = await prisma.service.findMany({
      where: { userId: currentUserId },
      orderBy: { createdAt: "desc" }
    });
    res.send(services);
  } else {
    const services = await prisma.service.findMany({
      where: { userId: null },
      orderBy: { createdAt: "desc" }
    });
    res.send(services);
  }
});

router.get('/:id', validateAuth(false), async (req, res) => {
  const id = req.params.id as string;

  if (id && validate(id)) {
    try {
      const service = await prisma.service.findFirst({
        where: { id },
      });
      if (!service) {
        throw new NotFoundError(`Service with id ${id} not found`);
      }
      res.send(service);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new Error('somthing wrong');
    }
  } else {
    throw new AppError('id incorrect', 400);
  }
});

router.put('/:id', validateAuth(true), async (req, res) => {
  const id = req.params.id as string; 
  
  // Достаем id текущего пользователя из мидлвари
  const currentUserId = req.user!.userId;

  const data = req.body;

  if (!(id && validate(id))) {
    throw new AppError('id incorrect', 400);
  }

  try {
    const existingService = await prisma.service.findFirst({
      where: {
        id: id,
        userId: currentUserId, // Защита: чужой сервис изменить нельзя
      },
    });

    if (!existingService) {
      // Если сервиса нет ИЛИ он чужой — отдаем 404 (чтобы не выдавать существование чужих id)
      throw new NotFoundError(`Service with id ${id} not found`);
    }

    const validData = validateServiceData(data);
    const service = await prisma.service.update({
      where: { id },
      data: validData,
    });
    if (!service) {
      throw new NotFoundError(`Service with id ${id} not found`);
    }
    res.status(202).send(service);
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new Error('somthing wrong');
  }
});

router.patch('/:id/start', validateAuth(false), async (req, res) => {
  const id = req.params.id as string;

  if (!(id && validate(id))) {
    throw new AppError('id incorrect', 400);
  }

  try {
    const service = await prisma.service.update({
      where: { id },
      data: {isActive: true},
    });
    if (!service) {
      throw new NotFoundError(`Service with id ${id} not found`);
    }

    //запускаем само сканирование
    scheduleCronForUrl(service);

    res.status(202).send(service);
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new Error('somthing wrong');
  }
});

router.patch('/:id/stop', validateAuth(false), async (req, res) => {
  const id = req.params.id as string;

  if (!(id && validate(id))) {
    throw new AppError('id incorrect', 400);
  }

  try {
    const service = await prisma.service.update({
      where: { id },
      data: { isActive: false, status: "UNKNOWN" },
    });
    if (!service) {
      throw new NotFoundError(`Service with id ${id} not found`);
    }

    //останавливем сканирование
    stopCronForUrl(id);

    res.status(202).send(service);
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new Error('somthing wrong');
  }
});

router.delete('/:id', validateAuth(true), async (req, res) => {
  const id = req.params.id as string; 
  
  // Достаем id текущего пользователя из мидлвари
  const currentUserId = req.user!.userId;

  if (id && validate(id)) {
    try {
      const existingService = await prisma.service.findFirst({
        where: {
          id: id,
          userId: currentUserId, // Защита: чужой сервис удалить нельзя
        },
      });

      if (!existingService) {
        // Если сервиса нет ИЛИ он чужой — отдаем 404 (чтобы не выдавать существование чужих id)
        throw new NotFoundError(`Service with id ${id} not found`);
      }

      const service = await prisma.service.delete({
        where: { id },
      });

      //останавливем сканирование
      stopCronForUrl(id);

      res.status(204).end();
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new Error('somthing wrong');
    }
  } else {
    throw new AppError('id incorrect', 400);
  }
});

router.get('/:id/logs', validateAuth(false), async (req, res) => {
  const id = req.params.id as string;

  if (id && validate(id)) {
    try {
      const logs = await prisma.log.findMany({
        where: {serviceId: id},
        orderBy: { createdAt: "desc" },
        take: 100,
      });
      res.send(logs);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new Error('somthing wrong');
    }
  } else {
    throw new AppError('id incorrect', 400);
  }
});

router.delete('/:id/logs', validateAuth(true), async (req, res) => {
  const id = req.params.id as string; 
  
  // Достаем id текущего пользователя из мидлвари
  const currentUserId = req.user!.userId;

  if (id && validate(id)) {
    const existingService = await prisma.service.findFirst({
        where: {
          id: id,
          userId: currentUserId, // Защита: чужой сервис удалить нельзя
        },
      });

      if (!existingService) {
        // Если сервиса нет ИЛИ он чужой — отдаем 404 (чтобы не выдавать существование чужих id)
        throw new NotFoundError(`Service with id ${id} not found`);
      }

    const logs = await prisma.log.deleteMany({ where: { serviceId: id } });
    res.status(204).end();
  } else {
    throw new AppError('id incorrect', 400);
  }
});

export default router;