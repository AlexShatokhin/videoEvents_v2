import { format, fromUnixTime } from 'date-fns';

export function parseLocalDateTimeToUnix(dateTimeStr: string): number {
	const normalized = dateTimeStr.replace(' ', 'T');
	const [datePart, timePart = '00:00:00'] = normalized.split('T');
	const [year, month, day] = datePart.split('-').map(Number);
	const [hours, minutes, seconds = 0] = timePart.split(':').map(Number);
 
	const date = new Date(year, (month ?? 1) - 1, day ?? 1, hours ?? 0, minutes ?? 0, seconds);
	return Math.floor(date.getTime() / 1000);
}
 
export function formatTime(seconds: number): string {
	if (!Number.isFinite(seconds) || seconds <= 0) return '00:00:00';
	return format(fromUnixTime(seconds), 'HH:mm:ss');
}
 
export function formatDisplayTime(seconds: number): string {
	// 'yyyy-MM-dd HH:mm:ss' — формат, который ожидает нативный Hik SDK
	if (!Number.isFinite(seconds) || seconds <= 0) return '';
	return format(fromUnixTime(seconds), 'yyyy-MM-dd HH:mm:ss');
}
 