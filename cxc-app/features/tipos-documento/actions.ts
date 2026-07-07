"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { tipoDocumentoSchema, type TipoDocumentoInput } from "./schema"

export async function getTiposDocumento() {
  try {
    return await prisma.tipoDocumento.findMany({
      orderBy: {
        createdAt: "desc",
      },
    })
  } catch (error) {
    console.error("Error al obtener tipos de documento:", error)
    throw new Error("No se pudieron cargar los tipos de documento.")
  }
}

export async function createTipoDocumento(data: TipoDocumentoInput) {
  try {
    const validated = tipoDocumentoSchema.parse(data)
    const nuevo = await prisma.tipoDocumento.create({
      data: validated,
    })
    revalidatePath("/tipos-documento")
    return { success: true, data: nuevo }
  } catch (error) {
    console.error("Error al crear tipo de documento:", error)
    return { success: false, error: "Error al guardar el tipo de documento." }
  }
}

export async function updateTipoDocumento(id: string, data: TipoDocumentoInput) {
  try {
    const validated = tipoDocumentoSchema.parse(data)
    const actualizado = await prisma.tipoDocumento.update({
      where: { id },
      data: validated,
    })
    revalidatePath("/tipos-documento")
    return { success: true, data: actualizado }
  } catch (error) {
    console.error("Error al actualizar tipo de documento:", error)
    return { success: false, error: "Error al actualizar el tipo de documento." }
  }
}

export async function deleteTipoDocumento(id: string) {
  try {
    // Verificar si tiene transacciones vinculadas
    const count = await prisma.transaccion.count({
      where: { tipoDocumentoId: id },
    })

    if (count > 0) {
      return {
        success: false,
        error: "No se puede eliminar el tipo de documento porque tiene transacciones asociadas.",
      }
    }

    await prisma.tipoDocumento.delete({
      where: { id },
    })
    revalidatePath("/tipos-documento")
    return { success: true }
  } catch (error) {
    console.error("Error al eliminar tipo de documento:", error)
    return { success: false, error: "Error al eliminar el tipo de documento." }
  }
}
