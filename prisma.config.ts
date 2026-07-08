import { defineConfig } from '@prisma/config';

export default defineConfig({
  engine: "classic",
  schema: "prisma/schema.prisma",
  datasource: {
    url: "postgresql://postgres:madhukiraninaparthi2006@db.wjdotuzlvulpdbattmtw.supabase.co:5432/postgres",
  },
});
