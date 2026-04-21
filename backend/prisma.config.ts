import "dotenv/config";
import { defineConfig, env } from "prisma/config";

// Append connection parameters to disable prepared statements 
// This fixes the "prepared statement already exists" error (42P05)
const databaseUrl = env("DATABASE_URL");
const fixedUrl = databaseUrl && !databaseUrl.includes('statement_cache_size') 
  ? `${databaseUrl}${databaseUrl.includes('?') ? '&' : '?'}statement_cache_size=0`
  : databaseUrl;

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  engine: "classic",
  datasource: {
    url: fixedUrl,
  },
});
