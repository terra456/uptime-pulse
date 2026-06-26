import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Логотип */}
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold tracking-tight text-foreground">
            UptimePulse
          </span>
        </div>

        {/* Кнопки действий */}
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Button size="sm">Войти</Button>
        </div>
      </div>
    </header>
  );
}
