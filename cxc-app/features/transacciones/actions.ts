"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { transaccionSchema, type TransaccionInput } from "./schema"
import { headers } from "next/headers"

export async function getTransacciones() {
  try {
    const transacciones = await prisma.transaccion.findMany({
      orderBy: {
        fecha: "desc",
      },
      include: {
        cliente: true,
        tipoDocumento: true,
      },
    })

    // Buscar si ya hay asientos contables generados para el cliente con la misma fecha y monto aproximado
    // O si queremos vincularlos directamente, podemos revisar los asientos existentes.
    // Como el esquema no tiene un FK directo de AsientoContable -> Transaccion, podemos cruzar por
    // clienteId, monto y tipo de movimiento, o simplemente listar los asientos por su descripción que contiene
    // el número de documento de la transacción.
    // Vamos a buscar los asientos contables en la BD para ver si esta transacción ya fue registrada
    const asientos = await prisma.asientoContable.findMany({
      select: {
        descripcion: true,
        clienteId: true,
        montoAsiento: true,
      }
    })

    return transacciones.map((trans) => {
      // Un asiento se considera generado para esta transacción si su descripción contiene el número de documento
      const yaTieneAsiento = asientos.some(
        (asiento) =>
          asiento.clienteId === trans.clienteId &&
          asiento.montoAsiento === trans.monto &&
          asiento.descripcion.includes(trans.numeroDocumento)
      )

      return {
        ...trans,
        asientoGenerado: yaTieneAsiento,
      }
    })
  } catch (error) {
    console.error("Error al obtener transacciones:", error)
    throw new Error("No se pudieron cargar las transacciones.")
  }
}

export async function createTransaccion(data: TransaccionInput) {
  try {
    const validated = transaccionSchema.parse(data)

    // 1. Validar estado del cliente
    const cliente = await prisma.cliente.findUnique({
      where: { id: validated.clienteId },
    })
    if (!cliente) {
      return { success: false, error: "El cliente seleccionado no existe." }
    }
    if (cliente.estado === "INACTIVO") {
      return { success: false, error: "No se pueden registrar transacciones para un cliente INACTIVO." }
    }

    // 2. Validar estado del tipo de documento
    const tipoDoc = await prisma.tipoDocumento.findUnique({
      where: { id: validated.tipoDocumentoId },
    })
    if (!tipoDoc) {
      return { success: false, error: "El tipo de documento seleccionado no existe." }
    }
    if (tipoDoc.estado === "INACTIVO") {
      return { success: false, error: "No se pueden registrar transacciones con un tipo de documento INACTIVO." }
    }

    // 3. Crear la transacción
    const nueva = await prisma.transaccion.create({
      data: {
        ...validated,
        fecha: new Date(validated.fecha),
      },
    })

    revalidatePath("/transacciones")
    revalidatePath("/clientes")
    return { success: true, data: nueva }
  } catch (error) {
    console.error("Error al crear transacción:", error)
    return { success: false, error: "Error al registrar la transacción." }
  }
}

export async function deleteTransaccion(id: string) {
  try {
    // Buscar la transacción
    const trans = await prisma.transaccion.findUnique({
      where: { id },
    })
    if (!trans) {
      return { success: false, error: "La transacción no existe." }
    }

    // Verificar si ya tiene un asiento contable generado
    // Para evitar inconsistencias contables si ya se envió a Contabilidad
    const countAsientos = await prisma.asientoContable.count({
      where: {
        clienteId: trans.clienteId,
        montoAsiento: trans.monto,
        descripcion: {
          contains: trans.numeroDocumento,
        },
      },
    })

    if (countAsientos > 0) {
      return {
        success: false,
        error: "No se puede eliminar la transacción porque ya tiene un asiento contable registrado en Contabilidad.",
      }
    }

    await prisma.transaccion.delete({
      where: { id },
    })

    revalidatePath("/transacciones")
    revalidatePath("/clientes")
    return { success: true }
  } catch (error) {
    console.error("Error al eliminar transacción:", error)
    return { success: false, error: "Error al eliminar la transacción." }
  }
}

export async function enviarAContabilidad(transaccionId: string) {
  try {
    // 1. Buscar los detalles de la transacción
    const trans = await prisma.transaccion.findUnique({
      where: { id: transaccionId },
      include: {
        cliente: true,
        tipoDocumento: true,
      },
    })

    if (!trans) {
      return { success: false, error: "La transacción no existe." }
    }

    // 2. Construir la URL del Web Service de Contabilidad utilizando el host del request actual
    const headersList = await headers()
    const host = headersList.get("host") || "localhost:3000"
    const protocol = host.includes("localhost") ? "http" : "https"
    const apiUrl = `${protocol}://${host}/api/contabilidad/asientos`

    // 3. Preparar los datos del asiento contable
    const datosAsiento = {
      descripcion: `CxC - Transacción ${trans.tipoDocumento.descripcion} Nro: ${trans.numeroDocumento}`,
      cuenta: trans.tipoDocumento.cuentaContable,
      tipoMovimiento: trans.tipoMovimiento,
      fechaAsiento: trans.fecha.toISOString(),
      montoAsiento: trans.monto,
      clienteId: trans.clienteId,
    }

    // 4. Llamar al Web Service de Contabilidad simulado
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(datosAsiento),
      cache: "no-store",
    })

    const result = await response.json()

    if (!response.ok) {
      return {
        success: false,
        error: result.error || "El Web Service de Contabilidad rechazó el asiento.",
      }
    }

    revalidatePath("/transacciones")
    revalidatePath("/asientos")

    return {
      success: true,
      referencia: result.referencia,
      mensaje: result.mensaje,
    }

  } catch (error) {
    console.error("Error al enviar a contabilidad:", error)
    return {
      success: false,
      error: "No se pudo establecer conexión con el Web Service de Contabilidad.",
    }
  }
}
