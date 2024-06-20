import { PrismaClient } from "@prisma/client";

// create global variable to connect prisma client
export const prisma = new PrismaClient({
  log: ["query", "info", "warn", "error"], // Enable logging for debugging
});
