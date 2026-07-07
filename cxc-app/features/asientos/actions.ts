"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function getAsientosContables() {
  try {
    return await prisma.asientoContable.findMany({
      orderBy: {
        fechaAsiento: "desc",
      },
      include: {
        cliente: true,
      },
    })
  } catch (error) {
    console.error("Error al obtener asientos contables:", error)
    throw new Error("No se pudieron cargar los asientos contables.")
  }
}

export async function updateEstadoAsiento(id: string, estado: string) {
  try {
    const actualizado = await prisma.asientoContable.update({
      where: { id },
      data: { estado },
    })

    revalidatePath("/asientos")
    revalidatePath("/transacciones")
    return { success: true, data: actualizado }
  } catch (error) {
    console.error("Error al actualizar estado del asiento:", error)
    return { success: false, error: "No se pudo actualizar el estado del asiento contable." }
  }
}
