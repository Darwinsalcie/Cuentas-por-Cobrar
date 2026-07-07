import { getTransacciones } from "@/features/transacciones/actions"
import { getClientes } from "@/features/clientes/actions"
import { getTiposDocumento } from "@/features/tipos-documento/actions"
import { TransaccionTable } from "@/features/transacciones/components/transaccion-table"

export const revalidate = 0 // Cargar siempre datos frescos

export default async function TransaccionesPage() {
  const [transacciones, clientes, tiposDocumento] = await Promise.all([
    getTransacciones(),
    getClientes(),
    getTiposDocumento(),
  ])

  // Filtrar solo los registros activos para la creación de nuevas transacciones
  const clientesActivos = clientes
    .filter((c) => c.estado === "ACTIVO")
    .map((c) => ({
      id: c.id,
      nombre: c.nombre,
      cedula: c.cedula,
      limiteCredito: c.limiteCredito,
      saldo: c.saldo,
      limiteDisponible: c.limiteDisponible,
    }))

  const tiposDocumentoActivos = tiposDocumento
    .filter((td) => td.estado === "ACTIVO")
    .map((td) => ({
      id: td.id,
      descripcion: td.descripcion,
      cuentaContable: td.cuentaContable,
    }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          Transacciones (CxC)
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          Registre movimientos de débito (cargos) y crédito (abonos) para las cuentas por cobrar, y envíelos a contabilidad.
        </p>
      </div>

      <TransaccionTable
        initialData={transacciones as any}
        clientesActivos={clientesActivos}
        tiposDocumentoActivos={tiposDocumentoActivos}
      />
    </div>
  )
}
