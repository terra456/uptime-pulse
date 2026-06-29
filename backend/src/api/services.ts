import express from "express";
import { prisma } from "../lib/prisma.js";
import { AppError, NotFoundError } from "../utils/app-error.js";
import { validate } from "uuid";
import { scheduleCronForUrl, stopCronForUrl } from "../lib/scaner.js";
import { validateServiceData } from "../utils/validate-service-data.js";

const router = express.Router();

router.post('/', async (req, res) => {
  const serviceData = req.body;
  try {
    const validData = validateServiceData(serviceData);

    const service = await prisma.service.create({
      data: validData
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

router.get('/', async (req, res) => {
  const services = await prisma.service.findMany();
  res.send(services);
});

router.get('/:id', async (req, res) => {
  const { id } = req.params;
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

router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const data = req.body;

  if (!(id && validate(id))) {
    throw new AppError('id incorrect', 400);
  }

  try {
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

router.patch('/:id/start', async (req, res) => {
  const { id } = req.params;

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

router.patch('/:id/stop', async (req, res) => {
  const { id } = req.params;

  if (!(id && validate(id))) {
    throw new AppError('id incorrect', 400);
  }

  try {
    const service = await prisma.service.update({
      where: { id },
      data: { isActive: false },
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

router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  if (id && validate(id)) {
    try {
      const service = await prisma.service.delete({
        where: { id },
      });
      if (!service) {
        throw new NotFoundError(`Service with id ${id} not found`);
      }

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

router.get('/:id/logs', async (req, res) => {
  const { id } = req.params;
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

router.delete('/:id/logs', async (req, res) => {
  const { id } = req.params;
  if (id && validate(id)) {
    const logs = await prisma.log.deleteMany({ where: { serviceId: id } });
    res.status(204).end();
  } else {
    throw new AppError('id incorrect', 400);
  }
});

export default router;