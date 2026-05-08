import prisma from './prisma/client.js'
import bcrypt from 'bcrypt'

const hash = await bcrypt.hash('admin123', 10)

const existing = await prisma.user.findUnique({ where: { email: 'admin@internpath.com' } })
if (existing) {
  console.log('Admin already exists, updating password...')
  await prisma.user.update({
    where: { email: 'admin@internpath.com' },
    data: { password: hash, role: 2 }
  })
} else {
  await prisma.user.create({
    data: {
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@internpath.com',
      password: hash,
      phoneNumber: '0000000000',
      role: 2
    }
  })
}

console.log('✅ Admin account ready')
console.log('   Email:    admin@internpath.com')
console.log('   Password: admin123')
await prisma.$disconnect()
