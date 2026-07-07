"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { clienteSchema, type ClienteInput } from "./schema"

// Limpia los guiones de la cédula para guardarla limpia en BD
function normalizarCedula(cedula: string) {
  return cedula.replace(/-/g, "")
}



export async function getClientes() {
  try {
    const clientes = await prisma.cliente.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        transacciones: {
          select: {
            tipoMovimiento: true,
            monto: true,
          },
        },
      },
    })

    // Calcular saldo actual para cada cliente
    // Saldo = Débitos (DB) - Créditos (CR)
    return clientes.map((cliente) => {
      const saldo = cliente.transacciones.reduce((acc, trans) => {
        if (trans.tipoMovimiento === "DB") {
          return acc + trans.monto
        } else if (trans.tipoMovimiento === "CR") {
          return acc - trans.monto
        }
        return acc
      }, 0)

      return {
        ...cliente,
        saldo,
        limiteDisponible: cliente.limiteCredito - saldo,
      }
    })
  } catch (error) {
    console.error("Error al obtener clientes:", error)
    throw new Error("No se pudieron cargar los clientes.")
  }
}

export async function createCliente(data: ClienteInput) {
  try {
    const validated = clienteSchema.parse(data)
    validated.cedula = normalizarCedula(validated.cedula)

    // Verificar si la cédula ya existe
    const existe = await prisma.cliente.findUnique({
      where: { cedula: validated.cedula },
    })
    if (existe) {
      return { success: false, error: "Ya existe un cliente registrado con esta cédula." }
    }

    const nuevo = await prisma.cliente.create({
      data: validated,
    })
    revalidatePath("/clientes")
    return { success: true, data: nuevo }
  } catch (error) {
    console.error("Error al crear cliente:", error)
    return { success: false, error: "Error al guardar el cliente." }
  }
}

export async function updateCliente(id: string, data: ClienteInput) {
  try {
    const validated = clienteSchema.parse(data)
    validated.cedula = normalizarCedula(validated.cedula)

    // Verificar si la cédula pertenece a otro cliente
    const existe = await prisma.cliente.findFirst({
      where: {
        cedula: validated.cedula,
        NOT: { id },
      },
    })
    if (existe) {
      return { success: false, error: "La cédula ya está registrada por otro cliente." }
    }

    const actualizado = await prisma.cliente.update({
      where: { id },
      data: validated,
    })
    revalidatePath("/clientes")
    return { success: true, data: actualizado }
  } catch (error) {
    console.error("Error al actualizar cliente:", error)
    return { success: false, error: "Error al actualizar el cliente." }
  }
}

export async function deleteCliente(id: string) {
  try {
    // Verificar si tiene transacciones vinculadas o asientos contables vinculados
    const countTransacciones = await prisma.transaccion.count({
      where: { clienteId: id },
    })
    const countAsientos = await prisma.asientoContable.count({
      where: { clienteId: id },
    })

    if (countTransacciones > 0 || countAsientos > 0) {
      return {
        success: false,
        error: "No se puede eliminar el cliente porque tiene transacciones o asientos asociados en el sistema.",
      }
    }

    await prisma.cliente.delete({
      where: { id },
    })
    revalidatePath("/clientes")
    return { success: true }
  } catch (error) {
    console.error("Error al eliminar cliente:", error)
    return { success: false, error: "Error al eliminar el cliente." }
  }
}
