import { prisma } from './backend/src/config/db.js';

console.log('Prisma models:', Object.keys(prisma).filter(k => !k.startsWith('$')));
