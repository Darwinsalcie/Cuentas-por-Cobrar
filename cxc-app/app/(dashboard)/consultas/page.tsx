import { getTransacciones } from "@/features/transacciones/actions"
import { getClientes } from "@/features/clientes/actions"
import { getTiposDocumento } from "@/features/tipos-documento/actions"
import { ConsultaReporte } from "@/features/consultas/components/consulta-reporte"

export const revalidate = 0 // Evitar caché estático

export default async function ConsultasPage() {
  const [transacciones, clientes, tiposDocumento] = await Promise.all([
    getTransacciones(),
    getClientes(),
    getTiposDocumento(),
  ])

  // Adaptar para el componente
  const clientesSimplificados = clientes.map((c) => ({
    id: c.id,
    nombre: c.nombre,
    cedula: c.cedula,
  }))

  const tiposSimplificados = tiposDocumento.map((td) => ({
    id: td.id,
    descripcion: td.descripcion,
  }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          Consultas y Reportes
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          Filtre los movimientos de cuentas por cobrar por múltiples criterios y exporte los resultados en formato CSV.
        </p>
      </div>

      <ConsultaReporte
        transacciones={transacciones as any}
        clientes={clientesSimplificados}
        tiposDocumento={tiposSimplificados}
      />
    </div>
  )
}
