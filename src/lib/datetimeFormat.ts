export function formatJakartaTime(dateTime: string) {
  return new Date(dateTime).toLocaleString("id-ID", {
    timeZone: "Asia/Jakarta",
    hour12: true,
  });
}

export function utcToWIB(utcString: string): string {
  const normalized = utcString.includes("T")
    ? utcString
    : utcString.replace(" ", "T") + "Z";
  return formatJakartaTime(normalized);
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
