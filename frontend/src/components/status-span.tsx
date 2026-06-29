interface StatusSpanProps {
  status: "UP" | "DOWN" | "UNKNOWN";
}

export default function StatusSpan({ status }: StatusSpanProps) {
  // Маппер стилей для статусов. Oxlint проверит, чтобы все варианты были учтены.
  const statusStyles: Record<StatusSpanProps["status"], string> = {
    UP: "bg-green-500/10 text-green-500 border-green-500/20",
    UNKNOWN: "bg-yelow-500/10 text-yelow-500 border-yelow-500/20",
    DOWN: "bg-red-500/10 text-red-500 border-red-500/20",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold tracking-wide uppercase ${statusStyles[status]}`}
    >
      {status}
    </span>
  );
}
