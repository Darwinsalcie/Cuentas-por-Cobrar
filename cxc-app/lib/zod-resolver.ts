/**
 * Custom Zod v4 resolver para react-hook-form.
 *
 * @hookform/resolvers v5 tiene incompatibilidad de tipos con Zod v4.4+
 * (chequea `_zod.version.minor === 0`). Este resolver llama a safeParse
 * directamente, evitando el conflicto de tipos sin perder funcionalidad.
 */
import type { Resolver, FieldValues } from "react-hook-form"
import type { ZodType } from "zod"

export function zodResolver<TFieldValues extends FieldValues>(
  schema: ZodType<TFieldValues>
): Resolver<TFieldValues> {
  return async (values) => {
    const result = schema.safeParse(values)
    if (result.success) {
      return { values: result.data as TFieldValues, errors: {} } as any
    }

    const errors: Record<string, { type: string; message: string }> = {}
    for (const issue of result.error.issues) {
      const path = (issue.path as (string | number)[]).join(".")
      if (path && !errors[path]) {
        errors[path] = { type: issue.code, message: issue.message }
      }
    }
    return { values: {}, errors } as any
  }
}
