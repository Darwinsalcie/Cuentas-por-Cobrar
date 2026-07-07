"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@/lib/zod-resolver"
import { toast } from "sonner"
import { Loader2, AlertTriangle } from "lucide-react"

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
import { createTransaccion } from "../actions"
import { transaccionSchema, type TransaccionInput } from "../schema"

interface ClienteSimplificado {
  id: string
  nombre: string
  cedula: string
  limiteCredito: number
  saldo: number
  limiteDisponible: number
}

interface TipoDocumentoSimplificado {
  id: string
  descripcion: string
  cuentaContable: string
}

interface TransaccionDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  clientes: ClienteSimplificado[]
  tiposDocumento: TipoDocumentoSimplificado[]
  onSuccess: () => void
}

export function TransaccionDialog({
  isOpen,
  onOpenChange,
  clientes,
  tiposDocumento,
  onSuccess,
}: TransaccionDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<TransaccionInput>({
    resolver: zodResolver(transaccionSchema),
    defaultValues: {
      tipoMovimiento: "DB",
      tipoDocumentoId: "",
      numeroDocumento: "",
      fecha: new Date().toISOString().split("T")[0], // Fecha actual en formato YYYY-MM-DD
      clienteId: "",
      monto: 0,
    },
  })

  // Sincronizar reinicio cuando abre el modal
  useEffect(() => {
    if (isOpen) {
      reset({
        tipoMovimiento: "DB",
        tipoDocumentoId: "",
        numeroDocumento: "",
        fecha: new Date().toISOString().split("T")[0],
        clienteId: "",
        monto: 0,
      })
    }
  }, [isOpen, reset])

  // Suscribirse a cambios en los inputs para validar el límite de crédito en tiempo real
  const clienteIdSelected = watch("clienteId")
  const tipoMovimientoSelected = watch("tipoMovimiento")
  const montoSelected = watch("monto")

  const selectedCliente = clientes.find((c) => c.id === clienteIdSelected)
  const isDebito = tipoMovimientoSelected === "DB"
  
  // Calcular si excede el límite
  const limiteDisponible = selectedCliente ? selectedCliente.limiteDisponible : 0
  const excedeLimite = isDebito && selectedCliente && Number(montoSelected) > limiteDisponible

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-DO", {
      style: "currency",
      currency: "DOP",
    }).format(value)
  }

  const onSubmit = async (data: TransaccionInput) => {
    setIsSubmitting(true)
    try {
      const res = await createTransaccion(data)
      if (res.success) {
        toast.success("Transacción registrada correctamente")
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
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Registrar Transacción</DialogTitle>
          <DialogDescription>
            Ingrese los detalles del movimiento de cuentas por cobrar.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          {/* Cliente */}
          <div className="space-y-2">
            <Label htmlFor="clienteId">Cliente</Label>
            <Select
              onValueChange={(val) => setValue("clienteId", (val as string) ?? "")}
              disabled={isSubmitting}
            >
              <SelectTrigger id="clienteId">
                <SelectValue placeholder="Seleccione un cliente activo" />
              </SelectTrigger>
              <SelectContent>
                {clientes.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.nombre} (Disp: {formatCurrency(c.limiteDisponible)})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.clienteId && (
              <p className="text-xs text-red-500">{errors.clienteId.message}</p>
            )}
          </div>

          {/* Fila: Tipo Documento y Número */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tipoDocumentoId">Tipo Documento</Label>
              <Select
                onValueChange={(val) => setValue("tipoDocumentoId", (val as string) ?? "")}
                disabled={isSubmitting}
              >
                <SelectTrigger id="tipoDocumentoId">
                  <SelectValue placeholder="Seleccione tipo" />
                </SelectTrigger>
                <SelectContent>
                  {tiposDocumento.map((td) => (
                    <SelectItem key={td.id} value={td.id}>
                      {td.descripcion}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.tipoDocumentoId && (
                <p className="text-xs text-red-500">{errors.tipoDocumentoId.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="numeroDocumento">Número Documento</Label>
              <Input
                id="numeroDocumento"
                placeholder="Ej. F-0001"
                {...register("numeroDocumento")}
                disabled={isSubmitting}
              />
              {errors.numeroDocumento && (
                <p className="text-xs text-red-500">{errors.numeroDocumento.message}</p>
              )}
            </div>
          </div>

          {/* Fila: Tipo Movimiento y Fecha */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tipoMovimiento">Movimiento</Label>
              <Select
                value={tipoMovimientoSelected}
                onValueChange={(val) => setValue("tipoMovimiento", ((val as string) ?? "DB") as "DB" | "CR")}
                disabled={isSubmitting}
              >
                <SelectTrigger id="tipoMovimiento">
                  <SelectValue placeholder="Seleccione movimiento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DB">Débito (DB)</SelectItem>
                  <SelectItem value="CR">Crédito (CR)</SelectItem>
                </SelectContent>
              </Select>
              {errors.tipoMovimiento && (
                <p className="text-xs text-red-500">{errors.tipoMovimiento.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="fecha">Fecha</Label>
              <Input
                id="fecha"
                type="date"
                {...register("fecha")}
                disabled={isSubmitting}
              />
              {errors.fecha && (
                <p className="text-xs text-red-500">{errors.fecha.message}</p>
              )}
            </div>
          </div>

          {/* Monto */}
          <div className="space-y-2">
            <Label htmlFor="monto">Monto (RD$)</Label>
            <Input
              id="monto"
              type="number"
              step="0.01"
              placeholder="0.00"
              {...register("monto", { valueAsNumber: true })}
              disabled={isSubmitting}
            />
            {errors.monto && (
              <p className="text-xs text-red-500">{errors.monto.message}</p>
            )}
          </div>

          {/* Advertencia Visual del Límite de Crédito */}
          {excedeLimite && (
            <div className="flex gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 dark:border-amber-900/30 dark:bg-amber-950/20 dark:text-amber-400">
              <AlertTriangle className="h-5 w-5 flex-shrink-0 text-amber-600 dark:text-amber-500" />
              <div>
                <span className="font-semibold">Advertencia de Límite de Crédito:</span> El monto de la transacción ({formatCurrency(Number(montoSelected))}) supera el límite de crédito disponible del cliente ({formatCurrency(limiteDisponible)}). El sistema permite registrar la transacción, pero se mantendrá esta alerta en el estado del cliente.
              </div>
            </div>
          )}

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
              Registrar Movimiento
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
