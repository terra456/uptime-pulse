export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-border bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            &copy; {currentYear} UptimePulse. Все права защищены.
          </p>
          <div className="flex space-x-6 text-xs text-muted-foreground">
            <a href="#" className="transition-colors hover:text-foreground">
              ссылка на гитхаб
            </a>
          </div>
        </div>
        {/* Нижняя плашка с копирайтом */}
      </div>
    </footer>
  );
}
