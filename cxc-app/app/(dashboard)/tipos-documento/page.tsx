import { getTiposDocumento } from "@/features/tipos-documento/actions"
import { TipoDocumentoTable } from "@/features/tipos-documento/components/tipo-documento-table"

export const revalidate = 0 // Evitar el almacenamiento en caché estático, recargar siempre datos actualizados de la BD

export default async function TiposDocumentoPage() {
  const tiposDocumento = await getTiposDocumento()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          Tipos de Documento
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          Gestione los tipos de documentos comerciales que generan movimientos en las cuentas por cobrar.
        </p>
      </div>

      <TipoDocumentoTable initialData={tiposDocumento} />
    </div>
  )
}
