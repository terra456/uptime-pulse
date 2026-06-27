import { useEffect, useState } from "react";
import type { ServerData, ServerFormFields } from "@/types/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAddNewServerMutation, useEditServerMutation } from "@/services/api";

interface AddServerFormProps {
  initialData: ServerData | null;
  onClose: () => void; // Описываем функцию, которая ничего не возвращает
}

export function AddServerForm({ initialData, onClose }: AddServerFormProps) {
  const [formData, setFormData] = useState<ServerFormFields>({
    name: "",
    url: "",
    interval: "5", // значение по умолчанию
  });

  const [addNewServer, { isLoading }] = useAddNewServerMutation();
  const [updateServer, updateStatus] = useEditServerMutation();

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        url: initialData.url,
        interval: "5", // Если в данных сервера есть интервал, берем его
      });
    } else {
      // Если это создание — сбрасываем в дефолт
      setFormData({ name: "", url: "", interval: "5" });
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

  const handleSubmit = (e: React.SubmitEvent) => {
    e.preventDefault();
    console.log("Отправляем данные формы:", formData);
    try {
      initialData
        ? updateServer({ id: initialData.id, ...formData })
        : addNewServer(formData);
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
