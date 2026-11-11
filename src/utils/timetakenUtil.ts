// src/utils/timeUtils.ts

export default function calculateTimeTaken(
  startTime: string | Date,
  endTime?: string | Date
): string {
  if (!endTime) return "-";

  const start = new Date(startTime);
  const end = new Date(endTime);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) return "-";
  if (end.getTime() < start.getTime()) return "-";

  let diffMs = end.getTime() - start.getTime();

  const totalSeconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  const remHours = hours % 24;
  const remMinutes = minutes % 60;
  const remSeconds = totalSeconds % 60;

  let result = [];

  if (days > 0) result.push(`${days} day${days > 1 ? "s" : ""}`);
  if (remHours > 0) result.push(`${remHours} hr${remHours > 1 ? "s" : ""}`);
  if (remMinutes > 0) result.push(`${remMinutes} min${remMinutes > 1 ? "s" : ""}`);

  // Always show seconds, even if it's the only value
  if (remSeconds >= 0) result.push(`${remSeconds} sec${remSeconds > 1 ? "s" : ""}`);

  return result.join(" ");
}
