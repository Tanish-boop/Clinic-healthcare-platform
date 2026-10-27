import { PrismaClient } from "@prisma/client";
import path from "path";
import fs from "fs";

declare global {
  // allow global `var` declarations
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

function resolveDatabaseUrl(): string {
  // If an external database (PostgreSQL / MySQL) is provided, use it directly
  if (process.env.DATABASE_URL && !process.env.DATABASE_URL.startsWith("file:")) {
    return process.env.DATABASE_URL;
  }

  const defaultDbPath = path.join(process.cwd(), "prisma", "dev.db");

  // On Vercel Serverless Functions (process.env.VERCEL is set)
  if (process.env.VERCEL) {
    const tmpDbPath = path.join("/tmp", "dev.db");
    
    // Copy the seeded database from read-only /var/task to writable /tmp
    if (!fs.existsSync(tmpDbPath) && fs.existsSync(defaultDbPath)) {
      try {
        fs.copyFileSync(defaultDbPath, tmpDbPath);
      } catch (err) {
        console.warn("[Prisma Vercel] Could not copy SQLite database to /tmp:", err);
      }
    }

    if (fs.existsSync(tmpDbPath)) {
      return `file:${tmpDbPath}`;
    }
  }

  // Fallback to local file path
  if (fs.existsSync(defaultDbPath)) {
    return `file:${defaultDbPath}`;
  }

  return process.env.DATABASE_URL || "file:./prisma/dev.db";
}

const resolvedDbUrl = resolveDatabaseUrl();

// Ensure process.env.DATABASE_URL is populated for Prisma internals
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = resolvedDbUrl;
}

export const db =
  global.prisma ||
  new PrismaClient({
    datasources: {
      db: {
        url: resolvedDbUrl,
      },
    },
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  global.prisma = db;
}
