import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  selectIsAuthenticated,
  selectCurrentUser,
  logOut,
  selectAuthModal,
  openAuthModal,
  closeAuthModal,
} from "@/store/auth-slice";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { BaseModal } from "@/components/base-modal";
import { AuthForm } from "./auth-form";
import { useLogoutUserMutation } from "@/services/auth-api";
import { toast } from "sonner";

export function Header() {
  const dispatch = useDispatch();

  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectCurrentUser);

  // const [isServerModalOpen, setIsServerModalOpen] = useState(false);
  const { isOpen } = useSelector(selectAuthModal);

  const [logoutUser, { isLoading }] = useLogoutUserMutation();

  const handleLogout = async () => {
    const refreshToken = localStorage.getItem("refreshToken");

    try {
      if (refreshToken) {
        // Отправляем запрос на бэк для удаления сессии из Postgres
        await logoutUser({ refreshToken }).unwrap();
      }
    } catch (err: any) {
      console.error("Не удалось удалить сессию на сервере:", err);
      toast.success("Не удалось удалить сессию на сервере:", {
        description: err?.message || "Что-то пошло не так",
      });
    } finally {
      // В любом случае очищаем Redux-стейт и localStorage на фронтенде
      dispatch(logOut());
      // Здесь можно сделать редирект на главную страницу, если нужно:
      // navigate('/');
    }
  };

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
          {isAuthenticated ? (
            <>
              {/* Если вошел — показываем его логин и кнопку Выйти */}
              <span className="text-sm text-muted-foreground hidden sm:inline">
                Привет,{" "}
                <span className="font-medium text-foreground">
                  {user?.login}
                </span>
              </span>
              <Button
                variant="outline"
                onClick={() => dispatch(logOut())}
                disabled={isLoading}
              >
                {isLoading ? "Выход..." : "Выйти"}
              </Button>
            </>
          ) : (
            /* Если не вошел — показываем кнопку Войти */
            // <Button onClick={() => setIsServerModalOpen(true)}>Войти</Button>
            <Button onClick={() => dispatch(openAuthModal())}>Войти</Button>
          )}

          <BaseModal
            isOpen={isOpen}
            onClose={() => dispatch(closeAuthModal())}
            title=""
            description=""
          >
            {/* Внутри может быть любая разметка или отдельный компонент формы */}
            <AuthForm onClose={() => dispatch(closeAuthModal())} />
          </BaseModal>
        </div>
      </div>
    </header>
  );
}
