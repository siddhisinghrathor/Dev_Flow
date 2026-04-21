import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

// Ensure environment variables are loaded
dotenv.config();

const globalForPrisma = global as unknown as { prisma: PrismaClient };

// Fix for "prepared statement already exists" (42P05)
export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export const connectDB = async () => {
  try {
    await prisma.$connect();
    console.log('✅ PostgreSQL Connected via Prisma');
  } catch (error) {
    if (error instanceof Error) {
      console.error(`❌ Prisma Connection Error: ${error.message}`);
    }
    
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
};
