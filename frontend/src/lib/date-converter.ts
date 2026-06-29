export const dateConverter = (data: string | Date) => {
  const date = new Date(data);
  return date.toLocaleString("ru-RU", { timeZone: "UTC" })
}