import prisma from "@/lib/prisma"
import { Users, FileText, ArrowUpRight, ArrowDownRight, BadgePercent, CheckCircle, Clock, Info } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import Link from "next/link"

export const revalidate = 0 // Recargar siempre datos frescos de la BD

export default async function DashboardPage() {
  // 1. Obtener conteo de clientes activos
  const clientesActivos = await prisma.cliente.count({
    where: { estado: "ACTIVO" },
  })

  // 2. Obtener últimas transacciones (5)
  const transaccionesRecientes = await prisma.transaccion.findMany({
    take: 5,
    orderBy: { fecha: "desc" },
    include: { cliente: true, tipoDocumento: true },
  })

  // 3. Obtener últimos asientos contables (5)
  const asientosRecientes = await prisma.asientoContable.findMany({
    take: 5,
    orderBy: { fechaAsiento: "desc" },
    include: { cliente: true },
  })

  // 4. Obtener todas las transacciones para cálculos agregados
  const todasTransacciones = await prisma.transaccion.findMany({
    include: { tipoDocumento: true },
  })

  // 5. Contar cantidad de asientos contables totales para el % de sincronización
  const totalAsientos = await prisma.asientoContable.count()

  // 6. Realizar cálculos financieros
  let totalDebitos = 0
  let totalCreditos = 0

  todasTransacciones.forEach((t) => {
    if (t.tipoMovimiento === "DB") {
      totalDebitos += t.monto
    } else if (t.tipoMovimiento === "CR") {
      totalCreditos += t.monto
    }
  })

  const saldoPorCobrar = totalDebitos - totalCreditos
  
  // Porcentaje de Sincronización
  const totalTrans = todasTransacciones.length
  const porcSincronizacion = totalTrans > 0 
    ? Math.min(Math.round((totalAsientos / totalTrans) * 100), 100) 
    : 0

  // 7. Preparar datos para el gráfico de los últimos 6 meses
  // Agrupar transacciones por mes de forma dinámica
  const ultimos6Meses: { nombreMes: string; debito: number; credito: number }[] = []
  const nombresMeses = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]
  
  const hoy = new Date()
  for (let i = 5; i >= 0; i--) {
    const d = new Date(hoy.getFullYear(), hoy.getMonth() - i, 1)
    ultimos6Meses.push({
      nombreMes: `${nombresMeses[d.getMonth()]} ${d.getFullYear().toString().slice(-2)}`,
      debito: 0,
      credito: 0,
    })
  }

  todasTransacciones.forEach((t) => {
    const fechaTrans = new Date(t.fecha)
    // Encontrar si pertenece a alguno de los 6 meses de la lista
    ultimos6Meses.forEach((mes) => {
      const [nombreMes, anioStr] = mes.nombreMes.split(" ")
      const mesIndex = nombresMeses.indexOf(nombreMes)
      const anioComp = 2000 + parseInt(anioStr)
      if (fechaTrans.getMonth() === mesIndex && fechaTrans.getFullYear() === anioComp) {
        if (t.tipoMovimiento === "DB") {
          mes.debito += t.monto
        } else if (t.tipoMovimiento === "CR") {
          mes.credito += t.monto
        }
      }
    })
  })

  // Obtener el valor máximo para escalar el gráfico de barras
  const maxMonto = Math.max(
    ...ultimos6Meses.map((m) => Math.max(m.debito, m.credito)),
    1000 // Fallback para evitar división por cero
  )

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
    <div className="space-y-8">
      {/* Encabezado */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Resumen General</h1>
        <p className="text-slate-500 dark:text-slate-400">
          Panel administrativo del control de Cuentas por Cobrar e integración de contabilidad.
        </p>
      </div>

      {/* Tarjetas de KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Balance por Cobrar */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <div className="flex items-center justify-between space-y-0 pb-2">
            <span className="text-sm font-medium text-slate-500">Saldo Pendiente CxC</span>
            <div className="rounded-full bg-slate-100 p-2 text-slate-600 dark:bg-slate-900 dark:text-slate-400">
              <ArrowUpRight className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold font-mono tracking-tight text-slate-900 dark:text-white">
              {formatCurrency(saldoPorCobrar)}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Debito total: {formatCurrency(totalDebitos)} | Credito: {formatCurrency(totalCreditos)}
            </p>
          </div>
        </div>

        {/* Clientes Activos */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <div className="flex items-center justify-between space-y-0 pb-2">
            <span className="text-sm font-medium text-slate-500">Clientes Activos</span>
            <div className="rounded-full bg-slate-100 p-2 text-slate-600 dark:bg-slate-900 dark:text-slate-400">
              <Users className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {clientesActivos}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Clientes habilitados para transacciones
            </p>
          </div>
        </div>

        {/* Porcentaje Sincronización */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <div className="flex items-center justify-between space-y-0 pb-2">
            <span className="text-sm font-medium text-slate-500">Sincronización Contable</span>
            <div className="rounded-full bg-slate-100 p-2 text-slate-600 dark:bg-slate-900 dark:text-slate-400">
              <BadgePercent className="h-4 w-4 text-violet-600 dark:text-violet-400" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {porcSincronizacion}%
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 mt-2">
              <div 
                className="bg-violet-600 h-1.5 rounded-full transition-all duration-500" 
                style={{ width: `${porcSincronizacion}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Volumen de Movimientos */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <div className="flex items-center justify-between space-y-0 pb-2">
            <span className="text-sm font-medium text-slate-500">Total Transacciones</span>
            <div className="rounded-full bg-slate-100 p-2 text-slate-600 dark:bg-slate-900 dark:text-slate-400">
              <FileText className="h-4 w-4 text-slate-600 dark:text-slate-300" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {totalTrans}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Movimientos registrados en CxC
            </p>
          </div>
        </div>
      </div>

      {/* Gráfico y Actividad Reciente */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        
        {/* Gráfico de Barras Elegante (CSS Puro) */}
        <div className="col-span-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950 flex flex-col justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">Comportamiento Financiero</h2>
            <p className="text-xs text-slate-500">Últimos 6 meses de Débitos (DB) vs Créditos (CR)</p>
          </div>

          <div className="mt-8 flex h-48 items-end justify-between px-2 gap-4">
            {ultimos6Meses.map((mes, idx) => {
              const debitoHeight = (mes.debito / maxMonto) * 100
              const creditoHeight = (mes.credito / maxMonto) * 100
              return (
                <div key={idx} className="flex flex-col items-center flex-1 h-full justify-end">
                  <div className="flex items-end justify-center w-full gap-1 h-40">
                    {/* Barra Débito */}
                    <div 
                      className="w-3 bg-blue-500 rounded-t transition-all duration-500 hover:opacity-85"
                      style={{ height: `${Math.max(debitoHeight, 2)}%` }}
                      title={`Débitos: ${formatCurrency(mes.debito)}`}
                    ></div>
                    {/* Barra Crédito */}
                    <div 
                      className="w-3 bg-emerald-500 rounded-t transition-all duration-500 hover:opacity-85"
                      style={{ height: `${Math.max(creditoHeight, 2)}%` }}
                      title={`Créditos: ${formatCurrency(mes.credito)}`}
                    ></div>
                  </div>
                  <span className="text-[10px] font-medium text-slate-400 mt-2 block whitespace-nowrap">
                    {mes.nombreMes}
                  </span>
                </div>
              )
            })}
          </div>

          <div className="mt-4 flex justify-center gap-6 text-xs text-slate-500 border-t border-slate-100 dark:border-slate-800 pt-3">
            <span className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-full bg-blue-500 block"></span>
              Cargos / Débitos (DB)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-full bg-emerald-500 block"></span>
              Abonos / Créditos (CR)
            </span>
          </div>
        </div>

        {/* Asientos Recientes */}
        <div className="col-span-3 rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950 flex flex-col justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">Asientos Recientes</h2>
            <p className="text-xs text-slate-500">Últimos movimientos sincronizados a Contabilidad</p>
          </div>

          <div className="mt-4 flex-1 space-y-4 overflow-y-auto max-h-[220px] pr-1">
            {asientosRecientes.length > 0 ? (
              asientosRecientes.map((asiento) => (
                <div key={asiento.id} className="flex justify-between items-start text-xs border-b border-slate-50 pb-2 dark:border-slate-900/50">
                  <div className="space-y-0.5 max-w-[70%]">
                    <p className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                      {asiento.descripcion}
                    </p>
                    <p className="text-[10px] text-slate-500">
                      Cliente: {asiento.cliente.nombre} | {formatDate(asiento.fechaAsiento)}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-semibold font-mono block">
                      {formatCurrency(asiento.montoAsiento)}
                    </span>
                    <span className={`text-[9px] font-bold ${asiento.tipoMovimiento === "DB" ? "text-blue-600" : "text-emerald-600"}`}>
                      {asiento.tipoMovimiento}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 py-12">
                <Info className="h-4 w-4 mr-1.5" /> No hay asientos registrados.
              </div>
            )}
          </div>

          <Link href="/asientos" className="text-xs text-violet-600 hover:text-violet-700 dark:text-violet-400 hover:underline text-center font-medium mt-3 block">
            Ver todos los asientos &rarr;
          </Link>
        </div>
      </div>

      {/* Tabla de Últimas Transacciones CxC */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">Últimas Transacciones</h2>
            <p className="text-xs text-slate-500">Últimos movimientos registrados en el módulo CxC</p>
          </div>
          <Link href="/transacciones" className="text-xs text-violet-600 hover:text-violet-700 dark:text-violet-400 hover:underline font-medium">
            Ver todas &rarr;
          </Link>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Tipo Documento</TableHead>
                <TableHead>Número</TableHead>
                <TableHead>Movimiento</TableHead>
                <TableHead className="text-right">Monto</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transaccionesRecientes.length > 0 ? (
                transaccionesRecientes.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="text-xs">{formatDate(t.fecha)}</TableCell>
                    <TableCell className="font-semibold text-slate-900 dark:text-white">
                      {t.cliente.nombre}
                    </TableCell>
                    <TableCell className="text-xs text-slate-500">{t.tipoDocumento.descripcion}</TableCell>
                    <TableCell className="font-mono text-xs">{t.numeroDocumento}</TableCell>
                    <TableCell>
                      <Badge
                        variant={t.tipoMovimiento === "DB" ? "destructive" : "default"}
                        className={
                          t.tipoMovimiento === "DB"
                            ? "bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400 border border-blue-200 dark:border-blue-900/50"
                            : "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50"
                        }
                      >
                        {t.tipoMovimiento === "DB" ? "DB" : "CR"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs font-semibold">
                      {formatCurrency(t.monto)}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-slate-400">
                    No hay transacciones recientes.
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
