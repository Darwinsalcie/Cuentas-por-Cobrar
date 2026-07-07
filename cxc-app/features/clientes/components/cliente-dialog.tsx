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
import { createCliente, updateCliente } from "../actions"
import { clienteSchema, type ClienteInput } from "../schema"

interface ClienteDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  cliente?: {
    id: string
    nombre: string
    cedula: string
    limiteCredito: number
    estado: string
  } | null
  onSuccess: () => void
}

export function ClienteDialog({
  isOpen,
  onOpenChange,
  cliente,
  onSuccess,
}: ClienteDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isEdit = !!cliente

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ClienteInput>({
    resolver: zodResolver(clienteSchema),
    defaultValues: {
      nombre: "",
      cedula: "",
      limiteCredito: 0,
      estado: "ACTIVO",
    },
  })

  // Sincronizar datos si estamos editando
  useEffect(() => {
    if (cliente) {
      reset({
        nombre: cliente.nombre,
        cedula: cliente.cedula,
        limiteCredito: cliente.limiteCredito,
        estado: cliente.estado as "ACTIVO" | "INACTIVO",
      })
    } else {
      reset({
        nombre: "",
        cedula: "",
        limiteCredito: 0,
        estado: "ACTIVO",
      })
    }
  }, [cliente, reset, isOpen])

  const estadoValue = watch("estado")

  const onSubmit = async (data: ClienteInput) => {
    setIsSubmitting(true)
    try {
      let res
      if (isEdit && cliente) {
        res = await updateCliente(cliente.id, data)
      } else {
        res = await createCliente(data)
      }

      if (res.success) {
        toast.success(
          isEdit ? "Cliente actualizado correctamente" : "Cliente creado correctamente"
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
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar Cliente" : "Nuevo Cliente"}</DialogTitle>
          <DialogDescription>
            Ingrese los datos del cliente. Todos los campos son requeridos.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          {/* Nombre */}
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre Completo</Label>
            <Input
              id="nombre"
              placeholder="Ej. Juan Pérez Ortega"
              {...register("nombre")}
              disabled={isSubmitting}
            />
            {errors.nombre && (
              <p className="text-xs text-red-500">{errors.nombre.message}</p>
            )}
          </div>

          {/* Cédula */}
          <div className="space-y-2">
            <Label htmlFor="cedula">Cédula</Label>
            <Input
              id="cedula"
              placeholder="Ej. 001-0000000-0"
              {...register("cedula")}
              disabled={isSubmitting}
            />
            {errors.cedula && (
              <p className="text-xs text-red-500">{errors.cedula.message}</p>
            )}
          </div>

          {/* Límite de Crédito */}
          <div className="space-y-2">
            <Label htmlFor="limiteCredito">Límite de Crédito (RD$)</Label>
            <Input
              id="limiteCredito"
              type="number"
              step="0.01"
              placeholder="0.00"
              {...register("limiteCredito", { valueAsNumber: true })}
              disabled={isSubmitting}
            />
            {errors.limiteCredito && (
              <p className="text-xs text-red-500">{errors.limiteCredito.message}</p>
            )}
          </div>

          {/* Estado */}
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
              {isEdit ? "Guardar Cambios" : "Crear Cliente"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
