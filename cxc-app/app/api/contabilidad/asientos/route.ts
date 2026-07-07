import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

// Simulación de delay de red para realismo empresarial
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export async function POST(req: NextRequest) {
  try {
    // 1. Simular latencia de red
    await delay(800)

    // 2. Parsear el cuerpo de la petición
    const body = await req.json()
    const { descripcion, cuenta, tipoMovimiento, fechaAsiento, montoAsiento, clienteId } = body

    // 3. Validaciones de campos obligatorios
    if (!descripcion || typeof descripcion !== "string") {
      return NextResponse.json({ error: "Descripción inválida o faltante" }, { status: 400 })
    }
    if (!cuenta || typeof cuenta !== "string") {
      return NextResponse.json({ error: "Cuenta contable inválida o faltante" }, { status: 400 })
    }
    if (!["DB", "CR"].includes(tipoMovimiento)) {
      return NextResponse.json({ error: "Tipo de movimiento debe ser DB o CR" }, { status: 400 })
    }
    if (!fechaAsiento || isNaN(Date.parse(fechaAsiento))) {
      return NextResponse.json({ error: "Fecha de asiento inválida o faltante" }, { status: 400 })
    }
    if (typeof montoAsiento !== "number" || montoAsiento <= 0) {
      return NextResponse.json({ error: "El monto del asiento debe ser un número positivo mayor a cero" }, { status: 400 })
    }
    if (!clienteId || typeof clienteId !== "string") {
      return NextResponse.json({ error: "Identificador de cliente inválido o faltante" }, { status: 400 })
    }

    // 4. Validar existencia del cliente
    const cliente = await prisma.cliente.findUnique({
      where: { id: clienteId },
    })

    if (!cliente) {
      return NextResponse.json({ error: "El cliente especificado no existe en la base de datos" }, { status: 404 })
    }

    // 5. Generar referencia única del sistema contable
    const randomHex = Math.floor(100000 + Math.random() * 900000).toString()
    const referenciaContable = `CNT-${new Date().getFullYear()}-${randomHex}`

    // 6. Registrar en la base de datos local
    const nuevoAsiento = await prisma.asientoContable.create({
      data: {
        descripcion: `${descripcion} (Ref: ${referenciaContable})`,
        cuenta,
        tipoMovimiento,
        fechaAsiento: new Date(fechaAsiento),
        montoAsiento,
        estado: "REGISTRADO",
        clienteId,
      },
    })

    // 7. Responder confirmación
    return NextResponse.json({
      success: true,
      status: "REGISTRADO",
      referencia: referenciaContable,
      asientoId: nuevoAsiento.id,
      mensaje: "Asiento contable recibido y procesado por el diario general.",
    }, { status: 201 })

  } catch (error) {
    console.error("Error en Web Service de Contabilidad:", error)
    return NextResponse.json(
      { error: "Error interno del servidor al procesar el asiento contable." },
      { status: 500 }
    )
  }
}
