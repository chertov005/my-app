// lib/db.js
import { PrismaClient } from '@prisma/client'

/** @type {PrismaClient} */
const prisma = global.prisma || new PrismaClient()

if (process.env.NODE_ENV !== 'production') global.prisma = prisma

export default prisma