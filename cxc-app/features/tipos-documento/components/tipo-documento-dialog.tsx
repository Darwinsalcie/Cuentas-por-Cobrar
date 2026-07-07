"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@/lib/zod-resolver"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createTipoDocumento, updateTipoDocumento } from "../actions"
import { tipoDocumentoSchema, type TipoDocumentoInput } from "../schema"

interface TipoDocumentoDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  tipoDocumento?: {
    id: string
    descripcion: string
    cuentaContable: string
    estado: string
  } | null
  onSuccess: () => void
}

export function TipoDocumentoDialog({
  isOpen,
  onOpenChange,
  tipoDocumento,
  onSuccess,
}: TipoDocumentoDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isEdit = !!tipoDocumento

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<TipoDocumentoInput>({
    resolver: zodResolver(tipoDocumentoSchema),
    defaultValues: {
      descripcion: "",
      cuentaContable: "",
      estado: "ACTIVO",
    },
  })

  // Sincronizar estado si estamos editando
  useEffect(() => {
    if (tipoDocumento) {
      reset({
        descripcion: tipoDocumento.descripcion,
        cuentaContable: tipoDocumento.cuentaContable,
        estado: tipoDocumento.estado as "ACTIVO" | "INACTIVO",
      })
    } else {
      reset({
        descripcion: "",
        cuentaContable: "",
        estado: "ACTIVO",
      })
    }
  }, [tipoDocumento, reset, isOpen])

  const estadoValue = watch("estado")

  const onSubmit = async (data: TipoDocumentoInput) => {
    setIsSubmitting(true)
    try {
      let res
      if (isEdit && tipoDocumento) {
        res = await updateTipoDocumento(tipoDocumento.id, data)
      } else {
        res = await createTipoDocumento(data)
      }

      if (res.success) {
        toast.success(
          isEdit
            ? "Tipo de documento actualizado correctamente"
            : "Tipo de documento creado correctamente"
        )
        onSuccess()
        onOpenChange(false)
      } else {
        toast.error(res.error || "Ocurrió un error inesperado")
      }
    } catch (err) {
      toast.error("Error al procesar la solicitud")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar Tipo de Documento" : "Nuevo Tipo de Documento"}</DialogTitle>
          <DialogDescription>
            Complete los detalles del tipo de documento. Presione guardar cuando termine.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="descripcion">Descripción</Label>
            <Input
              id="descripcion"
              placeholder="Ej. Factura de Crédito, Recibo de Pago"
              {...register("descripcion")}
              disabled={isSubmitting}
            />
            {errors.descripcion && (
              <p className="text-xs text-red-500">{errors.descripcion.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="cuentaContable">Cuenta Contable</Label>
            <Input
              id="cuentaContable"
              placeholder="Ej. 1101-01, 1105-02"
              {...register("cuentaContable")}
              disabled={isSubmitting}
            />
            {errors.cuentaContable && (
              <p className="text-xs text-red-500">{errors.cuentaContable.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="estado">Estado</Label>
            <Select
              value={estadoValue}
              onValueChange={(val) => setValue("estado", ((val as string) ?? "ACTIVO") as "ACTIVO" | "INACTIVO")}
              disabled={isSubmitting}
            >
              <SelectTrigger id="estado">
                <SelectValue placeholder="Seleccione un estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ACTIVO">Activo</SelectItem>
                <SelectItem value="INACTIVO">Inactivo</SelectItem>
              </SelectContent>
            </Select>
            {errors.estado && (
              <p className="text-xs text-red-500">{errors.estado.message}</p>
            )}
          </div>

          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEdit ? "Guardar Cambios" : "Crear"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
