// Importação da biblioteca clsx para combinar classes condicionalmente
import { clsx, type ClassValue } from "clsx";
// Importação da biblioteca tailwind-merge para mesclar classes do Tailwind CSS
import { twMerge } from "tailwind-merge";

// Função utilitária para combinar e mesclar classes CSS
// Esta função é muito útil para combinar classes condicionalmente e resolver conflitos do Tailwind
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
