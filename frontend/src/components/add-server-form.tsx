import { useEffect, useState } from "react";
import type { ServerData, ServerFormFields } from "@/types/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAddNewServerMutation, useEditServerMutation } from "@/services/api";
import { Switch } from "./ui/switch";

interface AddServerFormProps {
  initialData: ServerData | null;
  onClose: () => void; // Описываем функцию, которая ничего не возвращает
}

export function AddServerForm({ initialData, onClose }: AddServerFormProps) {
  const [formData, setFormData] = useState<ServerFormFields>({
    name: "",
    url: "",
    interval: "1", // значение по умолчанию
    isActive: true,
  });

  const [addNewServer, { isLoading }] = useAddNewServerMutation();
  const [updateServer, updateStatus] = useEditServerMutation();

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        url: initialData.url,
        interval: (initialData.interval / 60).toString(), // Если в данных сервера есть интервал, берем его
        isActive: initialData.isActive,
      });
    } else {
      // Если это создание — сбрасываем в дефолт
      setFormData({
        name: "",
        url: "",
        interval: "1",
        isActive: true,
      });
    }
  }, [initialData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev, // копируем старые поля
      [name]: value, // обновляем только то поле, у которого совпал атрибут name
    }));
  };

  const handleSwitchChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, isActive: checked }));
  };

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    console.log("Отправляем данные формы:", formData);
    try {
      initialData
        ? await updateServer({ id: initialData.id, ...formData }).unwrap()
        : await addNewServer(formData).unwrap();
    } catch (e) {
      console.error("Failed to save the server: ");
    } finally {
      onClose();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex flex-col gap-1.5 text-left">
        <label className="text-sm font-medium">Название проекта</label>
        <Input
          type="text"
          name="name" // Важно: имя совпадает с ключом в стейте
          placeholder="Мой блог"
          value={formData.name}
          onChange={handleChange}
        />
      </div>
      <div className="flex flex-col gap-1.5 text-left">
        <label className="text-sm font-medium">URL / IP адрес</label>
        <Input
          type="text"
          name="url" // Важно: имя совпадает с ключом в стейте
          placeholder="https://example.com"
          value={formData.url}
          onChange={handleChange}
        />
      </div>
      {/* ИНПУТ ДЛЯ ИНТЕРВАЛА СКАНИРОВАНИЯ */}
      <div className="flex flex-col gap-1.5 text-left">
        <div className="flex justify-between items-center">
          <label className="text-sm font-medium">Интервал проверки</label>
          <span className="text-xs text-muted-foreground">в минутах</span>
        </div>
        <Input
          type="number" // Включает стрелочки больше/меньше в браузере
          name="interval"
          min={1} // Ограничение: не чаще, чем раз в 1минуту
          max={24 * 60} // Ограничение: не реже, чем раз в сутки
          value={formData.interval} // Избавляемся от лишних нулей при очистке поля
          onChange={handleChange} // Используем числовой обработчик
        />
        <p className="text-[11px] text-muted-foreground">
          Рекомендуется указывать значения от 1 до 60 минут.
        </p>
      </div>
      <div className="flex items-center gap-5 rounded-lg border border-border p-3 bg-muted/20">
        <label
          htmlFor="activation-toggle"
          className="text-sm font-medium text-foreground"
        >
          Запустить сканирование
        </label>
        <Switch
          id="notify-toggle"
          checked={formData.isActive}
          onCheckedChange={handleSwitchChange}
        />
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button variant="outline" onClick={onClose}>
          Отмена
        </Button>
        <Button type="submit" disabled={isLoading || updateStatus.isLoading}>
          {initialData ? "Сохранить изменения" : "Запустить мониторинг"}
        </Button>
      </div>
    </form>
  );
}
