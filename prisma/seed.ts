import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import bcrypt from 'bcryptjs'

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('Iniciando seed de la base de datos...')

  console.log('  -> Creando tipos de personal...')
  const personTypes = [
    { name: 'Practicantes', slug: 'practicantes', description: 'Estudiantes en práctica profesional' },
    { name: 'Seguridad', slug: 'seguridad', description: 'Personal de seguridad' },
    { name: 'Limpieza', slug: 'limpieza', description: 'Personal de limpieza e intendencia' },
    { name: 'Médico', slug: 'medico', description: 'Personal médico y de enfermería' },
    { name: 'Transportistas', slug: 'transportistas', description: 'Personal de transporte y logística' },
  ]

  for (const pt of personTypes) {
    const existing = await prisma.personType.findFirst({ where: { slug: pt.slug } })
    if (!existing) {
      await prisma.personType.create({ data: pt })
      console.log(`     Creado: ${pt.name}`)
    } else {
      console.log(`     Ya existe: ${pt.name}`)
    }
  }

  console.log('  -> Creando llaves iniciales...')
  const initialKeys = [
    'Sala Agave',
    'Sala Mezquite',
    'Sala Sotol',
    'Sala Aant',
    'Sala Asakao',
    'Enfermería',
  ]

  for (const keyName of initialKeys) {
    const existing = await prisma.key.findUnique({ where: { name: keyName } })
    if (!existing) {
      await prisma.key.create({
        data: {
          name: keyName,
          status: 'AVAILABLE',
          active: true,
        },
      })
      console.log(`     Creada: ${keyName}`)
    } else {
      console.log(`     Ya existe: ${keyName}`)
    }
  }


  const superEmail = process.env.SUPERADMIN_EMAIL
  const superName = process.env.SUPERADMIN_NAME
  const superPassword = process.env.SUPERADMIN_PASSWORD_INIT

  if (!superEmail || !superName || !superPassword) {
    console.log('\n  ⚠️  SUPERADMIN_EMAIL, SUPERADMIN_NAME y SUPERADMIN_PASSWORD_INIT son requeridos.')
    console.log('     El superadmin no fue creado.\n')
  } else {
    console.log('  -> Inicializando SUPERADMIN...')
    const existing = await prisma.adminUser.findFirst({ where: { email: superEmail } })

    if (!existing) {
      const passwordHash = await bcrypt.hash(superPassword, 12)
      await prisma.adminUser.create({
        data: {
          name: superName,
          email: superEmail,
          passwordHash,
          role: 'SUPERADMIN',
          mustChangePassword: true,
        },
      })
      console.log(`     Creado: ${superName} <${superEmail}> [SUPERADMIN]`)
      console.log('     ⚠️  mustChangePassword = true — deberá cambiar su contraseña en el primer login.')
    } else {
      const updates: Record<string, unknown> = {}
      if (existing.role !== 'SUPERADMIN') updates.role = 'SUPERADMIN'
      if (existing.name !== superName) updates.name = superName
      if (Object.keys(updates).length > 0) {
        await prisma.adminUser.update({ where: { id: existing.id }, data: updates })
        console.log(`     Actualizado: ${superEmail} →`, updates)
      } else {
        console.log(`     Ya existe: ${superName} <${superEmail}> [SUPERADMIN]`)
      }
    }
  }

  console.log('\nSeed completado exitosamente.')
}

main()
  .catch((e) => {
    console.error('Error en seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
    await pool.end()
  })
