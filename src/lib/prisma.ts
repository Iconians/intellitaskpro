import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);

// No query/warn logging by default so DB schema and queries are never visible in browser or terminal.
// Set DEBUG_PRISMA=1 in env to enable query logging locally for debugging only.
const enableQueryLog =
  process.env.NODE_ENV === "development" &&
  process.env.DEBUG_PRISMA === "1";

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: enableQueryLog ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
