import type {
  ChatMessage,
  Material,
  ProgressEntry,
  Worker,
} from "../ProjectDataContext";

function downloadCSV(csvContent: string, filename: string): void {
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function escapeCsv(val: string | number | undefined | null): string {
  const s = String(val ?? "");
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function csvRow(cells: (string | number | undefined | null)[]): string {
  return cells.map(escapeCsv).join(",");
}

export function exportAttendanceCSV(
  workers: Worker[],
  attendance: { workerId: string; date: string; present: boolean }[],
  projectName: string,
): void {
  const header = csvRow([
    "Worker Name",
    "Skill",
    "Daily Rate (INR)",
    "Days Present",
    "Total Wages (INR)",
    "Status",
  ]);

  const rows = workers.map((w) => {
    const days = attendance.filter(
      (a) => a.workerId === w.id && a.present,
    ).length;
    const totalWages = days * w.dailyWageRate;
    return csvRow([
      w.name,
      w.skill,
      w.dailyWageRate,
      days,
      totalWages,
      w.status,
    ]);
  });

  const csv = [header, ...rows].join("\n");
  const date = new Date().toISOString().slice(0, 10);
  downloadCSV(csv, `${projectName}_Attendance_${date}.csv`);
}

export function exportMaterialsCSV(
  materials: Material[],
  projectName: string,
): void {
  const header = csvRow([
    "Name",
    "Unit",
    "Current Stock",
    "Reorder Level",
    "Unit Price (INR)",
    "Total Value (INR)",
    "Supplier",
    "Status",
  ]);

  const sorted = [...materials].sort((a, b) => a.name.localeCompare(b.name));

  const rows = sorted.map((m) => {
    const status =
      m.currentStock <= m.reorderLevel * 0.5
        ? "Critical"
        : m.currentStock <= m.reorderLevel
          ? "Low"
          : "OK";
    return csvRow([
      m.name,
      m.unit,
      m.currentStock,
      m.reorderLevel,
      m.unitPrice,
      m.currentStock * m.unitPrice,
      m.supplier,
      status,
    ]);
  });

  const csv = [header, ...rows].join("\n");
  const date = new Date().toISOString().slice(0, 10);
  downloadCSV(csv, `${projectName}_Materials_${date}.csv`);
}

export function exportProgressCSV(
  progressHistory: ProgressEntry[],
  projectName: string,
  currentPercent: number,
): void {
  const header = csvRow(["Date", "Completion %", "Notes", "Updated By"]);

  const rows = progressHistory.map((p) =>
    csvRow([p.date, p.percentage, p.notes, p.by]),
  );

  // Append current summary row if not already present
  const summaryRow = csvRow(["Current", currentPercent, "Latest snapshot", ""]);
  const csv = [header, ...rows, summaryRow].join("\n");
  const date = new Date().toISOString().slice(0, 10);
  downloadCSV(csv, `${projectName}_Progress_${date}.csv`);
}

export function exportChatCSV(
  messages: ChatMessage[],
  projectName: string,
): void {
  const header = csvRow(["Timestamp", "Sender Name", "Role", "Message"]);

  const rows = messages.map((m) =>
    csvRow([
      new Date(m.timestamp).toLocaleString(),
      m.senderName,
      m.senderRole,
      m.text,
    ]),
  );

  const csv = [header, ...rows].join("\n");
  const date = new Date().toISOString().slice(0, 10);
  downloadCSV(csv, `${projectName}_Chat_${date}.csv`);
}
