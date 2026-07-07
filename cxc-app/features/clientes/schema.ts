import { z } from "zod"

// Validación básica de cédula dominicana (11 dígitos, con o sin guiones)
export const cedulaRegex = /^\d{3}-?\d{7}-?\d{1}$/

export const clienteSchema = z.object({
  nombre: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  cedula: z.string().refine((val) => cedulaRegex.test(val), {
    message: "Formato de cédula inválido. Debe contener 11 dígitos (ej: 001-0000000-0 o 00100000000)",
  }),
  limiteCredito: z.number().min(0, "El límite de crédito debe ser un valor positivo o cero"),
  estado: z.enum(["ACTIVO", "INACTIVO"]),
})

export type ClienteInput = z.infer<typeof clienteSchema>
