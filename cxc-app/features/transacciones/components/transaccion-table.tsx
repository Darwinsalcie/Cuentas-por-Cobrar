"use client"

import { useState } from "react"
import { Search, Trash2, Plus, Info, CheckCircle, Clock, AlertTriangle, Send, Loader2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { TransaccionDialog } from "./transaccion-dialog"
import { deleteTransaccion, enviarAContabilidad } from "../actions"

interface ClienteBase {
  id: string
  nombre: string
  cedula: string
  limiteCredito: number
}

interface ClienteConSaldo extends ClienteBase {
  saldo: number
  limiteDisponible: number
}

interface TipoDocumento {
  id: string
  descripcion: string
  cuentaContable: string
}

interface Transaccion {
  id: string
  tipoMovimiento: string // "DB" o "CR"
  numeroDocumento: string
  fecha: Date
  monto: number
  tipoDocumento: TipoDocumento
  cliente: ClienteBase
  asientoGenerado: boolean
}

interface TransaccionTableProps {
  initialData: Transaccion[]
  clientesActivos: ClienteConSaldo[]
  tiposDocumentoActivos: TipoDocumento[]
}

export function TransaccionTable({
  initialData,
  clientesActivos,
  tiposDocumentoActivos,
}: TransaccionTableProps) {
  const [data, setData] = useState<Transaccion[]>(initialData)
  const [searchTerm, setSearchTerm] = useState("")

  // Formulario Dialog
  const [isFormOpen, setIsFormOpen] = useState(false)

  // Confirmar Eliminación
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<Transaccion | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Estado de procesamiento contable individual por fila
  const [procesandoContabilidad, setProcesandoContabilidad] = useState<Record<string, boolean>>({})

  const refreshData = async () => {
    const { getTransacciones } = await import("../actions")
    const list = await getTransacciones()
    setData(list)
  }

  // Filtrar transacciones por documento o nombre de cliente
  const filteredData = data.filter((item) =>
    item.numeroDocumento.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.cliente.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleDeleteClick = (item: Transaccion) => {
    setItemToDelete(item)
    setIsDeleteOpen(true)
  }

  const confirmDelete = async () => {
    if (!itemToDelete) return
    setIsDeleting(true)
    try {
      const res = await deleteTransaccion(itemToDelete.id)
      if (res.success) {
        toast.success("Transacción eliminada con éxito")
        await refreshData()
        setIsDeleteOpen(false)
        setItemToDelete(null)
      } else {
        toast.error(res.error || "No se pudo eliminar la transacción.")
      }
    } catch (err) {
      toast.error("Ocurrió un error al intentar eliminar.")
    } finally {
      setIsDeleting(false)
    }
  }

  const handleEnviarContabilidad = async (transId: string) => {
    setProcesandoContabilidad((prev) => ({ ...prev, [transId]: true }))
    try {
      const res = await enviarAContabilidad(transId)
      if (res.success) {
        toast.success(`Asiento contable registrado con referencia: ${res.referencia}`)
        await refreshData()
      } else {
        toast.error(res.error || "Fallo en el Web Service de Contabilidad")
      }
    } catch (error) {
      toast.error("Error al establecer comunicación con el sistema contable.")
    } finally {
      setProcesandoContabilidad((prev) => ({ ...prev, [transId]: false }))
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
    <div className="space-y-4">
      {/* Barra de herramientas */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 dark:text-slate-500" />
          <Input
            placeholder="Buscar por cliente o documento..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button onClick={() => setIsFormOpen(true)} className="flex gap-2 items-center">
          <Plus className="h-4 w-4" />
          Nueva Transacción
        </Button>
      </div>

      {/* Tabla */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cliente</TableHead>
              <TableHead>Documento</TableHead>
              <TableHead>Número</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Movimiento</TableHead>
              <TableHead className="text-right">Monto</TableHead>
              <TableHead>Estado Contable</TableHead>
              <TableHead className="w-[180px] text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length > 0 ? (
              filteredData.map((item) => {
                const procesando = procesandoContabilidad[item.id]
                return (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium text-slate-900 dark:text-white">
                      {item.cliente.nombre}
                    </TableCell>
                    <TableCell className="text-xs text-slate-600 dark:text-slate-400">
                      {item.tipoDocumento.descripcion}
                    </TableCell>
                    <TableCell className="font-mono text-xs">{item.numeroDocumento}</TableCell>
                    <TableCell className="text-xs">{formatDate(item.fecha)}</TableCell>
                    <TableCell>
                      <Badge
                        variant={item.tipoMovimiento === "DB" ? "destructive" : "default"}
                        className={
                          item.tipoMovimiento === "DB"
                            ? "bg-blue-50 text-blue-700 hover:bg-blue-50/80 dark:bg-blue-950/30 dark:text-blue-400 border border-blue-200 dark:border-blue-900/50"
                            : "bg-emerald-50 text-emerald-700 hover:bg-emerald-50/80 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50"
                        }
                      >
                        {item.tipoMovimiento === "DB" ? "Débito (DB)" : "Crédito (CR)"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs font-semibold">
                      {formatCurrency(item.monto)}
                    </TableCell>
                    <TableCell>
                      {item.asientoGenerado ? (
                        <span className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                          <CheckCircle className="h-4 w-4" /> Registrado
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 font-medium animate-pulse">
                          <Clock className="h-4 w-4" /> Pendiente
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {/* Botón enviar a contabilidad */}
                        {!item.asientoGenerado ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEnviarContabilidad(item.id)}
                            disabled={procesando}
                            className="h-8 text-xs flex gap-1 items-center px-2.5 bg-slate-50 border-slate-200 hover:bg-slate-100 hover:text-slate-900 text-slate-700 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
                          >
                            {procesando ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <Send className="h-3 w-3" />
                            )}
                            Enviar Contab.
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled
                            className="h-8 text-xs text-slate-400 dark:text-slate-600"
                          >
                            Sincronizado
                          </Button>
                        )}

                        {/* Botón eliminar */}
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={item.asientoGenerado}
                          onClick={() => handleDeleteClick(item)}
                          title={item.asientoGenerado ? "No se puede eliminar una transacción ya sincronizada" : "Eliminar"}
                          className="h-8 w-8 text-red-500 hover:text-red-700 disabled:opacity-30"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="h-32 text-center text-slate-500 dark:text-slate-400">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Info className="h-8 w-8 text-slate-400" />
                    <span>No se encontraron transacciones en CxC.</span>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Registrar Transacción Dialog */}
      <TransaccionDialog
        isOpen={isFormOpen}
        onOpenChange={setIsFormOpen}
        clientes={clientesActivos}
        tiposDocumento={tiposDocumentoActivos}
        onSuccess={refreshData}
      />

      {/* Confirmar Eliminación Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-red-600 dark:text-red-400 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" /> Confirmar Eliminación
            </DialogTitle>
            <DialogDescription>
              ¿Está seguro de que desea eliminar la transacción con documento{" "}
              <strong className="text-slate-900 dark:text-white">
                "{itemToDelete?.numeroDocumento}"
              </strong>{" "}
              de{" "}
              <strong className="text-slate-900 dark:text-white">
                {itemToDelete?.cliente.nombre}
              </strong>
              ? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeleteOpen(false)}
              disabled={isDeleting}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={confirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Eliminando..." : "Eliminar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
