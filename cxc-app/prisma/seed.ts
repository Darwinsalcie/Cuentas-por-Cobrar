import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Start seeding...')

  // Limpiar base de datos
  await prisma.transaccion.deleteMany()
  await prisma.asientoContable.deleteMany()
  await prisma.tipoDocumento.deleteMany()
  await prisma.cliente.deleteMany()

  // 1. Tipos de Documento
  const tipoFactura = await prisma.tipoDocumento.create({
    data: {
      descripcion: 'Factura de Crédito',
      cuentaContable: '1101-01', // Cuentas por Cobrar Clientes
      estado: 'ACTIVO',
    }
  })

  const tipoNotaDebito = await prisma.tipoDocumento.create({
    data: {
      descripcion: 'Nota de Débito',
      cuentaContable: '1101-02',
      estado: 'ACTIVO',
    }
  })

  const tipoNotaCredito = await prisma.tipoDocumento.create({
    data: {
      descripcion: 'Nota de Crédito',
      cuentaContable: '4101-01', // Devoluciones y Descuentos
      estado: 'ACTIVO',
    }
  })

  const tipoRecibo = await prisma.tipoDocumento.create({
    data: {
      descripcion: 'Recibo de Ingreso',
      cuentaContable: '1001-01', // Efectivo / Banco
      estado: 'ACTIVO',
    }
  })

  // 2. Clientes
  const clientesData = [
    { nombre: 'Juan Pérez', cedula: '001-1234567-8', limiteCredito: 50000 },
    { nombre: 'María Gómez', cedula: '001-8765432-1', limiteCredito: 100000 },
    { nombre: 'Pedro Rodríguez', cedula: '402-9988776-5', limiteCredito: 75000 },
    { nombre: 'Ana López', cedula: '031-1122334-4', limiteCredito: 150000 },
    { nombre: 'Carlos Martínez', cedula: '047-5544332-2', limiteCredito: 30000, estado: 'INACTIVO' },
  ]

  const clientes = []
  for (const c of clientesData) {
    const cliente = await prisma.cliente.create({ data: c })
    clientes.push(cliente)
  }

  // 3. Transacciones y Asientos
  // Facturas (Débitos)
  for (let i = 0; i < 5; i++) {
    const trans = await prisma.transaccion.create({
      data: {
        tipoMovimiento: 'DB',
        numeroDocumento: `FAC-00${i + 1}`,
        fecha: new Date(),
        monto: (i + 1) * 1000,
        tipoDocumentoId: tipoFactura.id,
        clienteId: clientes[i % 4].id,
      }
    })

    await prisma.asientoContable.create({
      data: {
        descripcion: `Registro Factura ${trans.numeroDocumento}`,
        cuenta: tipoFactura.cuentaContable,
        tipoMovimiento: 'DB',
        fechaAsiento: new Date(),
        montoAsiento: trans.monto,
        clienteId: trans.clienteId,
        estado: 'REGISTRADO'
      }
    })
  }

  // Pagos (Créditos)
  for (let i = 0; i < 3; i++) {
    const trans = await prisma.transaccion.create({
      data: {
        tipoMovimiento: 'CR',
        numeroDocumento: `REC-00${i + 1}`,
        fecha: new Date(),
        monto: (i + 1) * 500,
        tipoDocumentoId: tipoRecibo.id,
        clienteId: clientes[i].id,
      }
    })

    await prisma.asientoContable.create({
      data: {
        descripcion: `Registro Pago ${trans.numeroDocumento}`,
        cuenta: tipoRecibo.cuentaContable,
        tipoMovimiento: 'CR',
        fechaAsiento: new Date(),
        montoAsiento: trans.monto,
        clienteId: trans.clienteId,
        estado: 'REGISTRADO'
      }
    })
  }

  console.log('Seeding finished.')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
