"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useTheme } from "./theme-provider"

const themes = [
  { value: "indigo", label: "Indigo Classic" },
  { value: "ocean", label: "Ocean Breeze" },
  { value: "sunset", label: "Sunset Glow" },
  { value: "forest", label: "Forest Green" },
  { value: "purple", label: "Purple Haze" },
]

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme()

  return (
    <Select value={theme} onValueChange={value => setTheme(value as any)}>
      <SelectTrigger className="w-[180px] bg-card border-border">
        <SelectValue placeholder="Select theme" />
      </SelectTrigger>
      <SelectContent>
        {themes.map(themeOption => (
          <SelectItem key={themeOption.value} value={themeOption.value}>
            {themeOption.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
