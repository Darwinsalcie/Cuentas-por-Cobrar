"use client"

import { useState } from "react"
import { Search, Edit, Trash2, Plus, Info } from "lucide-react"
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
import { TipoDocumentoDialog } from "./tipo-documento-dialog"
import { deleteTipoDocumento } from "../actions"

interface TipoDocumento {
  id: string
  descripcion: string
  cuentaContable: string
  estado: string
  createdAt: Date
  updatedAt: Date
}

interface TipoDocumentoTableProps {
  initialData: TipoDocumento[]
}

export function TipoDocumentoTable({ initialData }: TipoDocumentoTableProps) {
  const [data, setData] = useState<TipoDocumento[]>(initialData)
  const [searchTerm, setSearchTerm] = useState("")

  // Estados de modales
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<TipoDocumento | null>(null)
  
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<TipoDocumento | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Refrescar datos (al usar Server Actions, podemos llamar a getTiposDocumento o actualizar el estado directamente para una UI instantánea)
  // En Next.js, Server Actions con revalidatePath refrescan las Server Components.
  // Pero al usar componentes interactivos cliente, podemos actualizar el estado local o usar router.refresh() de next/navigation.
  // Vamos a usar `window.location.reload()` o simplemente actualizar el estado local para máxima fluidez,
  // y también revalidar en el servidor (que ya se hace en la acción).
  // Para hacerlo óptimo y simple, podemos forzar un refresh usando router.refresh() si importamos useRouter de next/navigation,
  // o podemos actualizar el estado local.
  // Implementemos actualización de estado local tras las acciones exitosas para una respuesta inmediata de la interfaz,
  // y además revalidar con Server Actions.
  
  const refreshData = async () => {
    // Al ser un component client, importamos dinámicamente la acción para obtener la lista actualizada.
    const { getTiposDocumento } = await import("../actions")
    const list = await getTiposDocumento()
    setData(list)
  }

  // Filtrar
  const filteredData = data.filter((item) =>
    item.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.cuentaContable.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleEdit = (item: TipoDocumento) => {
    setSelectedItem(item)
    setIsFormOpen(true)
  }

  const handleCreate = () => {
    setSelectedItem(null)
    setIsFormOpen(true)
  }

  const handleDeleteClick = (item: TipoDocumento) => {
    setItemToDelete(item)
    setIsDeleteOpen(true)
  }

  const confirmDelete = async () => {
    if (!itemToDelete) return
    setIsDeleting(true)
    try {
      const res = await deleteTipoDocumento(itemToDelete.id)
      if (res.success) {
        toast.success("Tipo de documento eliminado con éxito")
        await refreshData()
        setIsDeleteOpen(false)
        setItemToDelete(null)
      } else {
        toast.error(res.error || "No se pudo eliminar el tipo de documento.")
      }
    } catch (err) {
      toast.error("Ocurrió un error al intentar eliminar.")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Barra de herramientas */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 dark:text-slate-500" />
          <Input
            placeholder="Buscar por descripción o cuenta contable..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button onClick={handleCreate} className="flex gap-2 items-center">
          <Plus className="h-4 w-4" />
          Nuevo Tipo de Documento
        </Button>
      </div>

      {/* Tabla */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Descripción</TableHead>
              <TableHead>Cuenta Contable</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="w-[100px] text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length > 0 ? (
              filteredData.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium text-slate-900 dark:text-white">
                    {item.descripcion}
                  </TableCell>
                  <TableCell className="font-mono text-xs">{item.cuentaContable}</TableCell>
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
                <TableCell colSpan={4} className="h-32 text-center text-slate-500 dark:text-slate-400">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Info className="h-8 w-8 text-slate-400" />
                    <span>No se encontraron tipos de documento.</span>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Diálogo del Formulario (Crear/Editar) */}
      <TipoDocumentoDialog
        isOpen={isFormOpen}
        onOpenChange={setIsFormOpen}
        tipoDocumento={selectedItem}
        onSuccess={refreshData}
      />

      {/* Diálogo de Confirmación de Eliminación */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-red-600 dark:text-red-400">Confirmar Eliminación</DialogTitle>
            <DialogDescription>
              ¿Está seguro de que desea eliminar el tipo de documento{" "}
              <strong className="text-slate-900 dark:text-white">
                "{itemToDelete?.descripcion}"
              </strong>
              ? Esta acción no se puede deshacer y fallará si hay transacciones registradas con este tipo.
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
