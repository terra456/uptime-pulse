import { prisma } from "../lib/prisma.js";
import type { ServiceResponse } from "../types/types.js";

export async function saveResponse(response: ServiceResponse) {
  try {
    const log = await prisma.log.create({data: response});

    const service = await prisma.service.update({
      where: {id: response.serviceId},
      data: {status: response.status}
    });
    
    return service;

  } catch(e) {
    console.error(e);
  }
}