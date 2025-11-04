export function formatLocalTime(dateTime: string) {
  return new Date(dateTime).toLocaleString();
}
