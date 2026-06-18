import express from "express";
import { prisma } from "../lib/prisma.js"
import { AppError } from "../utils/app-error.js";
import { validate } from "uuid";


const router = express.Router();

router.post('/', async (req, res) => {
  const {url, name} = req.body;
  if (!url && !name) {
    throw new AppError('URL not defined', 404);
  }
  try {
    new URL(url);
  } catch (_) {
    throw new AppError('url incorrect', 400);
  }
  const service = await prisma.service.create({
    data: {url, name}
  });
  res.status(202);
  res.send(service);
});

router.get('/', async (req, res) => {
  const services = await prisma.service.findMany();
  res.send(services);
});
router.get('/:id/logs', async (req, res) => {
  const path = req.url;
  const id = path.split('/')[1];
  console.log(path, id);
  if (id && validate(id)) {
    const logs = await prisma.log.findMany({where: {serviceId: id}});
    res.send(logs);
  } else {
    throw new AppError('id incorrect', 400);
  }
});

export default router;