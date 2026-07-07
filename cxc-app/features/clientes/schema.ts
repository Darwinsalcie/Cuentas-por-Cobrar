import { z } from "zod"
import { validarDocumentoIdentidad } from "@/lib/validador-do"

export const clienteSchema = z.object({
  nombre: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  cedula: z.string().refine((val) => validarDocumentoIdentidad(val), {
    message: "Identificación inválida. Debe ser una Cédula (11 dígitos) o RNC (9 dígitos) dominicano válido.",
  }),
  limiteCredito: z.number().min(0, "El límite de crédito debe ser un valor positivo o cero"),
  estado: z.enum(["ACTIVO", "INACTIVO"]),
})

export type ClienteInput = z.infer<typeof clienteSchema>
