"use client"

import { useState } from "react"
import { Search, Info, Award, AlertCircle, RefreshCw } from "lucide-react"
import { toast } from "sonner"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { updateEstadoAsiento } from "../actions"

interface Cliente {
  id: string
  nombre: string
  cedula: string
}

interface AsientoContable {
  id: string
  descripcion: string
  cuenta: string
  tipoMovimiento: string
  fechaAsiento: Date
  montoAsiento: number
  estado: string
  cliente: Cliente
}

interface AsientoTableProps {
  initialData: AsientoContable[]
}

export function AsientoTable({ initialData }: AsientoTableProps) {
  const [data, setData] = useState<AsientoContable[]>(initialData)
  const [searchTerm, setSearchTerm] = useState("")
  const [estadoActualizando, setEstadoActualizando] = useState<Record<string, boolean>>({})

  const refreshData = async () => {
    const { getAsientosContables } = await import("../actions")
    const list = await getAsientosContables()
    setData(list)
  }

  // Filtrar
  const filteredData = data.filter((item) =>
    item.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.cliente.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.cuenta.includes(searchTerm)
  )

  const handleEstadoChange = async (asientoId: string, nuevoEstado: string) => {
    setEstadoActualizando((prev) => ({ ...prev, [asientoId]: true }))
    try {
      const res = await updateEstadoAsiento(asientoId, nuevoEstado)
      if (res.success) {
        toast.success("Estado del asiento actualizado")
        await refreshData()
      } else {
        toast.error(res.error || "No se pudo actualizar el estado.")
      }
    } catch (err) {
      toast.error("Error al actualizar el estado contable.")
    } finally {
      setEstadoActualizando((prev) => ({ ...prev, [asientoId]: false }))
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-DO", {
      style: "currency",
      currency: "DOP",
    }).format(value)
  }

  const formatDate = (dateInput: Date | string) => {
    const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput
    return new Intl.DateTimeFormat("es-DO", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      timeZone: "UTC",
    }).format(date)
  }

  const getBadgeVariant = (estado: string) => {
    switch (estado) {
      case "REGISTRADO":
        return "default"
      case "PENDIENTE":
        return "secondary"
      case "ERROR":
        return "destructive"
      default:
        return "outline"
    }
  }

  const getBadgeStyles = (estado: string) => {
    switch (estado) {
      case "REGISTRADO":
        return "bg-emerald-50 text-emerald-700 hover:bg-emerald-50/80 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50"
      case "PENDIENTE":
        return "bg-amber-50 text-amber-700 hover:bg-amber-50/80 dark:bg-amber-950/30 dark:text-amber-400 border border-amber-200 dark:border-amber-900/50"
      case "ERROR":
        return "bg-red-50 text-red-700 hover:bg-red-50/80 dark:bg-red-950/30 dark:text-red-400 border border-red-200 dark:border-red-900/50"
      default:
        return ""
    }
  }

  return (
    <div className="space-y-4">
      {/* Barra de herramientas */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 dark:text-slate-500" />
          <Input
            placeholder="Buscar por descripción, cliente o cuenta..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Tabla */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Descripción / Referencia</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Cuenta</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Fecha Asiento</TableHead>
              <TableHead className="text-right">Monto</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="w-[160px] text-right">Auditoría (Estado)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length > 0 ? (
              filteredData.map((item) => {
                const cargando = estadoActualizando[item.id]
                return (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium text-slate-900 dark:text-white max-w-xs truncate">
                      {item.descripcion}
                    </TableCell>
                    <TableCell className="text-xs text-slate-600 dark:text-slate-400">
                      {item.cliente.nombre}
                    </TableCell>
                    <TableCell className="font-mono text-xs">{item.cuenta}</TableCell>
                    <TableCell>
                      <Badge
                        variant={item.tipoMovimiento === "DB" ? "destructive" : "default"}
                        className={
                          item.tipoMovimiento === "DB"
                            ? "bg-blue-50 text-blue-700 hover:bg-blue-50/80 dark:bg-blue-950/30 dark:text-blue-400 border border-blue-200 dark:border-blue-900/50"
                            : "bg-emerald-50 text-emerald-700 hover:bg-emerald-50/80 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50"
                        }
                      >
                        {item.tipoMovimiento === "DB" ? "DB" : "CR"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs">{formatDate(item.fechaAsiento)}</TableCell>
                    <TableCell className="text-right font-mono text-xs font-semibold">
                      {formatCurrency(item.montoAsiento)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={getBadgeVariant(item.estado)}
                        className={getBadgeStyles(item.estado)}
                      >
                        {item.estado}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Select
                        defaultValue={item.estado}
                        onValueChange={(val) => { if (val) handleEstadoChange(item.id, val) }}
                        disabled={cargando}
                      >
                        <SelectTrigger className="h-8 text-xs">
                          {cargando ? (
                            <RefreshCw className="h-3 w-3 animate-spin mr-1" />
                          ) : null}
                          <SelectValue placeholder="Estado" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="REGISTRADO">Registrado</SelectItem>
                          <SelectItem value="PENDIENTE">Pendiente</SelectItem>
                          <SelectItem value="ERROR">Error</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                )
              })
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="h-32 text-center text-slate-500 dark:text-slate-400">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Info className="h-8 w-8 text-slate-400" />
                    <span>No se encontraron asientos contables.</span>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
