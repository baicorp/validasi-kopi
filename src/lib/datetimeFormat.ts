export function formatLocalTime(dateTime: string) {
  return new Date(dateTime).toLocaleString();
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
  if (hours > 0 || days > 0) result += `${hours} jam `;
  result += `${minutes} menit`;

  return result.trim();
}
