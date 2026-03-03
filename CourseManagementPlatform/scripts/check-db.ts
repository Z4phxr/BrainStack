// Check if courses exist using Prisma
import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'

const pool = new Pool({ connectionString: process.env.PAYLOAD_DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function checkData() {
  console.log('Checking database...')
  console.log('PAYLOAD_DATABASE_URL:', process.env.PAYLOAD_DATABASE_URL ? 'SET' : 'NOT SET')
  
  const courseCount = await prisma.courses.count()
  console.log(`Courses: ${courseCount}`)
  
  const courses = await prisma.courses.findMany({ take: 5 })
  courses.forEach((course) => {
    console.log(`- ${course.title}`)
  })
  
  await prisma.$disconnect()
  await pool.end()
  process.exit(0)
}

checkData().catch((error) => {
  console.error('Error:', error)
  process.exit(1)
})
