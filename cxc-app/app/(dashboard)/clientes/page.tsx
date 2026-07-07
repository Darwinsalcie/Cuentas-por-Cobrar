import { getClientes } from "@/features/clientes/actions"
import { ClienteTable } from "@/features/clientes/components/cliente-table"

export const revalidate = 0 // Recargar datos frescos de la base de datos siempre

export default async function ClientesPage() {
  const clientes = await getClientes()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          Clientes
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          Administre la cartera de clientes, controle sus límites de crédito y visualice sus saldos actuales.
        </p>
      </div>

      <ClienteTable initialData={clientes} />
    </div>
  )
}
