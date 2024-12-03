// app/components/ThemeSwitch.tsx
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils";
import {
  Sun,
  Moon
} from 'lucide-react';

interface DarkModeBtnProps {
  className?: string;
  outline?: boolean;
  hoverFill?: boolean;
}

export default function DarkModeBtn({ className, outline = true, hoverFill = true }: DarkModeBtnProps) {
  const { systemTheme, theme, setTheme } = useTheme()
  const currentTheme = theme === "system" ? systemTheme : theme

  const toggleTheme = () => {
    setTheme(currentTheme === 'dark' ? 'light' : 'dark')
  }

  return (
    <button
      className={cn("inline-flex items-center justify-center whitespace-nowrap",
        "text-sm font-medium ring-offset-background",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        "focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        "w-10 h-10",
        className,
        outline && "border border-input rounded-full",
        hoverFill && "hover:bg-accent hover:text-accent-foreground"
      )}
      onClick={toggleTheme}
    >
      <Moon className="w-5 h-5 rotate-90 scale-0 transition-transform ease-in-out duration-500 dark:rotate-0 dark:scale-100" />
      <Sun className="absolute w-5 h-5 rotate-0 scale-100 transition-transform ease-in-out duration-500 dark:-rotate-90 dark:scale-0" />
    </button>
  )
}
