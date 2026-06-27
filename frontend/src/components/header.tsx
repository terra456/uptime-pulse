import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { BaseModal } from "@/components/base-modal";

export function Header() {
  const [isServerModalOpen, setIsServerModalOpen] = useState(false);
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold tracking-tight text-foreground">
            UptimePulse
          </span>
        </div>

        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Button size="sm" onClick={() => setIsServerModalOpen(true)}>
            Войти
          </Button>
          <BaseModal
            isOpen={isServerModalOpen}
            onClose={() => setIsServerModalOpen(false)}
            title=""
            description=""
          >
            {/* Внутри может быть любая разметка или отдельный компонент формы */}
            <p>На данном этапе регистрация не требуется</p>
          </BaseModal>
        </div>
      </div>
    </header>
  );
}
