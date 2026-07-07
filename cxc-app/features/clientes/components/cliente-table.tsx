"use client"

import { useState } from "react"
import { Search, Edit, Trash2, Plus, Info, AlertTriangle } from "lucide-react"
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
import { ClienteDialog } from "./cliente-dialog"
import { deleteCliente } from "../actions"
import { formatearCedula } from "@/lib/utils"

interface Cliente {
  id: string
  nombre: string
  cedula: string
  limiteCredito: number
  estado: string
  saldo: number
  limiteDisponible: number
  createdAt: Date
  updatedAt: Date
}

interface ClienteTableProps {
  initialData: Cliente[]
}

export function ClienteTable({ initialData }: ClienteTableProps) {
  const [data, setData] = useState<Cliente[]>(initialData)
  const [searchTerm, setSearchTerm] = useState("")

  // Modales
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<Cliente | null>(null)

  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<Cliente | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const refreshData = async () => {
    const { getClientes } = await import("../actions")
    const list = await getClientes()
    setData(list)
  }

  // Filtrar por nombre o cédula
  const filteredData = data.filter((item) =>
    item.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.cedula.includes(searchTerm.replace(/-/g, ""))
  )

  const handleEdit = (item: Cliente) => {
    setSelectedItem(item)
    setIsFormOpen(true)
  }

  const handleCreate = () => {
    setSelectedItem(null)
    setIsFormOpen(true)
  }

  const handleDeleteClick = (item: Cliente) => {
    setItemToDelete(item)
    setIsDeleteOpen(true)
  }

  const confirmDelete = async () => {
    if (!itemToDelete) return
    setIsDeleting(true)
    try {
      const res = await deleteCliente(itemToDelete.id)
      if (res.success) {
        toast.success("Cliente eliminado con éxito")
        await refreshData()
        setIsDeleteOpen(false)
        setItemToDelete(null)
      } else {
        toast.error(res.error || "No se pudo eliminar el cliente.")
      }
    } catch (err) {
      toast.error("Ocurrió un error al intentar eliminar.")
    } finally {
      setIsDeleting(false)
    }
  }

  // Formateador de moneda en pesos dominicanos (RD$)
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-DO", {
      style: "currency",
      currency: "DOP",
    }).format(value)
  }

  return (
    <div className="space-y-4">
      {/* Barra de herramientas */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 dark:text-slate-500" />
          <Input
            placeholder="Buscar por nombre o cédula..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button onClick={handleCreate} className="flex gap-2 items-center">
          <Plus className="h-4 w-4" />
          Nuevo Cliente
        </Button>
      </div>

      {/* Tabla */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Cédula</TableHead>
              <TableHead className="text-right">Límite Crédito</TableHead>
              <TableHead className="text-right">Saldo Actual</TableHead>
              <TableHead className="text-right">Disponible</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="w-[100px] text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length > 0 ? (
              filteredData.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium text-slate-900 dark:text-white">
                    {item.nombre}
                  </TableCell>
                  <TableCell className="font-mono text-xs">{formatearCedula(item.cedula)}</TableCell>
                  <TableCell className="text-right font-mono text-xs">
                    {formatCurrency(item.limiteCredito)}
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs text-slate-600 dark:text-slate-400">
                    {formatCurrency(item.saldo)}
                  </TableCell>
                  <TableCell
                    className={`text-right font-mono text-xs font-semibold ${
                      item.limiteDisponible < 0 ? "text-red-600 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400"
                    }`}
                  >
                    {formatCurrency(item.limiteDisponible)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={item.estado === "ACTIVO" ? "default" : "secondary"}
                      className={
                        item.estado === "ACTIVO"
                          ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-50/80 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-100/80 dark:bg-slate-800/50 dark:text-slate-400 border border-slate-200 dark:border-slate-800"
                      }
                    >
                      {item.estado === "ACTIVO" ? "Activo" : "Inactivo"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(item)}
                        title="Editar"
                      >
                        <Edit className="h-4 w-4 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteClick(item)}
                        title="Eliminar"
                      >
                        <Trash2 className="h-4 w-4 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-slate-500 dark:text-slate-400">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Info className="h-8 w-8 text-slate-400" />
                    <span>No se encontraron clientes.</span>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Formulario Dialog */}
      <ClienteDialog
        isOpen={isFormOpen}
        onOpenChange={setIsFormOpen}
        cliente={selectedItem}
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
              ¿Está seguro de que desea eliminar al cliente{" "}
              <strong className="text-slate-900 dark:text-white">
                "{itemToDelete?.nombre}"
              </strong>
              ? Esta acción no se puede deshacer y fallará si el cliente tiene transacciones o registros contables asociados.
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
