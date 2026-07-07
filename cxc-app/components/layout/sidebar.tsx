"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  ArrowRightLeft, 
  BookOpen, 
  Search 
} from "lucide-react"

const routes = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/",
  },
  {
    label: "Tipos de Documento",
    icon: FileText,
    href: "/tipos-documento",
  },
  {
    label: "Clientes",
    icon: Users,
    href: "/clientes",
  },
  {
    label: "Transacciones",
    icon: ArrowRightLeft,
    href: "/transacciones",
  },
  {
    label: "Asientos Contables",
    icon: BookOpen,
    href: "/asientos",
  },
  {
    label: "Consultas",
    icon: Search,
    href: "/consultas",
  },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="flex flex-col h-full bg-slate-900 text-slate-200 border-r border-slate-800">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-white tracking-tight">CxC System</h1>
      </div>
      <nav className="flex-1 px-4 space-y-2">
        {routes.map((route) => {
          const isActive = pathname === route.href || (pathname.startsWith(route.href) && route.href !== "/")
          return (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors text-sm font-medium",
                isActive 
                  ? "bg-slate-800 text-white" 
                  : "hover:bg-slate-800/50 hover:text-white"
              )}
            >
              <route.icon className="h-4 w-4" />
              {route.label}
            </Link>
          )
        })}
      </nav>
      <div className="p-4 border-t border-slate-800 text-xs text-slate-500 text-center">
        &copy; {new Date().getFullYear()} Cuentas por Cobrar
      </div>
    </div>
  )
}
