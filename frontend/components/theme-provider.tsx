"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

type Theme = "indigo" | "ocean" | "sunset" | "forest" | "purple"

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("indigo")

  useEffect(() => {
    const root = document.documentElement
    if (theme === "indigo") {
      root.removeAttribute("data-theme")
    } else {
      root.setAttribute("data-theme", theme)
    }
  }, [theme])

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}
