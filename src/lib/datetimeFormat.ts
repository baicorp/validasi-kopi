export function formatLocalTime(dateTime: string) {
  return new Date(dateTime).toLocaleString("id-ID", {
    timeZone: "Asia/Jakarta",
    hour12: true,
  });
}

export function getDurationString(start: string, end: string): string {
  const startDate = new Date(start);
  const endDate = new Date(end);

  const diffMs = endDate.getTime() - startDate.getTime();
  if (diffMs < 0) return "Waktu tidak valid";

  const totalMinutes = Math.floor(diffMs / 1000 / 60);
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;

  let result = "";
  if (days > 0) result += `${days} hari `;
  if (hours > 0) result += `${hours} jam `;
  if (minutes > 0) result += `${minutes} menit`;

  return result.trim();
}

export function wibInputToUtcISOString(date: string, time: string) {
  // date: MM/DD/YYYY
  // time: HH:mm:ss

  const [month, day, year] = date.split("/").map(Number);
  const [hour, minute, second] = time.split(":").map(Number);

  // WIB = UTC+7 → subtract 7 hours
  const utcDate = new Date(
    Date.UTC(year, month - 1, day, hour - 7, minute, second),
  );

  return utcDate.toISOString();
}
