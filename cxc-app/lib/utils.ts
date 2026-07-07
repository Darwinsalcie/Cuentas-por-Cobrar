import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatearCedula(cedula: string) {
  const limpia = cedula.replace(/-/g, "")
  if (limpia.length === 11) {
    return `${limpia.slice(0, 3)}-${limpia.slice(3, 10)}-${limpia.slice(10)}`
  }
  return cedula
}
