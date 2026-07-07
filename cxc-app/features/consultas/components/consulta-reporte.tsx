"use client"

import { useState } from "react"
import { Search, Download, Info, RefreshCw, X, Calendar as CalendarIcon } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { formatearCedula } from "@/lib/utils"

interface Cliente {
  id: string
  nombre: string
  cedula: string
}

interface TipoDocumento {
  id: string
  descripcion: string
}

interface Transaccion {
  id: string
  tipoMovimiento: string
  numeroDocumento: string
  fecha: Date
  monto: number
  tipoDocumento: TipoDocumento
  cliente: Cliente
}

interface ConsultaReporteProps {
  transacciones: Transaccion[]
  clientes: Cliente[]
  tiposDocumento: TipoDocumento[]
}

export function ConsultaReporte({
  transacciones,
  clientes,
  tiposDocumento,
}: ConsultaReporteProps) {
  // Filtros
  const [clienteId, setClienteId] = useState<string>("ALL")
  const [tipoDocumentoId, setTipoDocumentoId] = useState<string>("ALL")
  const [tipoMovimiento, setTipoMovimiento] = useState<string>("ALL")
  const [fechaInicio, setFechaInicio] = useState<string>("")
  const [fechaFin, setFechaFin] = useState<string>("")

  // Limpiar filtros
  const handleClearFilters = () => {
    setClienteId("ALL")
    setTipoDocumentoId("ALL")
    setTipoMovimiento("ALL")
    setFechaInicio("")
    setFechaFin("")
    toast.info("Filtros restablecidos")
  }

  // Filtrado de transacciones
  const filteredTransacciones = transacciones.filter((t) => {
    // Filtro Cliente
    if (clienteId !== "ALL" && t.cliente.id !== clienteId) return false
    
    // Filtro Tipo Documento
    if (tipoDocumentoId !== "ALL" && t.tipoDocumento.id !== tipoDocumentoId) return false
    
    // Filtro Tipo Movimiento
    if (tipoMovimiento !== "ALL" && t.tipoMovimiento !== tipoMovimiento) return false

    // Filtro Fechas
    const fechaTrans = new Date(t.fecha)
    // Poner horas a cero para comparación limpia de solo fecha
    fechaTrans.setHours(0, 0, 0, 0)

    if (fechaInicio) {
      const inicio = new Date(fechaInicio)
      inicio.setHours(0, 0, 0, 0)
      if (fechaTrans < inicio) return false
    }

    if (fechaFin) {
      const fin = new Date(fechaFin)
      fin.setHours(23, 59, 59, 999)
      if (fechaTrans > fin) return false
    }

    return true
  })

  // Exportar a CSV
  const handleExportCSV = () => {
    if (filteredTransacciones.length === 0) {
      toast.warning("No hay datos para exportar")
      return
    }

    try {
      // Cabeceras
      const headers = ["Fecha", "Cliente", "Cedula", "Tipo Documento", "Numero Documento", "Tipo Movimiento", "Monto"]
      
      // Filas
      const rows = filteredTransacciones.map((t) => {
        const fecha = new Date(t.fecha).toISOString().split("T")[0]
        const cliente = `"${t.cliente.nombre.replace(/"/g, '""')}"`
        const cedula = `'${t.cliente.cedula}` // Prefijo de comilla simple para evitar pérdida de ceros a la izquierda en Excel
        const tipoDoc = `"${t.tipoDocumento.descripcion.replace(/"/g, '""')}"`
        const nroDoc = `"${t.numeroDocumento.replace(/"/g, '""')}"`
        const movimiento = t.tipoMovimiento
        const monto = t.monto

        return [fecha, cliente, cedula, tipoDoc, nroDoc, movimiento, monto]
      })

      // Unir todo en formato CSV
      const csvContent = [
        headers.join(","),
        ...rows.map((e) => e.join(",")),
      ].join("\n")

      // Crear archivo para descarga
      // Usar codificación UTF-8 con BOM para que Excel muestre correctamente tildes y caracteres especiales
      const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.setAttribute("href", url)
      
      const nombreArchivo = `reporte_cxc_${new Date().toISOString().split("T")[0]}.csv`
      link.setAttribute("download", nombreArchivo)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      toast.success("Reporte CSV exportado correctamente")
    } catch (err) {
      console.error(err)
      toast.error("Ocurrió un error al exportar el reporte")
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

  return (
    <div className="space-y-6">
      {/* Contenedor de Filtros */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">
          Filtros de Búsqueda
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
          {/* Filtro Cliente */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-500">Cliente</label>
            <Select value={clienteId} onValueChange={(val) => setClienteId(val ?? "ALL")}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos los Clientes</SelectItem>
                {clientes.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Filtro Tipo Documento */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-500">Tipo de Documento</label>
            <Select value={tipoDocumentoId} onValueChange={(val) => setTipoDocumentoId(val ?? "ALL")}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos los Tipos</SelectItem>
                {tiposDocumento.map((td) => (
                  <SelectItem key={td.id} value={td.id}>
                    {td.descripcion}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Filtro Movimiento */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-500">Movimiento</label>
            <Select value={tipoMovimiento} onValueChange={(val) => setTipoMovimiento(val ?? "ALL")}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos (DB / CR)</SelectItem>
                <SelectItem value="DB">Débito (DB)</SelectItem>
                <SelectItem value="CR">Crédito (CR)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Fecha Inicio */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-500">Fecha Inicio</label>
            <Input
              type="date"
              className="h-9"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
            />
          </div>

          {/* Fecha Fin */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-500">Fecha Fin</label>
            <Input
              type="date"
              className="h-9"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
            />
          </div>
        </div>

        {/* Botones de Control de Filtros */}
        <div className="flex justify-end gap-3 mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearFilters}
            className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
          >
            <X className="h-3.5 w-3.5" />
            Limpiar Filtros
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 text-xs"
          >
            <Download className="h-3.5 w-3.5" />
            Exportar CSV
          </Button>
        </div>
      </div>

      {/* Resultados de la Consulta */}
      <div className="space-y-3">
        <div className="flex justify-between items-center px-1">
          <h3 className="text-sm font-semibold text-slate-500">
            Resultados ({filteredTransacciones.length})
          </h3>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Cédula</TableHead>
                <TableHead>Documento</TableHead>
                <TableHead>Número</TableHead>
                <TableHead>Movimiento</TableHead>
                <TableHead className="text-right">Monto</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransacciones.length > 0 ? (
                filteredTransacciones.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="text-xs">{formatDate(t.fecha)}</TableCell>
                    <TableCell className="font-medium text-slate-900 dark:text-white">
                      {t.cliente.nombre}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {formatearCedula(t.cliente.cedula)}
                    </TableCell>
                    <TableCell className="text-xs text-slate-600 dark:text-slate-400">
                      {t.tipoDocumento.descripcion}
                    </TableCell>
                    <TableCell className="font-mono text-xs">{t.numeroDocumento}</TableCell>
                    <TableCell>
                      <Badge
                        variant={t.tipoMovimiento === "DB" ? "destructive" : "default"}
                        className={
                          t.tipoMovimiento === "DB"
                            ? "bg-blue-50 text-blue-700 hover:bg-blue-50/80 dark:bg-blue-950/30 dark:text-blue-400 border border-blue-200 dark:border-blue-900/50"
                            : "bg-emerald-50 text-emerald-700 hover:bg-emerald-50/80 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50"
                        }
                      >
                        {t.tipoMovimiento === "DB" ? "DB (Débito)" : "CR (Crédito)"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs font-semibold">
                      {formatCurrency(t.monto)}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center text-slate-500 dark:text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Info className="h-8 w-8 text-slate-400" />
                      <span>No se encontraron transacciones para los filtros seleccionados.</span>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
