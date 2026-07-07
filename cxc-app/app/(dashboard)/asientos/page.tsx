import { getAsientosContables } from "@/features/asientos/actions"
import { AsientoTable } from "@/features/asientos/components/asiento-table"

export const revalidate = 0 // Cargar siempre datos frescos

export default async function AsientosPage() {
  const asientos = await getAsientosContables()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          Asientos Contables
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          Consulte los asientos contables sincronizados con el Diario General de Contabilidad y modifique su estado de auditoría.
        </p>
      </div>

      <AsientoTable initialData={asientos} />
    </div>
  )
}
