import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/footer";
import { ThemeProvider } from "@/components/theme-provider";

export default function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="uptime-pulse-theme">
      <div className="relative flex min-h-screen flex-col bg-background text-foreground">
        {/* Подключаем наш хедер */}
        <Header />

        {/* Главный контент страницы */}
        <main className="flex-1 mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
            Мониторинг, который не спит
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
            Следите за доступностью ваших сайтов и сервисов в реальном времени.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Button size="lg">Создать дашборд</Button>
            <Button size="lg" variant="outline">
              Документация
            </Button>
          </div>
        </main>

        <Footer />
      </div>
    </ThemeProvider>
  );
}
