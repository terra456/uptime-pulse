import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useSelector } from "react-redux";
import { selectAuthModal } from "@/store/auth-slice";
import {
  useLoginUserMutation,
  useRegisterUserMutation,
} from "@/services/auth-api";

interface AuthFormProps {
  onClose: () => void; // Описываем функцию, которая ничего не возвращает
}

export function AuthForm({ onClose }: AuthFormProps) {
  const [isLoginMode, setIsLoginMode] = useState(true);

  // 2. Состояние для полей формы
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");

  // 3. Локальное состояние для отображения ошибок сервера
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 4. Подключаем мутации из RTK Query
  const [loginUser, { isLoading: isLoggingIn }] = useLoginUserMutation();
  const [registerUser, { isLoading: isRegistering }] =
    useRegisterUserMutation();

  const isLoading = isLoggingIn || isRegistering;

  const { reason } = useSelector(selectAuthModal);

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setErrorMessage(null); // Сбрасываем старые ошибки перед новым запросом

    if (!login.trim() || !password.trim()) {
      setErrorMessage("Пожалуйста, заполните все поля");
      return;
    }

    try {
      if (isLoginMode) {
        // Вызываем логин. Магия onQueryStarted в authApi сама запишет токены в Redux!
        // .unwrap() нужен, чтобы перехватить ошибку в блоке catch, если бэк вернет 400/401/500
        await loginUser({ login, password }).unwrap();

        // Сюда код дойдет ТОЛЬКО при успешном входе (статус 200)
        console.log("Успешный вход!");
        onClose();
      } else {
        // Вызываем регистрацию
        await registerUser({ login, password }).unwrap();

        // После успешной регистрации автоматически переключаем пользователя на форму Входа
        setIsLoginMode(true);
        setErrorMessage(null);
        toast.success("Регистрация успешна!", {
          description: "Теперь вы можете войти в свой аккаунт.",
        });
      }
    } catch (err: any) {
      // RTK Query возвращает ошибки в объекте `data` внутри поля `error`
      console.log(err.data.message);
      if (err?.data) {
        setErrorMessage(err.data.message || err.data.error); // Выводим текст ошибки, который написал наш Express-бэк
      } else {
        setErrorMessage("Что-то пошло не так. Попробуйте позже.");
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h1 className="text-2xl font-bold">
        {isLoginMode ? "Войти в аккаунт" : "Создать аккаунт"}
      </h1>
      {errorMessage && (
        <div className="text-center py-8 text-sm text-destructive bg-destructive/5 rounded-lg border border-destructive/10 p-4">
          {errorMessage}
        </div>
      )}
      {/* ЕСЛИ ПРИЧИНА ЕСТЬ — КРАСИВО ВЫВОДИМ ЕЁ, ИНАЧЕ СТАНДАРТНЫЙ ТЕКСТ */}
      <p className="text-sm text-amber-500 font-medium bg-amber-50 dark:bg-amber-950/30 p-2 rounded border border-amber-200/50">
        {reason
          ? reason
          : isLoginMode
            ? "Введите свои данные для входа"
            : "Заполните поля для регистрации"}
      </p>
      <div className="flex flex-col gap-1.5 text-left">
        <label className="text-sm font-medium">Логин</label>
        <Input
          id="login"
          type="text"
          placeholder="Ваш логин"
          value={login}
          onChange={(e) => setLogin(e.target.value)}
          disabled={isLoading}
        />
      </div>
      <div className="flex flex-col gap-1.5 text-left">
        <label className="text-sm font-medium">Пароль</label>
        <Input
          id="password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isLoading}
        />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button variant="outline" onClick={onClose}>
          Отмена
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading
            ? "Загрузка..."
            : isLoginMode
              ? "Войти"
              : "Зарегистрироваться"}
        </Button>
      </div>
      <div className="text-center text-sm">
        <button
          type="button"
          onClick={() => {
            setIsLoginMode(!isLoginMode);
            setErrorMessage(null); // Чистим ошибки при смене режима
          }}
          className="text-blue-500 hover:underline bg-transparent border-none p-0 cursor-pointer"
          disabled={isLoading}
        >
          {isLoginMode
            ? "Нет аккаунта? Зарегистрироваться"
            : "Уже есть аккаунт? Войти"}
        </button>
      </div>
    </form>
  );
}
