import { PrismaClient } from '@prisma/client'

// https://www.prisma.io/docs/support/help-articles/nextjs-prisma-client-dev-practices
declare global {
  var prisma: PrismaClient | undefined
}

export const prisma = global.prisma || new PrismaClient()

global.prisma = prisma