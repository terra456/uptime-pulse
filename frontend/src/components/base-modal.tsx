import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Описываем типы для нашего универсального окна
interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode; // Сюда будут вставляться любые формы и данные
  size?: "md" | "lg" | "xl";
}

export function BaseModal({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = "md", // по умолчанию обычный размер
}: BaseModalProps) {
  const sizeClasses = {
    md: "sm:max-w-[425px]",
    lg: "sm:max-w-[640px]",
    xl: "sm:max-w-[800px]", // Идеально для широких таблиц
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className={`${sizeClasses[size]} w-[95vw] max-h-[85vh] flex flex-col p-6`}
      >
        <DialogHeader className="shrink-0">
          <DialogTitle className="text-xl font-semibold">{title}</DialogTitle>
          {description && (
            <DialogDescription className="text-muted-foreground">
              {description}
            </DialogDescription>
          )}
        </DialogHeader>

        {/* Контентное содержимое */}
        <div className="flex-1 overflow-y-auto overflow-x-auto mt-4 pr-1">
          {children}
        </div>
      </DialogContent>
    </Dialog>
  );
}
