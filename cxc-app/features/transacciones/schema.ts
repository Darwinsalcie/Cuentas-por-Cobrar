import { z } from "zod"

export const transaccionSchema = z.object({
  tipoMovimiento: z.enum(["DB", "CR"]),
  tipoDocumentoId: z.string().min(1, "Debe seleccionar un tipo de documento"),
  numeroDocumento: z.string().min(1, "El número de documento es obligatorio"),
  fecha: z.string().min(1, "La fecha es requerida"),
  clienteId: z.string().min(1, "Debe seleccionar un cliente"),
  monto: z.number().min(0.01, "El monto debe ser mayor que cero"),
})

export type TransaccionInput = z.infer<typeof transaccionSchema>
