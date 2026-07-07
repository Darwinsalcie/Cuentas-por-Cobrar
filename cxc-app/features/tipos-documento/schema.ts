import { z } from "zod"

export const tipoDocumentoSchema = z.object({
  descripcion: z.string().min(3, "La descripción debe tener al menos 3 caracteres"),
  cuentaContable: z.string().min(4, "La cuenta contable debe tener al menos 4 caracteres"),
  estado: z.enum(["ACTIVO", "INACTIVO"]),
})

export type TipoDocumentoInput = z.infer<typeof tipoDocumentoSchema>
