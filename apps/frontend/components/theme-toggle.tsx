"use client"

import * as React from "react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import { Moon, Sun } from "lucide-react"

export function ModeToggle() {
  const { setTheme, theme, resolvedTheme } = useTheme()

  React.useEffect(() => {
    console.log('Current Theme:', theme)
    console.log('Resolved Theme:', resolvedTheme)
    
    // Add or remove dark class manually if needed
    if (resolvedTheme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [theme, resolvedTheme])

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark"
    // console.log('Switching to:', newTheme)
    setTheme(newTheme)
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="h-9 w-9 hover:bg-muted/80 rounded-full"
    >
      { resolvedTheme === "dark" ? <Sun className="text-yellow-500" /> : <Moon className="text-blue-500" /> }
    </Button>
  )
}
