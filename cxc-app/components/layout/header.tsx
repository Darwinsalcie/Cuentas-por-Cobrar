"use client"

import { usePathname } from "next/navigation"
import { useTheme } from "@teispace/next-themes"
import { Menu, Sun, Moon, Laptop, User, LogOut, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Sidebar } from "./sidebar"

interface HeaderProps {
  onMenuClick?: () => void
}

const routeMap: Record<string, string> = {
  "": "Dashboard",
  "tipos-documento": "Tipos de Documento",
  "clientes": "Clientes",
  "transacciones": "Transacciones",
  "asientos": "Asientos Contables",
  "consultas": "Consultas",
}

export function Header() {
  const pathname = usePathname()
  const { setTheme, theme } = useTheme()

  // Generar Breadcrumbs basados en la ruta actual
  const segments = pathname.split("/").filter(Boolean)
  const breadcrumbs = segments.map((segment, index) => {
    const label = routeMap[segment] || segment
    return {
      label,
      href: "/" + segments.slice(0, index + 1).join("/"),
    }
  })

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/80 px-6 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/80">
      <div className="flex items-center gap-4">
        {/* Sidebar Trigger para Móvil */}
        <Sheet>
          <SheetTrigger
            render={
              <Button variant="ghost" size="icon" className="md:hidden" />
            }
          >
            <Menu className="h-5 w-5" />
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-72">
            <SheetHeader className="sr-only">
              <SheetTitle>Menú de Navegación</SheetTitle>
            </SheetHeader>
            <Sidebar />
          </SheetContent>
        </Sheet>

        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="hidden sm:flex">
          <ol className="flex items-center space-x-2 text-sm text-slate-500 dark:text-slate-400">
            <li>
              <span className="font-medium text-slate-900 dark:text-slate-100">CxC</span>
            </li>
            {breadcrumbs.length > 0 ? (
              breadcrumbs.map((crumb, idx) => (
                <li key={crumb.href} className="flex items-center space-x-2">
                  <span className="text-slate-400 dark:text-slate-600">/</span>
                  <span className={idx === breadcrumbs.length - 1 ? "font-semibold text-slate-950 dark:text-slate-50" : ""}>
                    {crumb.label}
                  </span>
                </li>
              ))
            ) : (
              <li className="flex items-center space-x-2">
                <span className="text-slate-400 dark:text-slate-600">/</span>
                <span className="font-semibold text-slate-950 dark:text-slate-50">Dashboard</span>
              </li>
            )}
          </ol>
        </nav>
      </div>

      <div className="flex items-center gap-3">
        {/* Selector de Tema */}
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="outline" size="icon" className="h-9 w-9 rounded-full" />
            }
          >
            <span>
              <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setTheme("light")}>
              <Sun className="mr-2 h-4 w-4" /> Light
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("dark")}>
              <Moon className="mr-2 h-4 w-4" /> Dark
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("system")}>
              <Laptop className="mr-2 h-4 w-4" /> System
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Menú de Usuario */}
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="ghost" className="relative h-9 w-9 rounded-full bg-slate-100 dark:bg-slate-800 p-0" />
            }
          >
            <User className="h-5 w-5 text-slate-600 dark:text-slate-300" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none text-slate-900 dark:text-slate-50">Prof. Integración</p>
                <p className="text-xs leading-none text-slate-500 dark:text-slate-400">admin@cxc.edu.do</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer">
              <Settings className="mr-2 h-4 w-4" />
              <span>Configuración</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600 cursor-pointer focus:bg-red-50 focus:text-red-600 dark:focus:bg-red-950/50 dark:focus:text-red-400">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Cerrar Sesión</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
